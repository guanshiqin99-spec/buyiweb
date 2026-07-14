import { AdminRole } from '../common/enums/admin-role.enum';
export declare class Admin {
    id: number;
    username: string;
    passwordHash: string;
    role: AdminRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
