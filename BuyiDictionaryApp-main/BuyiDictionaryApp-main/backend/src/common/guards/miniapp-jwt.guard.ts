import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class MiniappJwtGuard extends JwtAuthGuard {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowed = await super.canActivate(context);
    const request = context.switchToHttp().getRequest<{ user?: { tokenType?: string } }>();
    if (request.user?.tokenType !== 'miniapp') {
      throw new UnauthorizedException('\u9700\u8981\u5c0f\u7a0b\u5e8f\u7528\u6237\u8eab\u4efd');
    }
    return allowed;
  }
}
