import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Customers, Sellers, Users, Admins, LevelCodes } from 'src/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomerRegisterDto } from 'src/common/dtos/requestDtos/auth/customer.register.request.dto';
import { SellerRegisterDto } from 'src/common/dtos/requestDtos/auth/seller.register.request.dto';
import { AdminRegisterDto } from 'src/common/dtos/requestDtos/auth/admin.register.request.dto';
import { AdminLoginDto } from 'src/common/dtos/requestDtos/auth/admin.login.request.dto';
import { LoginRequestDTO } from 'src/common/dtos/requestDtos/auth/login.request.dto';
import { ToggleAdminActiveDto } from 'src/common/dtos/requestDtos/auth/toggle-admin-active.request.dto';
import { Role } from 'src/common/enums/role.enum';

// Mock Factory for Users
const createMockUser = (role: Role): Users => ({
  id: 1,
  name: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'hashedPassword',
  role,
  userImage: 'default.png',
  refreshToken: undefined,
  customer: null,
  seller: null,
  admin: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
});

// Mock Users for each role
const mockCustomerUser: Users = createMockUser(Role.CUSTOMER);
const mockCustomer: Customers = {
  id: 1,
  address: '123 Street',
  city: 'Istanbul',
  user: mockCustomerUser,
  orders: [],
  orderDetails: [],
  reviews: [],
  carts: [],
  favorites: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};
mockCustomerUser.customer = mockCustomer;

const mockSellerUser: Users = createMockUser(Role.SELLER);
const mockSeller: Sellers = {
  id: 1,
  storeName: 'Test Store',
  storeAddress: '456 Street',
  taxNumber: '1234567890',
  user: mockSellerUser,
  createdAt: new Date(),
  updatedAt: new Date(),
  sellerProducts: [],
  orders: [],
  reviews: [],
  averageRating: 0,
};
mockSellerUser.seller = mockSeller;

const mockAdminUser: Users = createMockUser(Role.ADMIN);
const mockAdmin: Admins = {
  id: 1,
  isActive: true,
  adminLevel: 1,
  user: mockAdminUser,
  levelCode: null,
  failedLoginAttempts: 0,
  isLocked: false,
  lastLogin: new Date(),
};
mockAdminUser.admin = mockAdmin;

// Mock LevelCode
const mockLevelCode: LevelCodes = {
  id: 1,
  code: '550e8400-e29b-41d4-a716-446655440000',
  isActive: true,
  assignedUserId: undefined,
  level: 1,
};

// Mock Services
const mockJwtService = {
  sign: jest.fn().mockReturnValue('mockedToken'),
  verify: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
};

const mockCustomerRepository = {
  save: jest.fn().mockResolvedValue(mockCustomer),
};

const mockSellerRepository = {
  save: jest.fn().mockResolvedValue(mockSeller),
};

const mockAdminRepository = {
  findOne: jest.fn(),
  save: jest.fn().mockResolvedValue(mockAdmin),
};

const mockLevelCodeRepository = {
  findOne: jest.fn().mockResolvedValue(mockLevelCode),
  save: jest.fn().mockResolvedValue(mockLevelCode),
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<Users>;
  let sellerRepository: Repository<Sellers>;
  let customerRepository: Repository<Customers>;
  let adminRepository: Repository<Admins>;
  let levelCodeRepository: Repository<LevelCodes>;
  let jwtService: JwtService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Customers),
          useValue: mockCustomerRepository,
        },
        {
          provide: getRepositoryToken(Sellers),
          useValue: mockSellerRepository,
        },
        {
          provide: getRepositoryToken(Admins),
          useValue: mockAdminRepository,
        },
        {
          provide: getRepositoryToken(LevelCodes),
          useValue: mockLevelCodeRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<Users>>(getRepositoryToken(Users));
    sellerRepository = module.get<Repository<Sellers>>(getRepositoryToken(Sellers));
    customerRepository = module.get<Repository<Customers>>(getRepositoryToken(Customers));
    adminRepository = module.get<Repository<Admins>>(getRepositoryToken(Admins));
    levelCodeRepository = module.get<Repository<LevelCodes>>(getRepositoryToken(LevelCodes));
    jwtService = module.get<JwtService>(JwtService);

    jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
  });

  describe('customerRegister', () => {
    const customerRegisterDto: CustomerRegisterDto = {
      name: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      address: '123 Street',
      telephoneNumber: '11111111111',
      userImage: 'default.png',
      city: 'Istanbul',
    };

    it('should successfully register a new customer', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockCustomerUser);
      mockUserRepository.save.mockResolvedValue(mockCustomerUser);

      const result = await service.customerRegister(customerRegisterDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: customerRegisterDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(customerRegisterDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: customerRegisterDto.name,
        lastName: customerRegisterDto.lastname,
        email: customerRegisterDto.email,
        password: 'hashedPassword',
        role: Role.CUSTOMER,
      });
      expect(mockCustomerRepository.save).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        data: {
          user: {
            id: mockCustomerUser.id,
            name: mockCustomerUser.name,
            lastName: mockCustomerUser.lastName,
            userImage: mockCustomerUser.userImage,
            email: mockCustomerUser.email,
          },
        },
        message: 'Registration successful',
        success: true,
      });
    });

    it('should throw BadRequestException if email is already in use', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCustomerUser);
      await expect(service.customerRegister(customerRegisterDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.save.mockRejectedValue(new Error('DB error'));
      await expect(service.customerRegister(customerRegisterDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('sellerRegister', () => {
    const sellerRegisterDto: SellerRegisterDto = {
      name: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      storeName: 'Test Store',
      telephoneNumber: '11111111111',
      userImage: 'default.png',
      storeAddress: '456 Street',
      taxNumber: '123456789',
    };

    it('should successfully register a new seller', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockSellerUser);
      mockUserRepository.save.mockResolvedValue(mockSellerUser);

      const result = await service.sellerRegister(sellerRegisterDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: sellerRegisterDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(sellerRegisterDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: sellerRegisterDto.name,
        lastName: sellerRegisterDto.lastname,
        email: sellerRegisterDto.email,
        password: 'hashedPassword',
        role: Role.SELLER,
      });
      expect(mockSellerRepository.save).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        data: {
          user: {
            id: mockSellerUser.id,
            name: mockSellerUser.name,
            lastName: mockSellerUser.lastName,
            userImage: mockSellerUser.userImage,
            email: mockSellerUser.email,
          },
        },
        message: 'Registration successful',
        success: true,
      });
    });

    it('should throw BadRequestException if email is already in use', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockSellerUser);
      await expect(service.sellerRegister(sellerRegisterDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockSellerRepository.save.mockRejectedValue(new Error('DB error'));
      await expect(service.sellerRegister(sellerRegisterDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('registerAdmin', () => {
    const adminRegisterDto: AdminRegisterDto = {
      name: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      levelCode: '550e8400-e29b-41d4-a716-446655440000',
      userImage: 'admin.png',
    };

    it('should successfully register a new admin', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockAdminUser);
      mockUserRepository.save.mockResolvedValue(mockAdminUser);
      const updatedLevelCode = { ...mockLevelCode, assignedUserId: mockAdminUser.id };
      mockLevelCodeRepository.save.mockResolvedValue(updatedLevelCode);

      const result = await service.registerAdmin(adminRegisterDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: adminRegisterDto.email },
      });
      expect(mockLevelCodeRepository.findOne).toHaveBeenCalledWith({
        where: { code: adminRegisterDto.levelCode, isActive: true },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(adminRegisterDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: adminRegisterDto.name,
        lastName: adminRegisterDto.lastName,
        email: adminRegisterDto.email,
        password: 'hashedPassword',
        userImage: adminRegisterDto.userImage,
        role: Role.ADMIN,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockLevelCodeRepository.save).toHaveBeenCalled();
      expect(mockAdminRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        data: {
          user: {
            id: mockAdminUser.id,
            name: mockAdminUser.name,
            lastName: mockAdminUser.lastName,
            userImage: mockAdminUser.userImage,
            email: mockAdminUser.email,
          },
        },
        message: 'Admin registered successfully',
        success: true,
      });
    });

    it('should throw BadRequestException if email is already in use', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAdminUser);
      await expect(service.registerAdmin(adminRegisterDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid or inactive level code', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockLevelCodeRepository.findOne.mockResolvedValue(null);
      await expect(service.registerAdmin(adminRegisterDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if level code is assigned to another user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockLevelCodeRepository.findOne.mockResolvedValue({
        ...mockLevelCode,
        assignedUserId: 2,
      });
      await expect(service.registerAdmin(adminRegisterDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockLevelCodeRepository.findOne.mockResolvedValue({
        ...mockLevelCode,
        assignedUserId: undefined,
      });
      mockUserRepository.save.mockRejectedValue(new Error('DB error'));
      await expect(service.registerAdmin(adminRegisterDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('login', () => {
    const loginDto: LoginRequestDTO = {
      email: 'customer@example.com',
      password: 'password123',
    };

    it('should successfully log in as a customer', async () => {
      const userWithCustomer = {
        ...mockCustomerUser,
        customer: mockCustomer,
      };
      mockUserRepository.findOne.mockResolvedValue(userWithCustomer);
      mockUserRepository.save.mockResolvedValue({ ...userWithCustomer, refreshToken: 'refresh-token' });
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        relations: ['seller', 'customer'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, userWithCustomer.password);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          refreshToken: 'refresh-token',
        }),
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: mockCustomerUser.id, role: Role.CUSTOMER, customerId: mockCustomer.id },
        { expiresIn: '1h' },
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: mockCustomerUser.id, role: Role.CUSTOMER, customerId: mockCustomer.id },
        { expiresIn: '7d' },
      );
      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: {
            id: mockCustomerUser.id,
            name: mockCustomerUser.name,
            lastName: mockCustomerUser.lastName,
            userImage: mockCustomerUser.userImage,
            email: mockCustomerUser.email,
          },
        },
      });
    });
  });

  describe('loginAdmin', () => {
    const adminLoginDto: AdminLoginDto = {
      email: 'admin@example.com',
      password: 'password123',
      levelCode: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('should successfully log in as an admin', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockAdminUser,
        admin: {
          ...mockAdmin,
          levelCode: mockLevelCode,
        },
      });
      mockAdminRepository.save.mockResolvedValue(mockAdmin);
      mockUserRepository.save.mockResolvedValue({ ...mockAdminUser, refreshToken: 'refreshToken' });
      mockJwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      const result = await service.loginAdmin(adminLoginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: adminLoginDto.email, role: Role.ADMIN },
        relations: ['admin', 'admin.levelCode'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(adminLoginDto.password, mockAdminUser.password);
      expect(mockAdminRepository.save).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ refreshToken: 'refreshToken' }),
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          id: mockAdminUser.id,
          email: mockAdminUser.email,
          role: Role.ADMIN,
          adminId: mockAdmin.id,
          adminLevel: mockAdmin.adminLevel,
        },
        { expiresIn: '1h' },
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          id: mockAdminUser.id,
          email: mockAdminUser.email,
          role: Role.ADMIN,
          adminId: mockAdmin.id,
          adminLevel: mockAdmin.adminLevel,
        },
        { expiresIn: '7d' },
      );
      expect(result).toEqual({
        success: true,
        message: 'Admin login successful',
        data: {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
          user: {
            id: mockAdminUser.id,
            name: mockAdminUser.name,
            lastName: mockAdminUser.lastName,
            userImage: mockAdminUser.userImage,
            email: mockAdminUser.email,
          },
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.loginAdmin(adminLoginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if admin account is not active', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockAdminUser,
        admin: { ...mockAdmin, isActive: false },
      });
      await expect(service.loginAdmin(adminLoginDto)).rejects.toThrow('Admin account is not active.');
    });

    it('should throw UnauthorizedException if admin account is locked', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockAdminUser,
        admin: { ...mockAdmin, isLocked: true },
      });
      await expect(service.loginAdmin(adminLoginDto)).rejects.toThrow('Admin account is locked.');
    });

    it('should throw UnauthorizedException if account is inactive for 30 days', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockAdminUser,
        admin: {
          ...mockAdmin,
          lastLogin: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
        },
      });
      await expect(service.loginAdmin(adminLoginDto)).rejects.toThrow('Account inactive for 30 days, please re-verify.');
    });

    it('should throw UnauthorizedException and increment failedLoginAttempts if password is incorrect', async () => {
      const mockAdminWithAttempts = {
        ...mockAdmin,
        failedLoginAttempts: 1,
        levelCode: mockLevelCode,
      };
      mockUserRepository.findOne.mockResolvedValue({
        ...mockAdminUser,
        admin: mockAdminWithAttempts,
      });
      mockAdminRepository.save.mockResolvedValue({
        ...mockAdminWithAttempts,
        failedLoginAttempts: 2,
      });

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.loginAdmin(adminLoginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockAdminRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ failedLoginAttempts: 2 }),
      );
    });
  });

  describe('deleteAdmin', () => {
    const adminToDelete = {
      id: 10,
      user: { id: 100 },
      levelCode: { level: 1 },
      isActive: true,
    };

    const superAdmin = {
      id: 1,
      levelCode: { level: 2 },
    };

    it('should successfully delete an admin', async () => {
      mockAdminRepository.findOne
        .mockResolvedValueOnce(adminToDelete)
        .mockResolvedValueOnce(superAdmin);
      mockUserRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteAdmin(10, 1);

      expect(mockAdminRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: 10 },
        relations: ['user', 'levelCode'],
      });
      expect(mockAdminRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: 1 },
        relations: ['levelCode'],
      });
      expect(mockUserRepository.delete).toHaveBeenCalledWith(100);
      expect(result).toEqual({ message: 'Admin deleted successfully' });
    });

    it('should throw BadRequestException if admin is not found', async () => {
      mockAdminRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.deleteAdmin(10, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if requesting admin is not a super admin', async () => {
      mockAdminRepository.findOne
        .mockResolvedValueOnce(adminToDelete)
        .mockResolvedValueOnce({ id: 2, levelCode: { level: 1 } });
      await expect(service.deleteAdmin(10, 2)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if requesting admin is not found', async () => {
      mockAdminRepository.findOne
        .mockResolvedValueOnce(adminToDelete)
        .mockResolvedValueOnce(null);
      await expect(service.deleteAdmin(10, 999)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('toggleAdminActiveStatus', () => {
    const toggleAdminActiveDto: ToggleAdminActiveDto = {
      adminId: 1,
      isActive: false,
    };

    it('should successfully toggle admin active status', async () => {
      const targetAdmin = {
        id: 1,
        isActive: true,
        user: {},
        levelCode: { level: 1 },
      };

      const requesterAdmin = {
        id: 2,
        user: {},
        levelCode: { level: 2 },
      };

      mockAdminRepository.findOne
        .mockResolvedValueOnce(targetAdmin)
        .mockResolvedValueOnce(requesterAdmin);
      mockAdminRepository.save.mockResolvedValue({ ...targetAdmin, isActive: false });

      const result = await service.toggleAdminActiveStatus(toggleAdminActiveDto, 2);

      expect(mockAdminRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: 1 },
        relations: ['user', 'levelCode'],
      });
      expect(mockAdminRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: 2 },
        relations: ['user', 'levelCode'],
      });
      expect(mockAdminRepository.save).toHaveBeenCalledWith({
        ...targetAdmin,
        isActive: false,
      });
      expect(result).toEqual({ message: 'Admin deactivated successfully' });
    });

    it('should throw ForbiddenException if non-super admin tries to activate', async () => {
      const targetAdmin = {
        id: 1,
        isActive: false,
        user: {},
        levelCode: { level: 1 },
      };

      const requesterAdmin = {
        id: 2,
        user: {},
        levelCode: { level: 1 },
      };

      mockAdminRepository.findOne
        .mockResolvedValueOnce(targetAdmin)
        .mockResolvedValueOnce(requesterAdmin);

      const dto = { ...toggleAdminActiveDto, isActive: true };
      await expect(service.toggleAdminActiveStatus(dto, 2)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for invalid target admin', async () => {
      mockAdminRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.toggleAdminActiveStatus(toggleAdminActiveDto, 2)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for invalid requester admin', async () => {
      const targetAdmin = {
        id: 1,
        isActive: true,
        user: {},
        levelCode: { level: 1 },
      };

      mockAdminRepository.findOne
        .mockResolvedValueOnce(targetAdmin)
        .mockResolvedValueOnce(null);
      await expect(service.toggleAdminActiveStatus(toggleAdminActiveDto, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      mockJwtService.sign.mockReset().mockReturnValue('mockedToken');
      mockJwtService.verify.mockReset();
    });

    it('should successfully refresh token for a customer', async () => {
      const userWithCustomer = {
        ...mockCustomerUser,
        refreshToken: 'mockedRefreshToken',
        customer: mockCustomer,
      };
      mockUserRepository.findOne.mockResolvedValue(userWithCustomer);
      mockJwtService.verify.mockReturnValue({ id: 1, role: Role.CUSTOMER });

      const result = await service.refreshToken('mockedRefreshToken');

      expect(mockJwtService.verify).toHaveBeenCalledWith('mockedRefreshToken');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['seller', 'customer', 'admin'],
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: mockCustomerUser.id, role: Role.CUSTOMER, customerId: mockCustomer.id },
        { expiresIn: '1h' },
      );
      expect(result).toEqual({ accessToken: 'mockedToken' });
    });

    it('should successfully refresh token for a seller', async () => {
      const userWithSeller = {
        ...mockSellerUser,
        refreshToken: 'mockedRefreshToken',
        seller: mockSeller,
      };
      mockUserRepository.findOne.mockResolvedValue(userWithSeller);
      mockJwtService.verify.mockReturnValue({ id: 1, role: Role.SELLER });

      const result = await service.refreshToken('mockedRefreshToken');

      expect(mockJwtService.verify).toHaveBeenCalledWith('mockedRefreshToken');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['seller', 'customer', 'admin'],
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: mockSellerUser.id, role: Role.SELLER, sellerId: mockSeller.id },
        { expiresIn: '1h' },
      );
      expect(result).toEqual({ accessToken: 'mockedToken' });
    });

    it('should successfully refresh token for an admin', async () => {
      const userWithAdmin = {
        ...mockAdminUser,
        refreshToken: 'mockedRefreshToken',
        admin: mockAdmin,
      };
      mockUserRepository.findOne.mockResolvedValue(userWithAdmin);
      mockJwtService.verify.mockReturnValue({ id: 1, role: Role.ADMIN });

      const result = await service.refreshToken('mockedRefreshToken');

      expect(mockJwtService.verify).toHaveBeenCalledWith('mockedRefreshToken');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['seller', 'customer', 'admin'],
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: mockAdminUser.id, role: Role.ADMIN, adminId: mockAdmin.id, adminLevel: mockAdmin.adminLevel },
        { expiresIn: '1h' },
      );
      expect(result).toEqual({ accessToken: 'mockedToken' });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.refreshToken('invalidToken')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token does not match', async () => {
      const userWithCustomer = {
        ...mockCustomerUser,
        refreshToken: 'differentToken',
        customer: mockCustomer,
      };
      mockUserRepository.findOne.mockResolvedValue(userWithCustomer);
      mockJwtService.verify.mockReturnValue({ id: 1, role: Role.CUSTOMER });
      await expect(service.refreshToken('mockedRefreshToken')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should successfully log out', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCustomerUser);
      mockUserRepository.save.mockResolvedValue({ ...mockCustomerUser, refreshToken: undefined });

      await service.logout(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockCustomerUser,
        refreshToken: undefined,
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.logout(1)).rejects.toThrow(UnauthorizedException);
    });
  });
});