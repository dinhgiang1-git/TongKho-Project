import { PartialType } from '@nestjs/swagger';
import { CreateProductPhotoDto } from './create-product-photo.dto';

export class UpdateProductPhotoDto extends PartialType(CreateProductPhotoDto) {}
