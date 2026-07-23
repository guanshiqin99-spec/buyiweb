import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class MiniappJwtGuard extends JwtAuthGuard {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowed = await super.canActivate(context);
    const request = context.switchToHttp().getRequest<{ user?: { tokenType?: string } }>();
    if (request.user?.tokenType !== 'miniapp') {
      throw new UnauthorizedException('需要小程序用户身份');
    }
    return allowed;
  }
}
