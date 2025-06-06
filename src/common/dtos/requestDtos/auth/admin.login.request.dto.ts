
import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { DtoPrefix, getValidationMessage, ValidationType } from "src/common/enums/validation.message";

export class AdminLoginDto {
  @IsEmail({}, { message: getValidationMessage(DtoPrefix.EMAIL, ValidationType.WRONG_EMAIL_FORMAT) })
  email: string;

  @IsNotEmpty({ message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.NOT_EMPTY) })
  @IsString({ message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.MUST_BE_STRING) })
  password: string;

  @IsNotEmpty({ message: getValidationMessage(DtoPrefix.LEVEL_CODE, ValidationType.NOT_EMPTY) })
  @IsUUID('4', { message: getValidationMessage(DtoPrefix.LEVEL_CODE, ValidationType.NOT_VALID) })
  levelCode: string; // UUID
}