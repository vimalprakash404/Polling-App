import { IsNumber, Min, IsInt } from 'class-validator';

export class VoteDto {
  @IsInt()
  @Min(0)
  optionIndex: number;
}
