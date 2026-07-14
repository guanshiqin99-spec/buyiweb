import { IsEnum, IsIn, IsInt, Min } from 'class-validator';
import { ContentType } from '../../../common/enums/content-type.enum';

export class CreateLearningRecordDto {
  @IsEnum(ContentType)
  contentType!: ContentType;

  @IsInt()
  @Min(1)
  contentId!: number;

  @IsIn(['view', 'play'])
  actionType!: 'view' | 'play';
}
