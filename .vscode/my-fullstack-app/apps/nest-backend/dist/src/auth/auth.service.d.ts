import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private oktaJwtVerifier;
    constructor(prisma: PrismaService);
    verifyOktaToken(accessToken: string): Promise<any>;
    private findOrCreateUser;
    validateUser(email: string, password: string): Promise<any>;
}
