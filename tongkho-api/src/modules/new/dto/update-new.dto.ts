import { PartialType } from '@nestjs/swagger';
import { CreateNewDto } from './create-new.dto';

export class UpdateNewDto extends PartialType(CreateNewDto) {}
