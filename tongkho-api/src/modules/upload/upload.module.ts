import { Module } from "@nestjs/common";
import { UploadController } from "./upload.controller";
import { multerModuleOptions } from "src/common/config/multer.config";
import { MulterModule } from "@nestjs/platform-express";

@Module({
	imports: [MulterModule.registerAsync(multerModuleOptions)],
	controllers: [UploadController],
	providers: [UploadController],
})
export class UploadModule {}
