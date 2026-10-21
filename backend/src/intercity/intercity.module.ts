import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { IntercityService } from './intercity.service.js';
import { IntercityController } from './intercity.controller.js';
@Module({
  imports: [PrismaModule],
  providers: [IntercityService],
  controllers: [IntercityController],
})
export class IntercityModule {}
