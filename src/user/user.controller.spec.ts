import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserResponseDto, UserResponseDtoWrapper } from 'src/common/dtos/responseDtos/user/user.response.dto';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AdminGuard } from 'src/guards/role.admin.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

 
  const mockUserDto: UserResponseDto = {
    id: 1,
    name: 'John',
    lastName: 'Doe',
    userImage: 'image.jpg',
    telephoneNumber: '123456789',
    email: 'john.doe@example.com',
  };

  const mockUserService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) 
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true }) 
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should call findAll and return users', async () => {
      // Arrange
      const mockResponse = new UserResponseDtoWrapper([mockUserDto], 'Users retrieved successfully', true);
      mockUserService.findAll.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getAllUsers();

      // Assert
      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUser', () => {
    it('should call findOne with correct id and return user', async () => {
      // Arrange
      const mockResponse = new UserResponseDtoWrapper([mockUserDto], 'User retrieved successfully', true);
      mockUserService.findOne.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getUser(1);

      // Assert
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteUser', () => {
    it('should call delete with correct parameters', async () => {
      // Arrange
      const mockRequest = { user: { id: 1, role: 'ADMIN' } };
      mockUserService.delete.mockResolvedValue(undefined);

      // Act
      await controller.deleteUser(1, mockRequest);

      // Assert
      expect(mockUserService.delete).toHaveBeenCalledWith(1, 1, 'ADMIN');
    });
  });
});