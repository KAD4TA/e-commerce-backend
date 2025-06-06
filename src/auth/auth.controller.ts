import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { SellerRegisterDto } from 'src/common/dtos/requestDtos/auth/seller.register.request.dto';
import { CustomerRegisterDto } from 'src/common/dtos/requestDtos/auth/customer.register.request.dto';
import { LoginRequestDTO } from 'src/common/dtos/requestDtos/auth/login.request.dto';
import { AdminRegisterDto } from 'src/common/dtos/requestDtos/auth/admin.register.request.dto';
import { AdminLoginDto } from 'src/common/dtos/requestDtos/auth/admin.login.request.dto';
import { ToggleAdminActiveDto } from 'src/common/dtos/requestDtos/auth/toggle-admin-active.request.dto';
import { SuperAdminGuard } from 'src/guards/role.super.admin.guard';
import { GetAdminUser } from 'src/common/decorators/get.admin.user.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
  @Post('/register/seller')
  async sellerRegister(@Body() sellerRegisterDto: SellerRegisterDto) {
    return this.authService.sellerRegister(sellerRegisterDto); 
  }

 
  @Post('/register/customer')
  async customerRegister(@Body() customerRegisterDto: CustomerRegisterDto) {
    return this.authService.customerRegister(customerRegisterDto); 
  }


  @Post('/login')
  async login(@Body() loginDto: LoginRequestDTO) {
    return this.authService.login(loginDto); 
  }

  @Post('/register/admin')
  async registerAdmin(@Body() adminRegisterDto: AdminRegisterDto) {
    return this.authService.registerAdmin(adminRegisterDto);
  }

  @Post('/login/admin')
  async loginAdmin(@Body() loginDto: AdminLoginDto) {
    return this.authService.loginAdmin(loginDto);
  }

 
  // Soft Delete: Admin is made inactive (normal admins can make it inactive, only super admins can make it active)
  @Patch('/admin/:id/active')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async toggleAdminActiveStatus(
    @Param('id', ParseIntPipe) adminId: number,
    @Body() dto: ToggleAdminActiveDto,
    @GetAdminUser() requesterAdminId: number,
  ) {
    return this.authService.toggleAdminActiveStatus(
      { ...dto, adminId },
      requesterAdminId,
    );
  }

  // Hard Delete: Only super admins can completely delete the admin account
  @Delete('/admin/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async deleteAdmin(
    @Param('id', ParseIntPipe) adminId: number,
    @GetAdminUser() requesterAdminId: number,
  ) {
    return this.authService.deleteAdmin(adminId, requesterAdminId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req): Promise<{ message: string }> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User could not be authenticated');
    }

    await this.authService.logout(user.id);
    return { message: 'Logged out successfully' };
  }
}
