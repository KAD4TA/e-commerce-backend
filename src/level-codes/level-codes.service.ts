// src/level-code/level-code.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LevelCodes } from 'src/typeorm/level-codes.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LevelCodeService implements OnModuleInit {
  

  constructor(
    @InjectRepository(LevelCodes)
    private readonly levelCodeRepository: Repository<LevelCodes>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initializeLevelCodes();
  }

  async initializeLevelCodes(): Promise<void> {
  try {
    
    const codeCount = await this.levelCodeRepository.count();
    
    if (codeCount > 0) {
      
      return;
    }

    const normalCodes = Array.from({ length: 10 }, () => ({
      code: uuidv4(),
      level: 1,
      isActive: true,
    }));

    const superCodes = Array.from({ length: 10 }, () => ({
      code: uuidv4(),
      level: 2,
      isActive: true,
    }));

    const codes = [...normalCodes, ...superCodes];
    for (const code of codes) {
      
      await this.levelCodeRepository.save(this.levelCodeRepository.create(code));
    }

    
    
  } catch (error) {
    
    
    throw error;
  }
}
}