import { Controller, Post, Body } from '@nestjs/common';
import { IngresoService } from './ingreso.service';

@Controller('ingreso')
export class IngresoController {
  constructor(private readonly ingresoService: IngresoService) { }

  @Post('validar')
  validar(@Body() body: { busId: number; codigo: string }) {
    return this.ingresoService.validarIngreso(body.busId, body.codigo);
  }
}
