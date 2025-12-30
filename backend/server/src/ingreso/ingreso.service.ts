import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class IngresoService {
  private prisma = new PrismaClient();

  async validarIngreso(busId: number, codigo: string) {
    const regex = /^U00\d+$/;
    if (!regex.test(codigo)) {
      await this.logIngreso(busId, codigo, false, 'Formato de código inválido');
      return { acceso: false, mensaje: 'Código inválido' };
    }

    const estudiante = await this.prisma.estudiante.findUnique({
      where: { codigo },
    });

    if (!estudiante) {
      await this.logIngreso(busId, codigo, false, 'Estudiante no encontrado');
      return { acceso: false, mensaje: 'Estudiante no registrado' };
    }

    if (!estudiante.activo) {
      await this.logIngreso(busId, codigo, false, 'Estudiante inactivo');
      return { acceso: false, mensaje: 'Estudiante inactivo' };
    }

    await this.logIngreso(busId, codigo, true, 'Acceso concedido', estudiante.id);
    return { acceso: true, mensaje: 'Bienvenido ' + estudiante.nombre };
  }

  private async logIngreso(busId: number, codigo: string, exitoso: boolean, mensaje: string, estudianteId?: number) {
    // In a real app, use a queue or buffer for logs to avoid main thread blocking
    try {
      await this.prisma.logsIngreso.create({
        data: {
          busId: Number(busId),
          codigo,
          exitoso,
          mensaje,
          estudianteId,
        },
      });
    } catch (e) {
      console.error("Error creating log", e);
    }
  }
}
