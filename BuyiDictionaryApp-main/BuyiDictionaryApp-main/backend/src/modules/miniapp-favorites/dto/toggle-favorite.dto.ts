import { IsEnum, IsInt, Min } from 'class-validator';
import { ContentType } from '../../../common/enums/content-type.enum';

export class ToggleFavoriteDto {
  @IsEnum(ContentType)
  contentType!: ContentType;

  @IsInt()
  @Min(1)
  contentId!: number;
}
