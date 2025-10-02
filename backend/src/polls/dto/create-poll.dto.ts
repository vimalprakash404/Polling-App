import { IsString, IsNotEmpty, IsArray, ArrayMinSize, IsBoolean, IsOptional, IsNumber, Min, Max, ArrayMaxSize, MaxLength, IsMongoId } from 'class-validator';

export class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  options: string[];

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsNumber()
  @Min(1)
  @Max(120)
  durationMinutes: number;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  allowedUsers?: string[];
}
