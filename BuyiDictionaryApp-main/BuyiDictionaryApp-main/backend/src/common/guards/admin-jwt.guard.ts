import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminJwtGuard extends JwtAuthGuard {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowed = await super.canActivate(context);
    const request = context.switchToHttp().getRequest<{ user?: { tokenType?: string } }>();
    if (request.user?.tokenType !== 'admin') {
      throw new UnauthorizedException('需要管理员身份');
    }
    return allowed;
  }
}
