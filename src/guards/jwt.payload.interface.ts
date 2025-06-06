import { JwtPayloadDTO } from "./jwt.payload.dto";

export interface JwtPayload extends JwtPayloadDTO {
  iat?: number;
  exp?: number;
  
}