import { Module } from '@nestjs/common';
import { RidesService } from './rides.service.js';
import { RidesController } from './rides.controller.js';

@Module({
  providers: [RidesService],
  controllers: [RidesController]
})
export class RidesModule {}
