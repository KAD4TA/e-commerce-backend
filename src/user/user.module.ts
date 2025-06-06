import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserProfile } from 'src/mapping/user.mapping';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/typeorm';
import { AdminGuard } from 'src/guards/role.admin.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[TypeOrmModule.forFeature([Users]),AuthModule],
  controllers: [UserController],
  providers: [UserService,UserProfile,AdminGuard],
})
export class UserModule {}
