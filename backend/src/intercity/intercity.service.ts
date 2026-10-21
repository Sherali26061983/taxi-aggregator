import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class IntercityService {
  constructor(private readonly prisma: PrismaService) {}

  async findRoutes() {
    const routes = await this.prisma.orm.public.IntercityRoute.all();
    return routes.filter((route) => route.isActive);
  }

  async createRoute(name: string, origin: string, destination: string) {
    const cleanName = name?.trim();
    const cleanOrigin = origin?.trim();
    const cleanDestination = destination?.trim();

    if (!cleanName || !cleanOrigin || !cleanDestination) {
      throw new BadRequestException(
        'Йўналиш номи, бошланиш ва манзил майдонлари тўлдирилиши керак.',
      );
    }

    if (cleanOrigin.toLowerCase() === cleanDestination.toLowerCase()) {
      throw new BadRequestException(
        'Бошланиш ва манзил бир хил бўлмаслиги керак.',
      );
    }

    return this.prisma.orm.public.IntercityRoute.create({
      name: cleanName,
      origin: cleanOrigin,
      destination: cleanDestination,
    });
  }
}
