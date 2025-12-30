import { Test, TestingModule } from '@nestjs/testing';
import { BusGateway } from './bus.gateway';

describe('BusGateway', () => {
  let gateway: BusGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusGateway],
    }).compile();

    gateway = module.get<BusGateway>(BusGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
