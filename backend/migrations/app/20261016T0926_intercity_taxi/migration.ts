#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/3db1160677480c28b64fedcb355bdcfbd288e23da480a958b4e949dd5b451515/contract.js';
import endContract from '../../snapshots/3db1160677480c28b64fedcb355bdcfbd288e23da480a958b4e949dd5b451515/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [];
  }
}

MigrationCLI.run(import.meta.url, M);
