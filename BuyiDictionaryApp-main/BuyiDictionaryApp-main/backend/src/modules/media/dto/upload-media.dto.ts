import { IsIn, IsOptional, IsString } from 'class-validator';

export class UploadMediaDto {
  @IsString()
  @IsIn(['image', 'audio'])
  kind!: 'image' | 'audio';

  @IsOptional()
  @IsString()
  filename?: string;
}
