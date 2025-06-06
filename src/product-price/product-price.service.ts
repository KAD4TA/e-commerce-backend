import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OtherSellerProductResponseDto } from 'src/common/dtos/responseDtos/seller/other.seller.product.response.dto';

import { Products, SellerProduct } from 'src/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class ProductPriceService {
  constructor(
    @InjectRepository(Products)
    private productRepository: Repository<Products>,
    @InjectRepository(SellerProduct)
    private sellerProductRepository: Repository<SellerProduct>,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  async updateProductBasePriceAndImage(productId: number) {
    const sellerProducts = await this.sellerProductRepository.find({
      where: { product: { id: productId } },
      relations: ["product"],
    });

    if (sellerProducts.length === 0) return;

    // Find the seller with the lowest price
    const cheapestSellerProduct = sellerProducts.reduce((prev, curr) =>
      (curr.discountPrice || curr.price) < (prev.discountPrice || prev.price) ? curr : prev
    );

    const product = sellerProducts[0].product;
    product.basePrice = cheapestSellerProduct.discountPrice || cheapestSellerProduct.price;
    product.productImageUrl = cheapestSellerProduct.productImageUrl;
    await this.productRepository.save(product);
  }

  public getOtherSellers(sellerProducts: SellerProduct[], currentSellerId: number): OtherSellerProductResponseDto[] {
    return sellerProducts
      .filter((sp) => sp.seller && sp.seller.id !== currentSellerId) 
      .map((sp) => this.mapper.map(sp, SellerProduct, OtherSellerProductResponseDto));
  }
}



