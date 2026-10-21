import { Test, TestingModule } from '@nestjs/testing';
import { IntercityController } from './intercity.controller.js';

describe('IntercityController', () => {
  let controller: IntercityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntercityController],
    }).compile();

    controller = module.get<IntercityController>(IntercityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
