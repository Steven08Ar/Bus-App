import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class EstudiantesService {
    private prisma = new PrismaClient();

    validarCodigo(codigo: string): boolean {
        const regex = /^U00\d+/;
        return regex.test(codigo);
    }

    async crearEstudiante(nombre: string, codigo: string) {
        if (!this.validarCodigo(codigo)) {
            throw new BadRequestException('El código del estudiante debe comenzar con U00');
        }
        return this.prisma.estudiante.create({
            data: {
                nombre,
                codigo,
            },
        });
    }
}
