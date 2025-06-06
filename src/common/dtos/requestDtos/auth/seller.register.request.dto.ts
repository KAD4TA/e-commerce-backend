import { IsNotEmpty, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";
import { RegisterRequestDTO } from "./register.request.dto";
import { DtoPrefix, getValidationMessage, ValidationType } from "src/common/enums/validation.message";




export class SellerRegisterDto extends RegisterRequestDTO{

  @IsNotEmpty({ message: getValidationMessage(DtoPrefix.STORE_NAME, ValidationType.NOT_EMPTY) })
  @IsString({ message: getValidationMessage(DtoPrefix.STORE_NAME, ValidationType.MUST_BE_STRING) })
  @MinLength(2, { message: getValidationMessage(DtoPrefix.STORE_NAME, ValidationType.MIN_LENGTH, 2) })
  @MaxLength(100, { message: getValidationMessage(DtoPrefix.STORE_NAME, ValidationType.MAX_LENGTH, 100) })
  storeName: string;

  @IsNotEmpty({ message: getValidationMessage(DtoPrefix.STORE_ADDRESS, ValidationType.NOT_EMPTY) })
  @IsString({ message: getValidationMessage(DtoPrefix.STORE_ADDRESS, ValidationType.MUST_BE_STRING) })
  @MinLength(5, { message: getValidationMessage(DtoPrefix.STORE_ADDRESS, ValidationType.MIN_LENGTH, 5) })
  @MaxLength(200, { message: getValidationMessage(DtoPrefix.STORE_ADDRESS, ValidationType.MAX_LENGTH, 200) })
  storeAddress: string;

  @IsNotEmpty({ message: getValidationMessage(DtoPrefix.TAX_NUMBER, ValidationType.NOT_EMPTY) })
  @IsString({ message: getValidationMessage(DtoPrefix.TAX_NUMBER, ValidationType.MUST_BE_STRING) })
  @Matches(/^\d{10}$/, { message: getValidationMessage(DtoPrefix.TAX_NUMBER, ValidationType.NOT_VALID) })
  taxNumber: string;
}