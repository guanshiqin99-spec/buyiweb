import { IsString, Length } from 'class-validator';

export class ScoreDto {
  @IsString()
  @Length(1, 255)
  targetText!: string;

  // 允许空串：识别失败时前端会传空字符串
  @IsString()
  @Length(0, 255)
  recognizedText!: string;
}
