import { BaseResponse } from "src/base/base.response";

export  class UserResponseDto {
    id: number;
    name: string;
    lastName:string;
    userImage?:string;
    telephoneNumber?: string; 
    email: string;
}

export class UserResponseDtoWrapper extends BaseResponse<UserResponseDto[]> {
    constructor(data: UserResponseDto[], message: string, success: boolean) {
        super(data, message, success);
    }

}