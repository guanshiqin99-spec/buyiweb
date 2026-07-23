import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthSessionsService } from '../../modules/auth-sessions/auth-sessions.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly reflector;
    private readonly jwtService;
    private readonly configService;
    private readonly authSessionsService;
    constructor(reflector: Reflector, jwtService: JwtService, configService: ConfigService, authSessionsService: AuthSessionsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
