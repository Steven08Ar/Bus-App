import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

@WebSocketGateway({ cors: true })
export class BusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private prisma = new PrismaClient();
  private busLocationCache = new Map<string, { lat: number; lng: number; lastUpdate: number }>();
  private readonly DB_UPDATE_INTERVAL = 30000; // 30 seconds

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoute')
  handleJoinRoute(@ConnectedSocket() client: Socket, @MessageBody() routeId: string) {
    client.join(`route_${routeId}`);
    return { event: 'joinedRoute', data: routeId };
  }

  @SubscribeMessage('updateBusLocation')
  async handleBusLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { busId: number; lat: number; lng: number; routeId: string },
  ) {
    const { busId, lat, lng, routeId } = payload;
    const now = Date.now();

    // 1. Update Cache
    const lastCache = this.busLocationCache.get(String(busId));
    this.busLocationCache.set(String(busId), { lat, lng, lastUpdate: now });

    // 2. Broadcast to Room (Students on this route)
    this.server.to(`route_${routeId}`).emit('busLocationUpdate', payload);

    // 3. Throttle DB Writes
    if (!lastCache || now - lastCache.lastUpdate > this.DB_UPDATE_INTERVAL) {
      this.updateBusLocationInDB(busId, lat, lng);
    }

    // 4. Check Proximity to Next Stop (Geofence)
    this.checkProximityToStops(busId, lat, lng, routeId);
  }

  private async updateBusLocationInDB(busId: number, lat: number, lng: number) {
    try {
      await this.prisma.bus.update({
        where: { id: Number(busId) },
        data: { lat, lng, ultimaActualizacion: new Date() },
      });
    } catch (e) {
      console.error(`Error updating bus ${busId} location in DB`, e);
    }
  }

  private async checkProximityToStops(busId: number, lat: number, lng: number, routeId: string) {
    // Basic implementation: Find nearest stop. 
    // In production, use PostGIS: SELECT ... ST_DistanceSphere(...) < 50
    try {
      const paradas = await this.prisma.parada.findMany(); // optimizing this requires caching stops too

      for (const parada of paradas) {
        const distance = this.calculateDistance(lat, lng, parada.lat, parada.lng);
        if (distance < 50) { // 50 meters
          this.server.to(`route_${routeId}`).emit('nextStopApproaching', {
            busId,
            paradaId: parada.id,
            paradaNombre: parada.nombre,
          });
          break; // Notify only once or logic to avoid spam
        }
      }
    } catch (e) {
      console.error(`Error checking proximity for bus ${busId}`, e);
    }
  }

  // Haversine formula for naive distance calculation (in meters)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
