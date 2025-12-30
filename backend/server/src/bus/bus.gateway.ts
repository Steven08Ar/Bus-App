import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class BusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('updateBusLocation')
  handleBusLocation(client: Socket, payload: { lat: number; lng: number; busId: string }): void {
    console.log(`Bus ${payload.busId} location update:`, payload);
    // Broadcast location to all subscribed clients (e.g., students)
    this.server.emit('busLocationUpdate', payload);
  }
}
