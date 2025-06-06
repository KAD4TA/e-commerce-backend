import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customer.controller';
import { CustomersService } from './customer.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CustomerGuard } from 'src/guards/role.customer.guard';
import { UpdateCustomerRequestDto } from 'src/common/dtos/requestDtos/customer/update.customer.request.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

// Mock CustomerService
const mockCustomersService = {
  updateCustomerProfile: jest.fn(),
};

// Mock Guards that always allow
const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
const mockCustomerGuard = { canActivate: jest.fn(() => true) };

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [{ provide: CustomersService, useValue: mockCustomersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(CustomerGuard)
      .useValue(mockCustomerGuard)
      .compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    const userId = 42;
    const validDto: UpdateCustomerRequestDto = {
      address: '123 Test St',
      city: 'TestCity',
      email: 'test@example.com',
      name: 'John',
      lastname: 'Doe',
      telephoneNumber: '555-1234',
      userImage: 'image.png',
      password: 'StrongPass123!',
    };

    it('should call service and return response on success', async () => {
      const mockResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: {
          customerId: userId,
          address: validDto.address,
          city: validDto.city,
          user: {
            id: userId,
            email: validDto.email,
            telephoneNumber: validDto.telephoneNumber,
            name: validDto.name,
            lastName: validDto.lastname,
            userImage: validDto.userImage,
          },
        },
      };

      mockCustomersService.updateCustomerProfile.mockResolvedValue(mockResponse);

      const result = await controller.updateProfile(userId, validDto);

      expect(service.updateCustomerProfile).toHaveBeenCalledWith(userId, validDto);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error if service throws', async () => {
      mockCustomersService.updateCustomerProfile.mockRejectedValue(new Error('Service error'));

      await expect(controller.updateProfile(userId, validDto)).rejects.toThrow('Service error');
    });


    it('should throw BadRequestException on invalid email', async () => {
      const invalidDto = { ...validDto, email: 'invalid-email' };

      mockCustomersService.updateCustomerProfile.mockImplementation(() => {
        throw new BadRequestException('Invalid email');
      });

      await expect(controller.updateProfile(userId, invalidDto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw BadRequestException on weak password', async () => {
      const invalidDto = { ...validDto, password: '123' };

      mockCustomersService.updateCustomerProfile.mockImplementation(() => {
        throw new BadRequestException('Weak password');
      });

      await expect(controller.updateProfile(userId, invalidDto)).rejects.toBeInstanceOf(BadRequestException);
    });

  });
});
