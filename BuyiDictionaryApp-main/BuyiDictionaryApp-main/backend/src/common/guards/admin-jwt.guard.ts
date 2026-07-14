import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminJwtGuard extends JwtAuthGuard {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowed = await super.canActivate(context);
    const request = context.switchToHttp().getRequest<{ user?: { tokenType?: string } }>();
    if (request.user?.tokenType !== 'admin') {
      throw new UnauthorizedException('\u9700\u8981\u7ba1\u7406\u5458\u8eab\u4efd');
    }
    return allowed;
  }
}
