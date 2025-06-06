import { BaseResponse } from "src/base/base.response";
import {  UserResponseDto } from "../user/user.response.dto";


export class RegisterResponse {
    user: UserResponseDto;
}

export class RegisterResponseDTO extends BaseResponse<RegisterResponse> {
    constructor(data: RegisterResponse, message: string, success: boolean) {
        super(data, message, success);
    }
}