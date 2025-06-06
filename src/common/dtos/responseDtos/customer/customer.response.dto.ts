import { BaseResponse } from "src/base/base.response";
import { UserResponseDto } from "../user/user.response.dto";



export class CustomerResponseDto {
    customerId: number;
    address?: string;
    city?: string;
    user: UserResponseDto;
}

export class CustomerResponseDtoWrapper extends BaseResponse<CustomerResponseDto> {
    constructor(data: CustomerResponseDto, message: string, success: boolean) {
            super(data, message, success);
        }
}
