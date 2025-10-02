import { IsArray, IsMongoId } from 'class-validator';

export class UpdateAllowedUsersDto {
  @IsArray()
  @IsMongoId({ each: true })
  allowedUsers: string[];
}
