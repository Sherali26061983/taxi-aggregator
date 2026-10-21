import { Injectable } from "@nestjs/common";

@Injectable()
export class MapsService {
  async getRoute(
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number,
  ) {
    return {
      from: {
        latitude: fromLatitude,
        longitude: fromLongitude,
      },
      to: {
        latitude: toLatitude,
        longitude: toLongitude,
      },
      message: "Route service tayyor",
    };
  }
}
