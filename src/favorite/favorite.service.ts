import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Repository } from 'typeorm';
import { Favorites, Customers, SellerProduct, } from 'src/typeorm';
import { FavoriteRequestDto } from 'src/common/dtos/requestDtos/favorite/favorite.request.dto';
import { FavoriteResponseDto, FavoriteResponseDtoWrapper } from 'src/common/dtos/responseDtos/favorite/favorite.response.dto';

@Injectable()
export class FavoriteService {
    constructor(
        @InjectRepository(Favorites) private readonly favoriteRepo: Repository<Favorites>,
        @InjectRepository(SellerProduct) private readonly sellerProductRepo: Repository<SellerProduct>,
        @InjectMapper() private readonly mapper: Mapper
    ) {}

    async addFavorite(favoriteDto: FavoriteRequestDto, user: number): Promise<FavoriteResponseDtoWrapper> {
  

  if (!user || user <= 0) {
    throw new BadRequestException('Kullanıcı bilgisi bulunamadı veya geçersiz!');
  }

  
  const sellerProduct = await this.sellerProductRepo.findOne({
    where: { id: favoriteDto.sellerProductId },
    relations: ['product', 'seller'],
  });

  if (!sellerProduct) {
    throw new BadRequestException('Ürün bulunamadı!');
  }

 
  const existingFavorite = await this.favoriteRepo.findOne({
    where: {
      customer: { id: user },
      sellerProduct: { id: sellerProduct.id },
    },
  });

  if (existingFavorite) {
    return new FavoriteResponseDtoWrapper(null, 'Bu ürün zaten favorilerde!', false);
  }

  
  const favoriteEntity = new Favorites();
  favoriteEntity.customer = { id: user } as Customers; 
  favoriteEntity.sellerProduct = sellerProduct;
  favoriteEntity.product = sellerProduct.product;

  const savedFavorite = await this.favoriteRepo.save(favoriteEntity);

  
  const favoriteResponse = this.mapper.map(savedFavorite, Favorites, FavoriteResponseDto);

  return new FavoriteResponseDtoWrapper(favoriteResponse, 'Favori başarıyla eklendi', true);
}

  async deleteFavorite(
    productId: number,
    user: number,
  ): Promise<FavoriteResponseDtoWrapper> {
    try {
      const favorite = await this.favoriteRepo.findOne({
        where: {
          sellerProduct: { product: { id: productId } },
          customer: { id: user},
        },
        relations: ['sellerProduct', 'sellerProduct.product'],
      });

      if (!favorite) {
        return new FavoriteResponseDtoWrapper(null, 'Favori bulunamadı', false);
      }

      await this.favoriteRepo.delete(favorite.id);

      return new FavoriteResponseDtoWrapper(
        null,
        'Favori başarıyla kaldırıldı',
        true,
      );
    } catch (error) {
      
      throw new InternalServerErrorException('Favori kaldırılırken hata oluştu');
    }
  }

  async getFavorites(user: number): Promise<FavoriteResponseDtoWrapper> {
    
    try {
      const favorites = await this.favoriteRepo.find({
        where: { customer: { id: user } },
        relations: ['sellerProduct', 'sellerProduct.product'],
      });

      if (!favorites.length) {
        return new FavoriteResponseDtoWrapper([], 'Favori bulunamadı', true);
      }

      const favoriteResponseArray = this.mapper.mapArray(
        favorites,
        Favorites,
        FavoriteResponseDto,
      );
      return new FavoriteResponseDtoWrapper(
        favoriteResponseArray,
        'Favoriler başarıyla alındı',
        true,
      );
    } catch (error) {
      
      throw new InternalServerErrorException(
        'Favoriler alınırken hata oluştu',
      );
    }
  }


    async getSellerFavoriteCounts(seller: number): Promise<FavoriteResponseDtoWrapper> {
  try {
    
    const favorites = await this.favoriteRepo.find({
      where: { sellerProduct: { seller: { id: seller } } },
      relations: ['sellerProduct', 'sellerProduct.product'],
    });

    if (!favorites.length) {
      return new FavoriteResponseDtoWrapper(
        [],
        'Satıcının ürünleri için favori bulunamadı',
        true,
      );
    }

    
    const productFavoriteMap = new Map<number, FavoriteResponseDto>();
    favorites.forEach((favorite) => {
      const { product, avgProductRate, discountPrice, price, productImageUrl } =
        favorite.sellerProduct;

      const existing = productFavoriteMap.get(favorite.sellerProduct.id) || {
        id: favorite.id,
        productId: product.id,
        productImage: productImageUrl,
        productName: product.name,
        productDiscount: discountPrice || 0,
        productPrice: price,
        productRate: avgProductRate ?? 0,
        sellerId: seller,
        favoriteCount: 0,
      };

      existing.favoriteCount = (existing.favoriteCount ?? 0) + 1;
      productFavoriteMap.set(favorite.sellerProduct.id, existing);
    });

    const favoriteResponseArray = Array.from(productFavoriteMap.values());
    return new FavoriteResponseDtoWrapper(
      favoriteResponseArray,
      'Satıcı favori sayıları başarıyla alındı',
      true,
    );
  } catch (error) {
    
    throw new InternalServerErrorException(
      'Satıcı favori sayıları alınırken hata oluştu',
    );
  }
}
}
