
import { IsNumber, IsString, Min } from "class-validator";

export class AssignLevelCodeDto {
  @IsNumber()
  @Min(1)
  adminId: number;

  @IsString()
  code: string;
}