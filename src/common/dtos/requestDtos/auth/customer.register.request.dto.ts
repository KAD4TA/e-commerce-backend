import { RegisterRequestDTO } from "./register.request.dto";




export class CustomerRegisterDto extends RegisterRequestDTO{
    address:string;
    city:string;
}