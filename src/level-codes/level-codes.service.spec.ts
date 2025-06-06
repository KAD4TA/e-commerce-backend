import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LevelCodes } from 'src/typeorm/level-codes.entity';
import { LevelCodeService } from './level-codes.service';


describe('LevelCodeService', () => {
  let service: LevelCodeService;
  let repo: jest.Mocked<Repository<LevelCodes>>;

  beforeEach(async () => {
    const mockRepo: Partial<jest.Mocked<Repository<LevelCodes>>> = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LevelCodeService,
        {
          provide: getRepositoryToken(LevelCodes),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get(LevelCodeService);
    repo = module.get(getRepositoryToken(LevelCodes));
  });

  it('should call initializeLevelCodes on module init', async () => {
    const spy = jest
      .spyOn(service, 'initializeLevelCodes')
      .mockResolvedValueOnce();
    await service.onModuleInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should skip initialization if level codes already exist', async () => {
    repo.count.mockResolvedValue(20);

    await service.initializeLevelCodes();

    expect(repo.count).toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should create and save 20 codes if none exist', async () => {
    repo.count.mockResolvedValue(0);
    repo.create.mockImplementation((code) => code as LevelCodes);
    repo.save.mockResolvedValue({} as LevelCodes);

    await service.initializeLevelCodes();

    expect(repo.count).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledTimes(20);
    expect(repo.save).toHaveBeenCalledTimes(20);
  });

  it('should throw and log error if save fails', async () => {
    const error = new Error('Database failure');
    repo.count.mockResolvedValue(0);
    repo.create.mockImplementation((code) => code as LevelCodes);
    repo.save.mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await expect(service.initializeLevelCodes()).rejects.toThrow('Database failure');

    expect(consoleSpy).toHaveBeenCalledWith('Error logged:', 'Database failure');

    consoleSpy.mockRestore();
  });
});
