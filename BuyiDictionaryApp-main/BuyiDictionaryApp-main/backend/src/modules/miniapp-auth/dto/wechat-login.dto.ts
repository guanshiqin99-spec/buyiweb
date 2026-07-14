import { IsOptional, IsString, MaxLength } from 'class-validator';

export class WechatLoginDto {
  @IsString()
  @MaxLength(255)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  openid?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}
