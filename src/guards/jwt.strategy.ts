
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Users } from "src/typeorm";
import { Repository } from "typeorm";
import { JwtPayloadDTO } from "./jwt.payload.dto";
import { JwtPayload } from "./jwt.payload.interface";
import { Role } from "src/common/enums/role.enum";
import { Logger } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "SECRETKEY",
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayloadDTO> {
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
      relations: ["seller", "customer", "admin", "admin.levelCode"],
    });

    if (!user) {
      throw new UnauthorizedException("Kullanıcı bulunamadı.");
    }

    if (user.role === Role.SELLER && !user.seller) {
      this.logger.warn(`Kullanıcı ${user.id} satıcı ama seller kaydı yok!`);
      throw new UnauthorizedException("Satıcı kaydı bulunamadı.");
    }

    if (user.role === Role.CUSTOMER && !user.customer) {
      this.logger.warn(`Kullanıcı ${user.id} müşteri ama customer kaydı yok!`);
      throw new UnauthorizedException("Müşteri kaydı bulunamadı.");
    }

    if (user.role === Role.ADMIN) {
      if (!user.admin) {
        throw new UnauthorizedException("Admin kaydı bulunamadı.");
      }
      if (!user.admin.isActive) {
        throw new UnauthorizedException("Admin hesabı aktif değil.");
      }
      if (!user.admin.levelCode || !user.admin.levelCode.isActive) {
        throw new UnauthorizedException("Seviye şifresi geçersiz veya aktif değil.");
      }
      if (user.admin.levelCode.level !== user.admin.adminLevel) {
        throw new UnauthorizedException("Seviye şifresi admin seviyesiyle uyuşmuyor.");
      }
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      sellerId: user.seller?.id,
      customerId: user.customer?.id,
      adminId: user.admin?.id,
      adminLevel: user.admin?.adminLevel, 
    };
  }

}