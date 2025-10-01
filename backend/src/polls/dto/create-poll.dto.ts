import { IsString, IsNotEmpty, IsArray, ArrayMinSize, IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
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
  allowedUsers?: string[];
}
