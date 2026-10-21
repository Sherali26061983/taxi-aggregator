import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { DriversModule } from './drivers/drivers.module.js';
import { RidesModule } from './rides/rides.module.js';
import { MapsModule } from './maps/maps.module.js';
import { IntercityModule } from './intercity/intercity.module.js';

export const ObserveInstrument = undefined;

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, UsersModule, DriversModule, RidesModule, MapsModule, IntercityModule],
})
export class AppModule {}
