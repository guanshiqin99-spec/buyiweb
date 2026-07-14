import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
export declare class MiniappJwtGuard extends JwtAuthGuard {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
