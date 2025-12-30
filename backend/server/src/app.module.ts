import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EstudiantesService } from './estudiantes/estudiantes.service';
import { BusGateway } from './bus/bus.gateway';
import { IngresoModule } from './ingreso/ingreso.module';

@Module({
  imports: [IngresoModule],
  controllers: [AppController],
  providers: [AppService, EstudiantesService, BusGateway],
})
export class AppModule {}
