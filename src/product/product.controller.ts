import { Controller, Get, Param, Query, ParseIntPipe } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductResponseDtoWrapper } from "src/common/dtos/responseDtos/product/product.response.dto";
import { SellerProductDetailedListResponseDtoWrapper } from "src/common/dtos/responseDtos/seller/seller.product.detailed.response.dto";


@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get("allProducts")
  async findAll(
    @Query("categoryName") categoryName?: string,
    @Query("sellerName") sellerName?: string,
    @Query("productName") productName?: string,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1, 
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 10 
  ): Promise<ProductResponseDtoWrapper> {
    return this.productService.findAll(categoryName, sellerName, productName, page, limit);
  }

  @Get("/:id")
  async getProductAllSellers(@Param("id") productId: number): Promise<SellerProductDetailedListResponseDtoWrapper> {
    return this.productService.getProductAllSellers(productId);
  }
}