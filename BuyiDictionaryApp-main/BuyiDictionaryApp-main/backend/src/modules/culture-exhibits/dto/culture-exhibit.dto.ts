import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl, Length, Max, Min } from 'class-validator';
import { ContentType } from '../../../common/enums/content-type.enum';

export class CreateCultureExhibitDto {
  @IsString()
  @Length(2, 96)
  slug!: string;

  @IsString()
  @Length(2, 120)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  kicker?: string;

  @IsString()
  summary!: string;

  @IsOptional()
  @IsString()
  story?: string;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  patternLabel?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5)
  toneIndex?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  featuredSongId?: number | null;

  @IsString()
  @Length(2, 255)
  sourceTitle!: string;

  @IsUrl({ require_tld: false })
  @Length(8, 500)
  sourceUrl!: string;

  @IsOptional()
  @IsEnum(['verified', 'pending'])
  sourceStatus?: 'verified' | 'pending';

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateCultureExhibitDto extends PartialType(CreateCultureExhibitDto) {}

export class CreateContentCultureLinkDto {
  @IsEnum(ContentType)
  contentType!: ContentType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  contentId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  exhibitId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
