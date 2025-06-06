import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {  Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductRequestDto } from 'src/common/dtos/requestDtos/product/product.request.dto';
import { UpdateProductRequestDto } from 'src/common/dtos/requestDtos/product/update.product.request.dto';
import { SellerProductBasicListResponseDtoWrapper, SellerProductBasicResponseDto } from 'src/common/dtos/responseDtos/seller/seller.product.basic.response.dto';

import { SellerProductDetailedListResponseDtoWrapper, SellerProductDetailedResponseDto } from 'src/common/dtos/responseDtos/seller/seller.product.detailed.response.dto';
import { ProductPriceService } from 'src/product-price/product-price.service';
import { Categories, Products, SellerProduct, Sellers } from 'src/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SellerProductService {
    constructor(
        @InjectRepository(SellerProduct) private readonly sellerProductRepository:Repository<SellerProduct>,
        @InjectRepository(Products) private readonly productRepository:Repository<Products>,
        private productPriceService: ProductPriceService,
        @InjectRepository(Categories) private readonly categoryRepository: Repository<Categories>,
        @InjectMapper() private readonly mapper: Mapper
    ){}


    

    async createProduct(productDto: ProductRequestDto, seller: number): Promise<SellerProductBasicListResponseDtoWrapper> {
  // Check if category exists
  const category = await this.categoryRepository.findOne({ where: { id: productDto.productCategoryId } });
  if (!category) throw new NotFoundException(`Kategori ID ${productDto.productCategoryId} bulunamadı.`);

  // Check if product exists by name and category
  let product = await this.productRepository.findOne({
    where: { name: productDto.productName, category: { id: category.id } },
    relations: ['sellerProducts'],
  });

  // If product doesn’t exist, create it
  if (!product) {
    product = this.mapper.map(productDto, ProductRequestDto, Products);
    product.category = category;
    product = await this.productRepository.save(product);
  }

  // Create SellerProduct entry
  const sellerProduct = this.mapper.map(productDto, ProductRequestDto, SellerProduct);
  sellerProduct.seller = new Sellers();
  sellerProduct.seller.id = seller;
  sellerProduct.product = product;
  const savedSellerProduct = await this.sellerProductRepository.save(sellerProduct);

  // Update product basePrice and productImageUrl based on cheapest seller
  await this.productPriceService.updateProductBasePriceAndImage(product.id);

  // Fetch full SellerProduct with relations for response
  const fullSellerProduct = await this.sellerProductRepository.findOne({
    where: { id: savedSellerProduct.id },
    relations: ['seller', 'seller.user', 'product', 'product.sellerProducts'],
  });

  if (!fullSellerProduct || !fullSellerProduct.seller) {
    throw new Error('Seller bilgisi bulunamadı');
  }

  // Map to response DTO
  const response = this.mapper.map(fullSellerProduct, SellerProduct, SellerProductDetailedResponseDto);
  response.productImageUrl = fullSellerProduct.product?.productImageUrl ?? null;
  response.otherSellers = this.productPriceService.getOtherSellers(fullSellerProduct.product?.sellerProducts ?? [], seller);

  return new SellerProductDetailedListResponseDtoWrapper([response], 'Ürün başarıyla oluşturuldu veya satıcıya bağlandı', true);
}

  
  
  
async updateSellerProduct(productId: number, dto: UpdateProductRequestDto, seller: number): Promise<SellerProductBasicListResponseDtoWrapper> {
  const sellerProduct = await this.sellerProductRepository.findOne({
    where: { id: productId, seller: { id: seller } },
    relations: ['seller', 'product', 'product.category'],
  });
  if (!sellerProduct) throw new NotFoundException('Ürün bulunamadı');

  if (dto.productCategoryId) {
  const category = await this.categoryRepository.findOne({ where: { id: dto.productCategoryId } });
  if (!category) throw new NotFoundException('Kategori bulunamadı');
  sellerProduct.product.category = category;
}

  const productPartial = this.mapper.map(dto, UpdateProductRequestDto, Products);

  sellerProduct.product.name = productPartial.name ?? sellerProduct.product.name;
  sellerProduct.product.description = productPartial.description ?? sellerProduct.product.description;
  sellerProduct.product.productImageUrl = productPartial.productImageUrl ?? sellerProduct.product.productImageUrl;
  sellerProduct.product.basePrice = productPartial.basePrice ?? sellerProduct.product.basePrice;

  await this.productRepository.save(sellerProduct.product);

  sellerProduct.price = dto.productUnitPrice ?? sellerProduct.price;
  sellerProduct.discountPrice = dto.productDiscountedPrice ?? sellerProduct.discountPrice;
  sellerProduct.size = dto.size ?? sellerProduct.size;
  sellerProduct.stock = dto.productStock ?? sellerProduct.stock;
  sellerProduct.productImageUrl = dto.productImageUrl ?? sellerProduct.productImageUrl;

  const updatedSellerProduct = await this.sellerProductRepository.save(sellerProduct);

  
  const responseDto = this.mapper.map(updatedSellerProduct, SellerProduct, SellerProductBasicResponseDto);

  
  return new SellerProductBasicListResponseDtoWrapper([responseDto], 'Ürün başarıyla güncellendi', true);
}


    async deleteProduct(productId: number, seller: number): Promise<{ message: string }> {
      const sellerProduct = await this.sellerProductRepository.findOne({
        where: { id: productId, seller: { id: seller} },
        relations: ["seller", "seller.user"],
      });
      if (!sellerProduct) {
        throw new NotFoundException(`Ürün ID ${productId} satıcı ${seller} için bulunamadı`);
      }
  
      await this.sellerProductRepository.delete(productId);
      return { message: "Ürün başarıyla silindi" };
    }
  }