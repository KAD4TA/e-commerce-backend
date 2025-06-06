import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InjectMapper } from "@automapper/nestjs";
import { Mapper } from "@automapper/core";
import { ProductResponseDto, ProductResponseDtoWrapper } from "src/common/dtos/responseDtos/product/product.response.dto";
import { Products, SellerProduct, Categories } from "src/typeorm";
import { CategoryEnum } from "src/common/enums/category.enum";
import { ProductPriceService } from "src/product-price/product-price.service";
import { SellerProductDetailedListResponseDtoWrapper, SellerProductDetailedResponseDto } from "src/common/dtos/responseDtos/seller/seller.product.detailed.response.dto";


@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Products) private readonly productRepository: Repository<Products>,
    @InjectRepository(SellerProduct) private readonly sellerProductRepository: Repository<SellerProduct>,
    private productPriceService: ProductPriceService,
    @InjectRepository(Categories) private readonly categoryRepository: Repository<Categories>,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  async findAll(
    categoryName?: string,
    sellerName?: string,
    productName?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProductResponseDtoWrapper> {
    const query = this.productRepository.createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.sellerProducts", "sellerProduct")
      .leftJoinAndSelect("sellerProduct.seller", "seller");
  
    // category name filter
    if (categoryName) {
      const categoryEnumValue = CategoryEnum[categoryName.toUpperCase() as keyof typeof CategoryEnum];
      if (categoryEnumValue !== undefined) {
        query.andWhere("category.categoryId = :categoryEnumValue", { categoryEnumValue });
      } else {
        throw new Error(`Geçersiz kategori adı: ${categoryName}`);
      }
    }
  
    // Seller name filter
    if (sellerName) {
      query.andWhere("LOWER(seller.storeName) LIKE LOWER(:sellerName)", {
        sellerName: `%${sellerName}%`,
      });
    }
  
    // Product name filter
    if (productName) {
      query.andWhere("LOWER(product.name) LIKE LOWER(:productName)", {
        productName: `%${productName}%`,
      });
    }
  
    // paging
    const [products, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  
    
    const responseDtos = products.map((product) => {
      const sellerProducts = product.sellerProducts ?? [];
  
      const productDto = this.mapper.map(product, Products, ProductResponseDto);
  
      
      if (sellerProducts.length === 0) {
        productDto.basePrice = -1; 
        productDto.productImageUrl = product.productImageUrl;
        return productDto;
      }
  
      
      const lowestPriceSellerProduct = sellerProducts.reduce((prev, curr) => {
        const prevPrice = prev.discountPrice ?? prev.price;
        const currPrice = curr.discountPrice ?? curr.price;
        return currPrice < prevPrice ? curr : prev;
      }, sellerProducts[0]);
  
      productDto.productImageUrl = lowestPriceSellerProduct.productImageUrl;
      productDto.basePrice = lowestPriceSellerProduct.discountPrice ?? lowestPriceSellerProduct.price;
  
      return productDto;
    });
  
    return {
      data: responseDtos,
      success: true,
      message: "Ürünler başarıyla getirildi",
      meta: { total, page, limit },
    };
  }


  async getProductAllSellers(productId: number): Promise<SellerProductDetailedListResponseDtoWrapper> {
  const sellerProducts = await this.sellerProductRepository.find({
    where: { product: { id: productId } },
    relations: ["seller", "seller.user", "product", "favorites"],
  });

  if (!sellerProducts.length) {
    return new SellerProductDetailedListResponseDtoWrapper([], "Ürün bulunamadı", false);
  }

  const response = sellerProducts.map((sp) => {
  const mappedProduct = this.mapper.map(sp, SellerProduct, SellerProductDetailedResponseDto);

  mappedProduct.otherSellers = sellerProducts
    .filter((otherSp) => otherSp.id !== sp.id)
    .map((otherSp) => ({
      id: otherSp.id,  
      sellerName: otherSp.seller.storeName,
      productName: otherSp.product.name,
      price: otherSp.price,
      discountPrice: otherSp.discountPrice ?? null,
      productImageUrl: otherSp.productImageUrl,
    }));

  return mappedProduct;
});

  return new SellerProductDetailedListResponseDtoWrapper(
    response,
    "Ürün ve diğer satıcılar başarıyla getirildi",
    true
  );
}
}