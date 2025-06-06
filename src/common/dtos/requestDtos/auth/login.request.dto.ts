import { IsNotEmpty, IsStrongPassword, MaxLength, MinLength } from "class-validator";
import { DtoPrefix, getValidationMessage, ValidationType } from "src/common/enums/validation.message";


export class LoginRequestDTO {
    @IsNotEmpty({ message: getValidationMessage(DtoPrefix.EMAIL, ValidationType.NOT_EMPTY) })
    @MinLength(6, { message: getValidationMessage(DtoPrefix.EMAIL, ValidationType.MIN_LENGTH, 6) })
    @MaxLength(50, { message: getValidationMessage(DtoPrefix.EMAIL, ValidationType.MAX_LENGTH, 50) })
    email: string;

    @IsNotEmpty({ message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.NOT_EMPTY) })
    @MinLength(6, { message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.MIN_LENGTH, 6) })
    @MaxLength(50, { message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.MAX_LENGTH, 50) })
    @IsStrongPassword({}, { message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.NOT_STRONG) })
    password: string;
}