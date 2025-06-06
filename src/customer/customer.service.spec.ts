import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customer.service';
import { Repository } from 'typeorm';
import { Customers } from 'src/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UpdateCustomerRequestDto } from 'src/common/dtos/requestDtos/customer/update.customer.request.dto';
import { CustomerResponseDtoWrapper } from 'src/common/dtos/responseDtos/customer/customer.response.dto';

describe('CustomersService', () => {
  let service: CustomersService;
  let repo: Repository<Customers>;

  const mockCustomerRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customers),
          useValue: mockCustomerRepo,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repo = module.get<Repository<Customers>>(getRepositoryToken(Customers));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateCustomerProfile', () => {
    const userId = 1;
    const dto: UpdateCustomerRequestDto = {
      address: 'New Address',
      city: 'New City',
      name: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      telephoneNumber: '1234567890',
      userImage: 'image.png',
      password: 'StrongPass123',
    };

    it('should throw NotFoundException if customer not found', async () => {
      mockCustomerRepo.findOne.mockResolvedValue(null);

      await expect(service.updateCustomerProfile(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCustomerRepo.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['user'],
      });
    });

    it('should update customer and user fields and return wrapped response', async () => {
      
      const existingCustomer = {
        id: userId,
        address: 'Old Address',
        city: 'Old City',
        user: {
          id: 10,
          name: 'Old Name',
          lastName: 'Old LastName',
          email: 'old.email@example.com',
          telephoneNumber: '0000000000',
          userImage: 'old-image.png',
          password: 'oldhashedpassword',
        },
      };

      mockCustomerRepo.findOne.mockResolvedValue(existingCustomer);

      
      const salt = 'salt';
      jest
        .spyOn(bcrypt, 'genSalt')
        .mockImplementation(async (): Promise<string> => 'salt');
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async (): Promise<string> => 'hashedPassword');

      // Mock save returns updated entity (simulate DB save)
      mockCustomerRepo.save.mockImplementation(async (customer) => customer);

      const result = await service.updateCustomerProfile(userId, dto);

      // Check findOne called correctly
      expect(mockCustomerRepo.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['user'],
      });

      // Check bcrypt functions called for password
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, salt);

      // Check save called with updated customer
      expect(mockCustomerRepo.save).toHaveBeenCalled();
      const savedCustomer = mockCustomerRepo.save.mock.calls[0][0];
      expect(savedCustomer.address).toBe(dto.address);
      expect(savedCustomer.city).toBe(dto.city);
      expect(savedCustomer.user.name).toBe(dto.name);
      expect(savedCustomer.user.lastName).toBe(dto.lastname);
      expect(savedCustomer.user.email).toBe(dto.email);
      expect(savedCustomer.user.telephoneNumber).toBe(dto.telephoneNumber);
      expect(savedCustomer.user.userImage).toBe(dto.userImage);
      expect(savedCustomer.user.password).toBe('hashedPassword');

      // Check response structure
      expect(result).toBeInstanceOf(CustomerResponseDtoWrapper);
      expect(result.data.customerId).toBe(userId);
      expect(result.data.address).toBe(dto.address);
      expect(result.data.city).toBe(dto.city);
      expect(result.data.user).toMatchObject({
        id: existingCustomer.user.id,
        name: dto.name,
        lastName: dto.lastname,
        email: dto.email,
        telephoneNumber: dto.telephoneNumber,
        userImage: dto.userImage,
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Profile updated successfully');
    });

    it('should update customer without password if password not provided', async () => {
      const dtoNoPassword = { ...dto };
      delete dtoNoPassword.password;

      const existingCustomer = {
        id: userId,
        address: 'Old Address',
        city: 'Old City',
        user: {
          id: 10,
          name: 'Old Name',
          lastName: 'Old LastName',
          email: 'old.email@example.com',
          telephoneNumber: '0000000000',
          userImage: 'old-image.png',
          password: 'oldhashedpassword',
        },
      };

      mockCustomerRepo.findOne.mockResolvedValue(existingCustomer);
      mockCustomerRepo.save.mockImplementation(async (customer) => customer);

      const result = await service.updateCustomerProfile(userId, dtoNoPassword);

      
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();

      
      expect(mockCustomerRepo.save.mock.calls[0][0].user.password).toBe(
        'oldhashedpassword',
      );

      expect(result.data.customerId).toBe(userId);
      expect(result.success).toBe(true);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockCustomerRepo.findOne.mockRejectedValue(new Error('DB failure'));

      await expect(service.updateCustomerProfile(userId, dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
