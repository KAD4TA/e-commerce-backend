
import { IsBoolean, IsNumber, Min } from "class-validator";
import { DtoPrefix, getValidationMessage, ValidationType } from "src/common/enums/validation.message";

export class ToggleAdminActiveDto {
  @IsNumber({}, { message: getValidationMessage(DtoPrefix.ADMIN_ID, ValidationType.MUST_BE_NUMBER) })
  @Min(1, { message: getValidationMessage(DtoPrefix.ADMIN_ID, ValidationType.MIN_LENGTH, 1) })
  adminId: number;

  @IsBoolean()
  isActive: boolean;
}