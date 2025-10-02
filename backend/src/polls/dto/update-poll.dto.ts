import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdatePollDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
