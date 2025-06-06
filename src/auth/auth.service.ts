import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customers, Sellers, Users } from 'src/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDTO } from 'src/common/dtos/responseDtos/auth/login.response.dto';
import { UserResponseDto } from 'src/common/dtos/responseDtos/user/user.response.dto';
import { LoginRequestDTO } from 'src/common/dtos/requestDtos/auth/login.request.dto';
import { RegisterResponseDTO } from 'src/common/dtos/responseDtos/auth/register.response.dto';
import { CustomerRegisterDto } from 'src/common/dtos/requestDtos/auth/customer.register.request.dto';
import { SellerRegisterDto } from 'src/common/dtos/requestDtos/auth/seller.register.request.dto';
import { Role } from 'src/common/enums/role.enum';
import { JwtPayload } from 'src/guards/jwt.payload.interface';
import { Admins } from 'src/typeorm/admin.entity';
import { LevelCodes } from 'src/typeorm/level-codes.entity';
import { AdminRegisterDto } from 'src/common/dtos/requestDtos/auth/admin.register.request.dto';
import { AdminLoginDto } from 'src/common/dtos/requestDtos/auth/admin.login.request.dto';
import { ToggleAdminActiveDto } from 'src/common/dtos/requestDtos/auth/toggle-admin-active.request.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Sellers)
    private readonly sellerRepository: Repository<Sellers>,
    @InjectRepository(Customers)
    private readonly customerRepository: Repository<Customers>,
    @InjectRepository(Admins)
    private readonly adminRepository: Repository<Admins>,
    @InjectRepository(LevelCodes)
    private readonly levelCodeRepository: Repository<LevelCodes>,
    private readonly jwtService: JwtService,
  ) {}

  async sellerRegister(
    sellerRegisterDto: SellerRegisterDto,
  ): Promise<RegisterResponseDTO> {
    const existingUser = await this.userRepository.findOne({
      where: { email: sellerRegisterDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('This email is already in use.');
    }

    const hashedPassword = await bcrypt.hash(sellerRegisterDto.password, 10);
    console.log('registerSellerDto', sellerRegisterDto);
    const newUser = this.userRepository.create({
      name: sellerRegisterDto.name,
      lastName: sellerRegisterDto.lastname,
      email: sellerRegisterDto.email,
      password: hashedPassword,
      role: Role.SELLER,
    });
    console.log('new user seller', newUser);
    try {
      const seller = new Sellers();
      seller.storeName = sellerRegisterDto.storeName;
      seller.storeAddress = sellerRegisterDto.storeAddress;
      seller.taxNumber = sellerRegisterDto.taxNumber;
      seller.user = newUser; // Associate with the user
      await this.sellerRepository.save(seller);
      newUser.seller = seller;

      await this.userRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred during registration.',
      );
    }

    const userResponse: UserResponseDto = {
      id: newUser.id,
      name: newUser.name,
      lastName: newUser.lastName,
      userImage: newUser.userImage || '',
      email: newUser.email,
    };

    return new RegisterResponseDTO(
      { user: userResponse },
      'Registration successful',
      true,
    );
  }

  async customerRegister(
    customerRegisterDto: CustomerRegisterDto,
  ): Promise<RegisterResponseDTO> {
    const existingUser = await this.userRepository.findOne({
      where: { email: customerRegisterDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('This email is already in use.');
    }

    const hashedPassword = await bcrypt.hash(customerRegisterDto.password, 10);

    const newUser = this.userRepository.create({
      name: customerRegisterDto.name,
      lastName: customerRegisterDto.lastname,
      email: customerRegisterDto.email,
      password: hashedPassword,
      role: Role.CUSTOMER,
    });

    try {
      const customer = new Customers();
      customer.address = customerRegisterDto.address;
      customer.city = customerRegisterDto.city;
      customer.user = newUser; // Associate with the user
      await this.customerRepository.save(customer);
      newUser.customer = customer;

      await this.userRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred during registration.',
      );
    }

    const userResponse: UserResponseDto = {
      id: newUser.id,
      name: newUser.name,
      lastName: newUser.lastName,
      userImage: newUser.userImage || '',
      email: newUser.email,
    };

    return new RegisterResponseDTO(
      { user: userResponse },
      'Registration successful',
      true,
    );
  }

  async registerAdmin(adminRegisterDto: AdminRegisterDto): Promise<RegisterResponseDTO> {
    const existingUser = await this.userRepository.findOne({
      where: { email: adminRegisterDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('This email is already in use.');
    }

    const levelCode = await this.levelCodeRepository.findOne({
      where: { code: adminRegisterDto.levelCode, isActive: true },
    });
    if (!levelCode) {
      throw new BadRequestException('Invalid or inactive level code.');
    }
    if (levelCode.assignedUserId) {
      throw new BadRequestException('Level code is already assigned to another user.');
    }

    const hashedPassword = await bcrypt.hash(adminRegisterDto.password, 10);
    const newUser = this.userRepository.create({
      name: adminRegisterDto.name,
      lastName: adminRegisterDto.lastName,
      email: adminRegisterDto.email,
      password: hashedPassword,
      userImage: adminRegisterDto.userImage || 'default-user-image.png',
      role: Role.ADMIN,
    });

    try {
      await this.userRepository.save(newUser); 

      levelCode.assignedUserId = newUser.id;
      await this.levelCodeRepository.save(levelCode);

      const admin = new Admins();
      admin.isActive = true;
      admin.adminLevel = levelCode.level;
      admin.user = newUser;
      admin.levelCode = levelCode;

      await this.adminRepository.save(admin);
      newUser.admin = admin;

      await this.userRepository.save(newUser);

      const userResponse: UserResponseDto = {
        id: newUser.id,
        name: newUser.name,
        lastName: newUser.lastName,
        userImage: newUser.userImage,
        email: newUser.email,
      };

      this.logger.log(`Admin registered: ${newUser.email}, Level: ${admin.adminLevel}`);
      return new RegisterResponseDTO({ user: userResponse }, 'Admin registered successfully', true);
    } catch (error) {
      this.logger.error(`Error registering admin: ${error.message}`);
      throw new InternalServerErrorException('Error during admin registration.');
    }
  }

  async loginAdmin(loginDto: AdminLoginDto): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email, role: Role.ADMIN },
      relations: ['admin', 'admin.levelCode'],
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      if (user?.admin) {
        user.admin.failedLoginAttempts += 1;
        if (user.admin.failedLoginAttempts >= 5) {
          user.admin.isLocked = true;
        }
        await this.adminRepository.save(user.admin);
      }
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.admin) {
      throw new UnauthorizedException('Admin record not found.');
    }

    if (!user.admin.isActive) {
      throw new UnauthorizedException('Admin account is not active.');
    }
    if (user.admin.isLocked) {
      throw new UnauthorizedException('Admin account is locked.');
    }
    if (
      user.admin.lastLogin &&
      new Date(user.admin.lastLogin) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ) {
      throw new UnauthorizedException('Account inactive for 30 days, please re-verify.');
    }

    user.admin.lastLogin = new Date();
    user.admin.failedLoginAttempts = 0;
    await this.adminRepository.save(user.admin);

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      adminId: user.admin.id,
      adminLevel: user.admin.adminLevel,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    const userResponse: UserResponseDto = {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      userImage: user.userImage,
      email: user.email,
    };

    this.logger.log(`Admin logged in: ${user.email}, Level: ${user.admin.adminLevel}`);
    return new LoginResponseDTO(
      { accessToken, refreshToken, user: userResponse },
      'Admin login successful',
      true,
    );
  }

  async toggleAdminActiveStatus(dto: ToggleAdminActiveDto & { adminId: number }, requesterAdminId: number) {
    const admin = await this.adminRepository.findOne({
      where: { id: dto.adminId },
      relations: ['user', 'levelCode'],
    });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const requester = await this.adminRepository.findOne({
      where: { id: requesterAdminId },
      relations: ['user', 'levelCode'],
    });
    if (!requester) {
      throw new NotFoundException('Requester admin not found');
    }

    // Throw error if non-super admin tries to activate
    if (dto.isActive && requester.levelCode?.level !== 2) {
      throw new ForbiddenException('Only super admins can reactivate an admin account');
    }

    admin.isActive = dto.isActive;
    await this.adminRepository.save(admin);
    return { message: `Admin ${dto.isActive ? 'activated' : 'deactivated'} successfully` };
  }

  async deleteAdmin(adminId: number, requesterAdminId: number) {
    const adminToDelete = await this.adminRepository.findOne({
      where: { id: adminId },
      relations: ['user', 'levelCode'],
    });

    if (!adminToDelete) {
      throw new BadRequestException('Admin not found');
    }

    const requestingAdmin = await this.adminRepository.findOne({
      where: { id: requesterAdminId },
      relations: ['levelCode'],
    });

    if (!requestingAdmin || requestingAdmin.levelCode?.level !== 2) {
      throw new UnauthorizedException('Only super admins can delete an admin account');
    }

    // Perform deletion
    await this.userRepository.delete(adminToDelete.user.id);
    return { message: 'Admin deleted successfully' };
  }

  async login(loginDto: LoginRequestDTO): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['seller', 'customer'],
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    let payload: any = {
      id: user.id,
      role: user.role,
    };

    if (user.role === 'SELLER') {
      payload.sellerId = user.seller?.id || null;
    } else if (user.role === 'CUSTOMER') {
      payload.customerId = user.customer?.id || null;
    }

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    const userResponse: UserResponseDto = {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      userImage: user.userImage || '',
      email: user.email,
    };

    return new LoginResponseDTO(
      {
        accessToken,
        refreshToken,
        user: userResponse,
      },
      'Login successful',
      true,
    );
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    try {
      // Verify refresh token and get payload
      const payload = this.jwtService.verify(refreshToken);

      // Find user with relations
      const user = await this.userRepository.findOne({
        where: { id: payload.id },
        relations: ['seller', 'customer', 'admin'],
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      let newAccessToken: string;

      switch (user.role) {
        case 'SELLER':
          newAccessToken = this.jwtService.sign(
            {
              id: user.id,
              role: user.role,
              sellerId: user.seller?.id ?? null,
            },
            { expiresIn: '1h' },
          );
          break;

        case 'CUSTOMER':
          newAccessToken = this.jwtService.sign(
            {
              id: user.id,
              role: user.role,
              customerId: user.customer?.id ?? null,
            },
            { expiresIn: '1h' },
          );
          break;

        case 'ADMIN':
          newAccessToken = this.jwtService.sign(
            {
              id: user.id,
              role: user.role,
              adminId: user.admin?.id ?? null,
              adminLevel: user.admin?.adminLevel ?? null,
            },
            { expiresIn: '1h' },
          );
          break;

        default:
          throw new UnauthorizedException('Invalid user role.');
      }

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  async logout(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    user.refreshToken = undefined;
    await this.userRepository.save(user);
  }
}