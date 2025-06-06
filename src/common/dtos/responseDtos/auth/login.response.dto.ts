import { BaseResponse } from "src/base/base.response";
import {  UserResponseDto } from "../user/user.response.dto";


export class LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
}

export class LoginResponseDTO extends BaseResponse<LoginResponse> {
    constructor(data: LoginResponse, message: string, success: boolean) {
        super(data, message, success);
    }
}