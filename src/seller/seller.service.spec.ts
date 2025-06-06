import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { SellerService } from './seller.service';
import { Sellers, Users } from 'src/typeorm';
import { UpdateSellerRequestDto } from 'src/common/dtos/requestDtos/seller/update.seller.request.dto';
import { SellerResponseDto, SellerResponseDtoWrapper } from 'src/common/dtos/responseDtos/seller/seller.response.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';
import { SellerProfile } from 'src/mapping/seller.mapping';
import { TypeOrmModule } from '@nestjs/typeorm';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('mockedSalt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('SellerService', () => {
  let service: SellerService;
  let sellerRepository: Repository<Sellers>;
  let userRepository: Repository<Users>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
        TypeOrmModule.forFeature([Sellers, Users]), 
      ],
      providers: [
        SellerService,
        SellerProfile,
        {
          provide: getRepositoryToken(Sellers),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Users),
          useClass: Repository,
        },
      ],
    })
      .overrideProvider(getRepositoryToken(Sellers))
      .useValue({
        findOne: jest.fn(),
        save: jest.fn(),
      })
      .overrideProvider(getRepositoryToken(Users))
      .useValue({
        save: jest.fn(),
      })
      .compile();

    service = module.get<SellerService>(SellerService);
    sellerRepository = module.get(getRepositoryToken(Sellers));
    userRepository = module.get(getRepositoryToken(Users));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateSellerProfile', () => {
    const userId = 1;
    const updateSellerDto: UpdateSellerRequestDto = {
      storeName: 'New Store',
      storeAddress: 'New Address',
      taxNumber: '1234567890',
      email: 'new@example.com',
      password: 'newPassword',
      telephoneNumber: '1234567890',
      userImage: 'new-image-url',
      name: 'New Name',
      lastname: 'New LastName',
    };

    const mockSeller: Sellers = {
      id: userId,
      storeName: 'Old Store',
      storeAddress: 'Old Address',
      taxNumber: '0987654321',
      averageRating: 4.0,
      sellerProducts: [],
      orders: [],
      reviews: [],
      user: {
        id: userId,
        email: 'old@example.com',
        password: 'oldHashedPassword',
        telephoneNumber: '0987654321',
        userImage: 'old-image-url',
        name: 'Old Name',
        lastName: 'Old LastName',
        role: Role.SELLER,
        customer: null,
        seller: null,
        admin: null,
        refreshToken: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedSeller: Sellers = {
      ...mockSeller,
      storeName: 'New Store',
      storeAddress: 'New Address',
      taxNumber: '1234567890',
      user: {
        ...mockSeller.user,
        email: 'new@example.com',
        password: 'hashedPassword',
        telephoneNumber: '1234567890',
        userImage: 'new-image-url',
        name: 'New Name',
        lastName: 'New LastName',
      },
    };

    const sellerResponse: SellerResponseDto = {
      sellerId: userId,
      storeName: 'New Store',
      storeAddress: 'New Address',
      taxNumber: '1234567890',
      sellerImage: 'new-image-url',
      sellerAverageRate: 4.0,
    };

    const sellerResponseWrapper: SellerResponseDtoWrapper = {
      data: sellerResponse,
      message: 'Seller profile updated successfully',
      success: true,
    };

    it('should update seller profile and return SellerResponseDtoWrapper', async () => {
      jest.spyOn(sellerRepository, 'findOne').mockResolvedValue(mockSeller);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedSeller.user);
      jest.spyOn(sellerRepository, 'save').mockResolvedValue(updatedSeller);

      const result = await service.updateSellerProfile(userId, updateSellerDto);

      expect(sellerRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['user'],
      });
      expect(userRepository.save).toHaveBeenCalledWith(updatedSeller.user);
      expect(sellerRepository.save).toHaveBeenCalledWith(updatedSeller);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 'mockedSalt');
      expect(result).toEqual(sellerResponseWrapper);
    });

    it('should throw NotFoundException if seller is not found', async () => {
      jest.spyOn(sellerRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateSellerProfile(userId, updateSellerDto)).rejects.toThrow(
        new NotFoundException('An error occurred while updating the seller profile'),
      );
      expect(sellerRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['user'],
      });
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(sellerRepository.save).not.toHaveBeenCalled();
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      jest.spyOn(sellerRepository, 'findOne').mockRejectedValue(new Error('Database error'));

      await expect(service.updateSellerProfile(userId, updateSellerDto)).rejects.toThrow(
        new InternalServerErrorException('An error occurred while updating the seller profile'),
      );
      expect(sellerRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['user'],
      });
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(sellerRepository.save).not.toHaveBeenCalled();
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should update only provided fields in DTO', async () => {
      const partialDto: UpdateSellerRequestDto = {
        storeName: 'Partial Store',
        email: 'partial@example.com',
        name: 'Partial Name',
        lastname: 'Partial LastName',
      };

      const partialUpdatedSeller: Sellers = {
        ...mockSeller,
        storeName: 'Partial Store',
        user: {
          ...mockSeller.user,
          email: 'partial@example.com',
          name: 'Partial Name',
          lastName: 'Partial LastName',
        },
      };

      const partialSellerResponse: SellerResponseDto = {
        sellerId: userId,
        storeName: 'Partial Store',
        storeAddress: 'New Address',
        taxNumber: '1234567890',
        sellerImage: 'new-image-url',
        sellerAverageRate: 4.0,
      };

      const partialSellerResponseWrapper: SellerResponseDtoWrapper = {
        data: partialSellerResponse,
        message: 'Seller profile updated successfully',
        success: true,
      };

      jest.spyOn(sellerRepository, 'findOne').mockResolvedValue(mockSeller);
      jest.spyOn(userRepository, 'save').mockResolvedValue(partialUpdatedSeller.user);
      jest.spyOn(sellerRepository, 'save').mockResolvedValue(partialUpdatedSeller);

      const result = await service.updateSellerProfile(userId, partialDto);

      expect(sellerRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['user'],
      });
      expect(userRepository.save).toHaveBeenCalledWith(partialUpdatedSeller.user);
      expect(sellerRepository.save).toHaveBeenCalledWith(partialUpdatedSeller);
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result).toEqual(partialSellerResponseWrapper);
      expect(partialUpdatedSeller.storeAddress).toBe('New Address');
      expect(partialUpdatedSeller.taxNumber).toBe('1234567890');
      expect(partialUpdatedSeller.user.userImage).toBe('new-image-url');
      expect(partialUpdatedSeller.user.telephoneNumber).toBe('1234567890');
      expect(partialUpdatedSeller.user.password).toBe('hashedPassword');
    });
  });
});