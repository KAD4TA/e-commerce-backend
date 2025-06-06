import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AdminGuard } from 'src/guards/role.admin.guard';
import { UserResponseDtoWrapper } from 'src/common/dtos/responseDtos/user/user.response.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getAllUsers() {
        return this.userService.findAll();
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getUser(@Param('id') id: number): Promise<UserResponseDtoWrapper> {
        return this.userService.findOne(id);
    }

    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    async deleteUser(@Param('id') id: number, @Req() req) {
        return this.userService.delete(id, req.user.id, req.user.role);
    }
}