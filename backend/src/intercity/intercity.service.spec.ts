import { Test, TestingModule } from '@nestjs/testing';
import { IntercityService } from './intercity.service.js';

describe('IntercityService', () => {
  let service: IntercityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntercityService],
    }).compile();

    service = module.get<IntercityService>(IntercityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
