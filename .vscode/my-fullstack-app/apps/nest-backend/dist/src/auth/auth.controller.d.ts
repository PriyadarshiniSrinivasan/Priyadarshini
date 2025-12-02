import { AuthService } from './auth.service';
export declare class VerifyTokenDto {
    accessToken: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    verifyOktaToken(verifyTokenDto: VerifyTokenDto): Promise<{
        success: boolean;
        user: {
            id: number;
            email: string;
            name: string;
        };
        message: string;
    }>;
    getProfile(authHeader: string): Promise<{
        success: boolean;
        user: {
            id: number;
            email: string;
            name: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: any;
        user: {
            id: number;
            email: string;
            name: string;
        };
    }>;
}
