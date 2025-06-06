import { IsEmail, IsNotEmpty, IsOptional, IsStrongPassword, Matches, MaxLength, MinLength } from "class-validator";

import { DtoPrefix, getValidationMessage, ValidationType } from "src/common/enums/validation.message";





export class RegisterRequestDTO {
    @IsNotEmpty({ message: getValidationMessage(DtoPrefix.EMAIL, ValidationType.NOT_EMPTY) })
    @IsEmail({}, { message: getValidationMessage(DtoPrefix.EMAIL, ValidationType.NOT_VALID) })
    @MaxLength(50, { message: getValidationMessage(DtoPrefix.EMAIL, ValidationType.MAX_LENGTH, 50) })
    email: string;


    @IsNotEmpty({ message: getValidationMessage(DtoPrefix.NAME, ValidationType.NOT_EMPTY) })
    @MinLength(2, { message: getValidationMessage(DtoPrefix.NAME, ValidationType.MIN_LENGTH, 2) })
    @MaxLength(50, { message: getValidationMessage(DtoPrefix.NAME, ValidationType.MAX_LENGTH, 50) })
    name: string;

    @IsNotEmpty({ message: getValidationMessage(DtoPrefix.LASTNAME, ValidationType.NOT_EMPTY) })
    @MinLength(2, { message: getValidationMessage(DtoPrefix.LASTNAME, ValidationType.MIN_LENGTH, 2) })
    @MaxLength(50, { message: getValidationMessage(DtoPrefix.LASTNAME, ValidationType.MAX_LENGTH, 50) })
    lastname: string;


    @IsOptional()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: getValidationMessage(DtoPrefix.PHONE, ValidationType.NOT_VALID)})
    telephoneNumber:string;


    userImage:string;

    @IsNotEmpty({ message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.NOT_EMPTY) })
    @IsStrongPassword({}, { message: getValidationMessage(DtoPrefix.PASSWORD, ValidationType.NOT_STRONG) })
    password: string;

    
   
}