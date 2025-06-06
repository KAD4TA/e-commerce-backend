
export class JwtPayloadDTO {
  id: number;
  email: string;
  role: string;
  adminId?: number;
  adminLevel?: number; // 1 for Normal Admin, 2 for Super Admin
  sellerId?: number;
  customerId?: number;
}
  