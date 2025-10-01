import { IsString, IsOptional } from 'class-validator';

export class UpdatePollDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
