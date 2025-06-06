// favorite.controller.ts
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { GetCustomerUser } from 'src/common/decorators/get.customer.user.decorator';
import { GetSellerUser } from 'src/common/decorators/get.seller.user.decorator';
import { FavoriteRequestDto } from 'src/common/dtos/requestDtos/favorite/favorite.request.dto';
import { FavoriteResponseDtoWrapper } from 'src/common/dtos/responseDtos/favorite/favorite.response.dto';
import { CustomerGuard } from 'src/guards/role.customer.guard';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

@Controller("favorites")
export class FavoriteController {
    constructor(private readonly favoriteService: FavoriteService) {}

    @Post("/add-favorite")
    @UseGuards(JwtAuthGuard, CustomerGuard)
    async addFavorite(
        @Body() favoriteDto: FavoriteRequestDto,
        @GetCustomerUser() user: number
    ): Promise<FavoriteResponseDtoWrapper> {
        return this.favoriteService.addFavorite(favoriteDto, user);
    }

    @Delete("/:productId")
    @UseGuards(JwtAuthGuard, CustomerGuard)
    async deleteFavorite(
        @Param("productId") productId: number,
        @GetCustomerUser() user: number
    ): Promise<FavoriteResponseDtoWrapper> {
        return this.favoriteService.deleteFavorite(productId, user);
    }

    @Get("/my-favorites")
    @UseGuards(JwtAuthGuard, CustomerGuard)
    async getFavorites(
        @GetCustomerUser() user: number
    ): Promise<FavoriteResponseDtoWrapper> {
        return this.favoriteService.getFavorites(user);
    }

    @Get("/seller-favorite-counts")
    @UseGuards(JwtAuthGuard, SellerGuard)
    async getSellerFavoriteCounts(
        @GetSellerUser() seller: number
    ): Promise<FavoriteResponseDtoWrapper> {
        return this.favoriteService.getSellerFavoriteCounts(seller);
    }
}