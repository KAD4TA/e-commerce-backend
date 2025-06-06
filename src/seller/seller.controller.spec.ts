import { Test, TestingModule } from '@nestjs/testing';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { UpdateSellerRequestDto } from 'src/common/dtos/requestDtos/seller/update.seller.request.dto';
import { SellerResponseDto, SellerResponseDtoWrapper } from 'src/common/dtos/responseDtos/seller/seller.response.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

// Mock SellerService
const mockSellerService = {
  updateSellerProfile: jest.fn(),
};

// Mock Guards
const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

const mockSellerGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

// Mock user ID
const mockUserId = 1;

describe('SellerController', () => {
  let controller: SellerController;
  let sellerService: jest.Mocked<SellerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerController],
      providers: [
        {
          provide: SellerService,
          useValue: mockSellerService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(SellerGuard)
      .useValue(mockSellerGuard)
      .compile();

    controller = module.get<SellerController>(SellerController);
    sellerService = module.get<SellerService>(SellerService) as jest.Mocked<SellerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    const updateSellerDto: UpdateSellerRequestDto = {
      storeName: 'New Store',
      storeAddress: 'New Address',
      taxNumber: "0988765000",
      email: 'new@example.com',
      password: 'newPassword',
      telephoneNumber: '1234567890',
      userImage: 'new-image-url',
    };

    const sellerResponse: SellerResponseDto = {
      sellerId: mockUserId,
      storeName: 'New Store',
      storeAddress: 'New Address',
      taxNumber: "0987543211",
      sellerImage: 'new-image-url',
      sellerAverageRate: 4.5,
    };

    const sellerResponseWrapper: SellerResponseDtoWrapper = {
      data: sellerResponse,
      message: 'Seller profile updated successfully',
      success: true,
    };

    it('should update seller profile and return SellerResponseDtoWrapper', async () => {
      sellerService.updateSellerProfile.mockResolvedValue(sellerResponseWrapper);

      const result = await controller.updateProfile(mockUserId, updateSellerDto);

      expect(sellerService.updateSellerProfile).toHaveBeenCalledWith(mockUserId, updateSellerDto);
      expect(sellerService.updateSellerProfile).toHaveBeenCalledTimes(1);
      expect(result).toEqual(sellerResponseWrapper);
    });

    it('should throw NotFoundException if seller is not found', async () => {
      sellerService.updateSellerProfile.mockRejectedValue(new NotFoundException('Seller not found'));

      await expect(controller.updateProfile(mockUserId, updateSellerDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(sellerService.updateSellerProfile).toHaveBeenCalledWith(mockUserId, updateSellerDto);
      expect(sellerService.updateSellerProfile).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      sellerService.updateSellerProfile.mockRejectedValue(
        new InternalServerErrorException('An error occurred while updating the seller profile'),
      );

      await expect(controller.updateProfile(mockUserId, updateSellerDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(sellerService.updateSellerProfile).toHaveBeenCalledWith(mockUserId, updateSellerDto);
      expect(sellerService.updateSellerProfile).toHaveBeenCalledTimes(1);
    });
  });
});