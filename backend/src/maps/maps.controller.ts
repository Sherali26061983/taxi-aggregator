import { Controller, Get, Query } from '@nestjs/common';
import { MapsService } from './maps.service.js';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('route')
  getRoute(
    @Query('fromLatitude') fromLatitude: string,
    @Query('fromLongitude') fromLongitude: string,
    @Query('toLatitude') toLatitude: string,
    @Query('toLongitude') toLongitude: string,
  ) {
    return this.mapsService.getRoute(
      Number(fromLatitude),
      Number(fromLongitude),
      Number(toLatitude),
      Number(toLongitude),
    );
  }
}
