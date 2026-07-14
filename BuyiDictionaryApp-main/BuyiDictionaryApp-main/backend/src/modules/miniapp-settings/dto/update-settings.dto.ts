import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark', 'auto'])
  theme?: string;

  @IsOptional()
  @IsString()
  @IsIn(['small', 'medium', 'large', '小', '中', '大'])
  fontSize?: string;

  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  autoplay?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['zh-CN', 'en-US'])
  language?: string;
}
