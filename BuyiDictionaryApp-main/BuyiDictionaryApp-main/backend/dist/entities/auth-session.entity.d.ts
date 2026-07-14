export declare class AuthSession {
    id: number;
    sessionId: string;
    userType: 'miniapp' | 'admin';
    userId: number;
    refreshTokenHash: string;
    isActive: boolean;
    expiresAt: Date;
    lastUsedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
