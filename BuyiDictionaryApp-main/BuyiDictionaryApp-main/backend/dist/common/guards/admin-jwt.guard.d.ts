import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
export declare class AdminJwtGuard extends JwtAuthGuard {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
