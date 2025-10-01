import { IsNumber, Min } from 'class-validator';

export class VoteDto {
  @IsNumber()
  @Min(0)
  optionIndex: number;
}
