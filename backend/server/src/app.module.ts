import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EstudiantesService } from './estudiantes/estudiantes.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, EstudiantesService],
})
export class AppModule {}
