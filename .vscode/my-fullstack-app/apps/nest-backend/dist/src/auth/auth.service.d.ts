import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private oktaJwtVerifier;
    constructor(prisma: PrismaService);
    verifyOktaToken(accessToken: string): Promise<{
        id: number;
        email: string;
        name: string | null;
        createdAt: Date;
    }>;
    private findOrCreateUser;
    validateUser(email: string, password: string): Promise<{
        id: number;
        email: string;
        name: string | null;
        createdAt: Date;
    }>;
}
