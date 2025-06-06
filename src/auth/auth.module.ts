import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customers, Sellers, Users } from 'src/typeorm';
import { JwtStrategy } from 'src/guards/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Admins } from 'src/typeorm/admin.entity';
import { LevelCodes } from 'src/typeorm/level-codes.entity';
import { AdminGuard } from 'src/guards/role.admin.guard';
import { SuperAdminGuard } from 'src/guards/role.super.admin.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    TypeOrmModule.forFeature([Users, Sellers, Customers, Admins, LevelCodes]),
  ],
  providers: [AuthService, JwtStrategy,JwtAuthGuard,AdminGuard,SuperAdminGuard], 
  controllers:[AuthController],
  exports: [AuthService,  PassportModule, JwtModule],
})
export class AuthModule {}