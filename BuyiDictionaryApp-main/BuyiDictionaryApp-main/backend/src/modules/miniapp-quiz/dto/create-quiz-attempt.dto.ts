import { ArrayMaxSize, IsArray, IsInt, IsObject, Max, Min } from 'class-validator';

export class CreateQuizAttemptDto {
  @IsInt()
  @Min(0)
  @Max(10000)
  score!: number;

  @IsInt()
  @Min(0)
  @Max(1000)
  correctCount!: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  totalQuestions!: number;

  @IsArray()
  @ArrayMaxSize(1000)
  @IsObject({ each: true })
  answers!: Array<Record<string, unknown>>;
}
