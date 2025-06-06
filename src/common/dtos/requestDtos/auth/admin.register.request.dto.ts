
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsArray, IsUUID } from "class-validator";
import { DtoPrefix, getValidationMessage, ValidationType } from "src/common/enums/validation.message";

export class AdminRegisterDto {
  @IsNotEmpty({ message: getValidationMessage(DtoPrefix.NAME, ValidationType.NOT_EMPTY) })
  @IsString({ message: getValidationMessage(DtoPrefix.NAME, ValidationType.MUST_BE_STRING) })
  name: string;

  @IsNotEmpty({ message: getValidationMessage(DtoPrefix.LASTNAME, ValidationType.NOT_EMPTY) })
  @IsString({ message: getValidationMessage(DtoPrefix.LASTNAME, ValidationType.MUST_BE_STRING) })
  lastName: string;

  @IsEmail({}, { message: getValidationMessage(DtoPrefix.EMAIL, ValidationType.WRONG_EMAIL_FORMAT) })
  email: string;

  @MinLength(8, { message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.MIN_LENGTH, 8) })
  @IsString({ message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.MUST_BE_STRING) })
  password: string;

  @IsOptional()
  @IsString({ message: getValidationMessage(DtoPrefix.USER_IMAGE, ValidationType.MUST_BE_STRING) })
  userImage?: string;

  @IsNotEmpty({ message: getValidationMessage(DtoPrefix.LEVEL_CODE, ValidationType.NOT_EMPTY) })
  @IsUUID('4', { message: getValidationMessage(DtoPrefix.LEVEL_CODE, ValidationType.NOT_VALID) })
  levelCode: string; // UUID, 

}