import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { RidesService } from "./rides.service.js";

@Controller("rides")
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Get()
  findAll(@Query("serviceType") serviceType?: string) {
    return this.ridesService.findAll(serviceType);
  }

  @Post()
  create(
    @Body()
    body: {
      userId: number;
      pickup: string;
      destination: string;
      serviceType?: string;
    },
  ) {
    return this.ridesService.create(
      body?.userId,
      body?.pickup,
      body?.destination,
      body?.serviceType,
    );
  }

  @Post(":id/complete")
  complete(@Param("id") id: string) {
    return this.ridesService.completeRide(Number(id));
  }

  @Post(":id/accept")
  accept(
    @Param("id") id: string,
    @Body() body: { driverId: number },
  ) {
    return this.ridesService.assignDriver(Number(id), body.driverId);
  }
}
