import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type DriverServiceType = 'city' | 'intercity' | 'both';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.orm.public.Driver.all();
  }

  async setOnline(driverId: number, isOnline: boolean) {
    return this.prisma.orm.public.Driver
      .where({ id: driverId })
      .update({ isOnline });
  }

  async setServiceType(driverId: number, serviceType: string) {
    if (!['city', 'intercity', 'both'].includes(serviceType)) {
      throw new BadRequestException(
        'Хизмат тури city, intercity ёки both бўлиши керак.',
      );
    }

    return this.prisma.orm.public.Driver
      .where({ id: driverId })
      .update({ serviceType: serviceType as DriverServiceType });
  }

  async updateLocation(
    driverId: number,
    latitude: number,
    longitude: number,
  ) {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new BadRequestException('GPS координаталари нотўғри.');
    }

    return this.prisma.orm.public.Driver
      .where({ id: driverId })
      .update({ latitude, longitude });
  }

  async findOnline() {
    return this.prisma.orm.public.Driver
      .where({ isOnline: true })
      .all();
  }

  async findNearby(latitude: number, longitude: number, radiusKm = 5) {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180 ||
      !Number.isFinite(radiusKm) ||
      radiusKm <= 0
    ) {
      throw new BadRequestException('Координаталар ёки радиус нотўғри.');
    }

    const drivers = await this.prisma.orm.public.Driver
      .where({ isOnline: true })
      .all();

    return drivers
      .filter(
        (driver) =>
          driver.latitude !== null &&
          driver.longitude !== null,
      )
      .map((driver) => {
        const lat1 = (latitude * Math.PI) / 180;
        const lat2 = (driver.latitude! * Math.PI) / 180;
        const dLat = ((driver.latitude! - latitude) * Math.PI) / 180;
        const dLon = ((driver.longitude! - longitude) * Math.PI) / 180;

        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(dLon / 2) ** 2;

        const distanceKm =
          6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return {
          ...driver,
          distanceKm: Number(distanceKm.toFixed(2)),
        };
      })
      .filter((driver) => driver.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async create(
    phone: string,
    name: string,
    carModel: string,
    carNumber: string,
  ) {
    if (
      !phone?.trim() ||
      !name?.trim() ||
      !carModel?.trim() ||
      !carNumber?.trim()
    ) {
      throw new BadRequestException('Ҳайдовчи маълумотларини тўлиқ киритинг.');
    }

    return this.prisma.orm.public.Driver.create({
      phone: phone.trim(),
      name: name.trim(),
      carModel: carModel.trim(),
      carNumber: carNumber.trim(),
    });
  }
}
