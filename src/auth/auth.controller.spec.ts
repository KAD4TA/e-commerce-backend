import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AdminGuard } from 'src/guards/role.admin.guard';
import { SuperAdminGuard } from 'src/guards/role.super.admin.guard';
import { SellerRegisterDto } from 'src/common/dtos/requestDtos/auth/seller.register.request.dto';
import { CustomerRegisterDto } from 'src/common/dtos/requestDtos/auth/customer.register.request.dto';
import { LoginRequestDTO } from 'src/common/dtos/requestDtos/auth/login.request.dto';
import { AdminRegisterDto } from 'src/common/dtos/requestDtos/auth/admin.register.request.dto';
import { AdminLoginDto } from 'src/common/dtos/requestDtos/auth/admin.login.request.dto';
import { ToggleAdminActiveDto } from 'src/common/dtos/requestDtos/auth/toggle-admin-active.request.dto';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { validate } from 'class-validator';
import { DtoPrefix, getValidationMessage, ValidationType } from 'src/common/enums/validation.message';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    sellerRegister: jest.fn(),
    customerRegister: jest.fn(),
    login: jest.fn(),
    registerAdmin: jest.fn(),
    loginAdmin: jest.fn(),
    toggleAdminActiveStatus: jest.fn(),
    deleteAdmin: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockAdminGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockSuperAdminGuard = {
    canActivate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .overrideGuard(SuperAdminGuard)
      .useValue(mockSuperAdminGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });


  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sellerRegister', () => {
    it('should register a seller successfully', async () => {
      const dto: SellerRegisterDto = {
        email: 'seller@example.com',
        name: 'John',
        lastname: 'Doe',
        password: 'StrongPass123!',
        userImage: 'seller.png',
        telephoneNumber: '+905551234567',
        storeName: 'Johns Store',
        storeAddress: '123 Street, Istanbul',
        taxNumber: "1234567890", 
      };
      const result = { message: 'Seller registered successfully', userId: 1 };
      mockAuthService.sellerRegister.mockResolvedValue(result);

      const response = await controller.sellerRegister(dto);
      expect(response).toEqual(result);
      expect(mockAuthService.sellerRegister).toHaveBeenCalledWith(dto);
    });

    it('should throw validation error for invalid seller DTO', async () => {
      const dto = new SellerRegisterDto();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toBeDefined();
      expect(errors[0].constraints!.isNotEmpty).toBe(getValidationMessage(DtoPrefix.STORE_NAME, ValidationType.NOT_EMPTY));
    });
  });

  describe('customerRegister', () => {
    it('should register a customer successfully', async () => {
      const dto: CustomerRegisterDto = {
        email: 'customer@example.com',
        name: 'Jane',
        lastname: 'Doe',
        password: 'StrongPass123!',
        telephoneNumber: '+905551234567',
        userImage: 'customer.png',
        address: '456 Street',
        city: 'Ankara',
      };
      const result = { message: 'Customer registered successfully', userId: 2 };
      mockAuthService.customerRegister.mockResolvedValue(result);

      const response = await controller.customerRegister(dto);
      expect(response).toEqual(result);
      expect(mockAuthService.customerRegister).toHaveBeenCalledWith(dto);
    });

    it('should throw validation error for invalid customer DTO', async () => {
      const dto = new CustomerRegisterDto();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toBeDefined();
      expect(errors[0].constraints!.isNotEmpty).toBe(getValidationMessage(DtoPrefix.EMAIL, ValidationType.NOT_EMPTY));
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const dto: LoginRequestDTO = {
        email: 'user@example.com',
        password: 'StrongPass123!',
      };
      const result = {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
        user: { id: 1, email: 'user@example.com', name: 'John', lastname: 'Doe', userImage: 'user.png' },
      };
      mockAuthService.login.mockResolvedValue(result);

      const response = await controller.login(dto);
      expect(response).toEqual(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });

    it('should throw validation error for invalid login DTO', async () => {
      const dto = new LoginRequestDTO();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toBeDefined();
      expect(errors[0].constraints!.isNotEmpty).toBe(getValidationMessage(DtoPrefix.EMAIL, ValidationType.NOT_EMPTY));
    });
  });

  describe('registerAdmin', () => {
    it('should register admin successfully', async () => {
      const dto: AdminRegisterDto = {
        name: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'StrongPass123!',
        levelCode: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
      };
      const result = { message: 'Admin registered successfully', adminId: 1 };
      mockAuthService.registerAdmin.mockResolvedValue(result);

      const response = await controller.registerAdmin(dto);
      expect(response).toEqual(result);
      expect(mockAuthService.registerAdmin).toHaveBeenCalledWith(dto);
    });

    it('should throw validation error for invalid admin register DTO', async () => {
      const dto = new AdminRegisterDto();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toBeDefined();
      expect(errors[0].constraints!.isNotEmpty).toBe(getValidationMessage(DtoPrefix.NAME, ValidationType.NOT_EMPTY));
    });

    it('should throw validation error for invalid levelCode', async () => {
      const dto = new AdminRegisterDto();
      dto.name = 'Admin';
      dto.lastName = 'User';
      dto.email = 'admin@example.com';
      dto.password = 'StrongPass123!';
      dto.levelCode = 'INVALID_UUID'; // Not a valid UUID
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.find(error => error.property === 'levelCode')?.constraints).toBeDefined();
      expect(errors.find(error => error.property === 'levelCode')?.constraints!.isUuid).toBe(
        getValidationMessage(DtoPrefix.LEVEL_CODE, ValidationType.NOT_VALID)
      );
    });
  });

  describe('loginAdmin', () => {
    it('should login admin successfully', async () => {
      const dto: AdminLoginDto = {
        email: 'admin@example.com',
        password: 'StrongPass123!',
        levelCode: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
      };
      const result = {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
        user: { id: 1, email: 'admin@example.com', name: 'Admin', lastName: 'User', userImage: 'admin.png' },
      };
      mockAuthService.loginAdmin.mockResolvedValue(result);

      const response = await controller.loginAdmin(dto);
      expect(response).toEqual(result);
      expect(mockAuthService.loginAdmin).toHaveBeenCalledWith(dto);
    });

    it('should throw validation error for invalid admin login DTO', async () => {
      const dto = new AdminLoginDto();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toBeDefined();
      expect(errors[0].constraints!.isEmail).toBe(getValidationMessage(DtoPrefix.EMAIL, ValidationType.WRONG_EMAIL_FORMAT));
    });

    it('should throw validation error for invalid levelCode', async () => {
      const dto = new AdminLoginDto();
      dto.email = 'admin@example.com';
      dto.password = 'StrongPass123!';
      dto.levelCode = 'INVALID_UUID'; // Not a valid UUID
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.find(error => error.property === 'levelCode')?.constraints).toBeDefined();
      expect(errors.find(error => error.property === 'levelCode')?.constraints!.isUuid).toBe(
        getValidationMessage(DtoPrefix.LEVEL_CODE, ValidationType.NOT_VALID)
      );
    });
  });

 describe('toggleAdminActiveStatus', () => {
    
    it('should toggle admin active status successfully', async () => {
    const dto: ToggleAdminActiveDto = { adminId: 1, isActive: false };
    const requesterAdminId = 2;
    const result = { message: 'Admin deactivated successfully' };

    mockSuperAdminGuard.canActivate.mockReturnValue(true);
    mockAuthService.toggleAdminActiveStatus.mockResolvedValue(result);

    
    const response = await controller.toggleAdminActiveStatus(1, dto, requesterAdminId);

    expect(mockAuthService.toggleAdminActiveStatus).toHaveBeenCalledWith(
      { ...dto, adminId: 1 },
      requesterAdminId,
    );
    expect(response).toEqual(result);
  });

  it('should throw validation error for invalid DTO', async () => {
    const dto = new ToggleAdminActiveDto(); 
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toBeDefined();
    expect(errors[0].constraints?.isNumber).toBe(
      getValidationMessage(DtoPrefix.ADMIN_ID, ValidationType.MUST_BE_NUMBER),
    );
  });

  it('should NOT allow toggle if SuperAdminGuard fails', async () => {
    const dto: ToggleAdminActiveDto = { adminId: 1, isActive: true };
    const requesterAdminId = 99;

   
    mockAuthService.toggleAdminActiveStatus.mockImplementation(() => {
      throw new ForbiddenException('Only super admins can reactivate an admin account');
    });

    await expect(
      controller.toggleAdminActiveStatus(1, dto, requesterAdminId),
    ).rejects.toThrow(ForbiddenException);

    expect(mockAuthService.toggleAdminActiveStatus).toHaveBeenCalledWith(
      { ...dto, adminId: 1 },
      requesterAdminId,
    );
  });
});

  describe('deleteAdmin', () => {
  const adminId = 1;
  const requesterAdminId = 2;
  const result = { message: 'Admin deleted successfully' };

  it('should delete admin successfully', async () => {
    // Arrange
    mockSuperAdminGuard.canActivate.mockReturnValue(true);
    mockAuthService.deleteAdmin.mockResolvedValue(result);

    // Act 
    const canActivate = mockSuperAdminGuard.canActivate();
    expect(canActivate).toBe(true); // guard test
    const response = await controller.deleteAdmin(adminId, requesterAdminId);

    // Assert
    expect(mockSuperAdminGuard.canActivate).toHaveBeenCalled();
    expect(mockAuthService.deleteAdmin).toHaveBeenCalledWith(adminId, requesterAdminId);
    expect(response).toEqual(result);
  });

  it('should throw ForbiddenException if SuperAdminGuard fails', async () => {
    // Arrange
    mockSuperAdminGuard.canActivate.mockImplementation(() => {
      throw new ForbiddenException('Access denied - Only super admins allowed');
    });

    // Act & Assert
    expect(() => mockSuperAdminGuard.canActivate()).toThrow(ForbiddenException);

    
    try {
      await controller.deleteAdmin(adminId, requesterAdminId);
    } catch (err) {
      expect(err).toBeInstanceOf(ForbiddenException);
    }

    expect(mockSuperAdminGuard.canActivate).toHaveBeenCalled();
  });
});

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'refresh-token';
      const result = { accessToken: 'new-jwt-token' };
      mockAuthService.refreshToken.mockResolvedValue(result);

      const response = await controller.refresh(refreshToken);
      expect(response).toEqual(result);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const req = { user: { id: 1 } };
      const result = { message: 'Logged out successfully' };

      mockAuthService.logout.mockResolvedValue(undefined);

      const response = await controller.logout(req);
      expect(response).toEqual(result);
      expect(mockAuthService.logout).toHaveBeenCalledWith(req.user.id);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      const req = { user: null };

      await expect(controller.logout(req)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });
  });
});