import { Body, Controller, Get, Post } from '@nestjs/common';
import { IntercityService } from './intercity.service.js';

@Controller('intercity')
export class IntercityController {
  constructor(private readonly intercityService: IntercityService) {}

  @Get('routes')
  findRoutes() {
    return this.intercityService.findRoutes();
  }

  @Post('routes')
  createRoute(
    @Body()
    body: {
      name: string;
      origin: string;
      destination: string;
    },
  ) {
    return this.intercityService.createRoute(
      body?.name,
      body?.origin,
      body?.destination,
    );
  }
}
