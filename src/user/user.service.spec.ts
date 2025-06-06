import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/typeorm';
import { Repository } from 'typeorm';
import { UserResponseDto, UserResponseDtoWrapper } from 'src/common/dtos/responseDtos/user/user.response.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { UserProfile } from 'src/mapping/user.mapping';
import { Role } from 'src/common/enums/role.enum';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<Users>;

  const mockUser: Users = {
    id: 1,
    name: 'John',
    lastName: 'Doe',
    userImage: 'image.jpg',
    telephoneNumber: '123456789',
    email: 'john.doe@example.com',
    password: 'hashedPassword',
    role: Role.CUSTOMER,
    refreshToken: undefined,
    customer: null,
    seller: null,
    admin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserDto: UserResponseDto = {
    id: 1,
    name: 'John',
    lastName: 'Doe',
    userImage: 'image.jpg',
    telephoneNumber: '123456789',
    email: 'john.doe@example.com',
  };

  const mockUsers: Users[] = [
    mockUser,
    {
      ...mockUser,
      id: 2,
      email: 'jane.doe@example.com',
    },
  ];

  let mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        UserService,
        UserProfile,
        {
          provide: getRepositoryToken(Users),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<Users>>(getRepositoryToken(Users));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return a list of users wrapped in UserResponseDtoWrapper', async () => {
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
      expect(result.message).toBe('Users retrieved successfully');
      expect(result.data[0].email).toBe('john.doe@example.com');
    });

    it('should return empty list when no users found', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(0);
      expect(result.message).toBe('Users retrieved successfully');
    });
  });

  describe('findOne', () => {
    it('should return one user wrapped in UserResponseDtoWrapper', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result.success).toBe(true);
      expect(result.data[0].email).toBe('john.doe@example.com');
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should allow admin to delete user', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1, 2, Role.ADMIN);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should allow user to delete own account', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1, 1, Role.CUSTOMER);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException when user tries to delete another user', async () => {
      await expect(service.delete(1, 2, Role.CUSTOMER)).rejects.toThrow(ForbiddenException);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if deletion affected 0 rows', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(1, 1, Role.ADMIN)).rejects.toThrow(NotFoundException);
    });
  });
});
