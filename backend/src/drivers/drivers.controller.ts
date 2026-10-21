import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DriversService } from './drivers.service.js';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  findAll() {
    return this.driversService.findAll();
  }

  @Get('online')
  findOnline() {
    return this.driversService.findOnline();
  }

  @Post(':id/online')
  setOnline(@Param('id') id: string, @Body() body: { isOnline: boolean }) {
    return this.driversService.setOnline(Number(id), body.isOnline);
  }

  @Post(':id/service-type')
  setServiceType(
    @Param('id') id: string,
    @Body() body: { serviceType: string },
  ) {
    return this.driversService.setServiceType(Number(id), body.serviceType);
  }

  @Get('nearby')
  findNearby(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radiusKm') radiusKm?: string,
  ) {
    return this.driversService.findNearby(
      Number(latitude),
      Number(longitude),
      radiusKm ? Number(radiusKm) : 5,
    );
  }

  @Post(':id/location')
  updateLocation(
    @Param('id') id: string,
    @Body() body: { latitude: number; longitude: number },
  ) {
    return this.driversService.updateLocation(
      Number(id),
      body.latitude,
      body.longitude,
    );
  }

  @Post()
  create(
    @Body()
    body: {
      phone: string;
      name: string;
      carModel: string;
      carNumber: string;
    },
  ) {
    return this.driversService.create(
      body.phone,
      body.name,
      body.carModel,
      body.carNumber,
    );
  }
}
