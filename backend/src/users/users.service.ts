import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.orm.public.User.all();
  }

  async create(phone: string, name: string) {
    return this.prisma.orm.public.User.create({
      phone,
      name,
    });
  }
}
