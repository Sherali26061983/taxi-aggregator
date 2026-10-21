import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import postgres from '@prisma/orm-postgres/runtime';
import { readFileSync } from 'node:fs';
import type { Contract } from '../../prisma/contract.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly db = postgres<Contract>({
    url: process.env.DATABASE_URL!,
    contractJson: JSON.parse(
      readFileSync(
        new URL('../../prisma/contract.json', import.meta.url),
        'utf-8',
      ),
    ),
  });

  get orm() {
    return this.db.orm;
  }

  get sql() {
    return this.db.sql;
  }
  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
  return this.db.transaction(callback);
  }
  
  runtime() {
    return this.db.runtime();
  }

  async onModuleInit() {
    await this.db.connect();
  }

  async onModuleDestroy() {
    await this.db.close();
  }
}
