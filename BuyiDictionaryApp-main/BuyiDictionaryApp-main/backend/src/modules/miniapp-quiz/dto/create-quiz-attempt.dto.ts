import { ArrayMaxSize, IsArray, IsIn, IsInt, IsObject, IsOptional, Max, Min } from 'class-validator';

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

  // 答题模式:缺省视为 culture(旧客户端不传该字段),保持完全向后兼容
  @IsOptional()
  @IsIn(['culture', 'pronunciation'])
  mode?: 'culture' | 'pronunciation';

  @IsArray()
  @ArrayMaxSize(1000)
  @IsObject({ each: true })
  answers!: Array<Record<string, unknown>>;
}
