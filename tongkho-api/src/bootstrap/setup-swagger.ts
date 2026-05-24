import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { UserModel } from "src/modules/user/model/user.model";

export function setupSwagger(app: INestApplication): void {
	const configDocument = new DocumentBuilder()
		.setTitle("API document")
		.setDescription("APIs documents for FARM MANAGEMENT Project")
		.setVersion("1")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				in: "header",
			},
			"access-token",
		)
		.build();

	const document = SwaggerModule.createDocument(app, configDocument, {
		extraModels: [UserModel],
	});

	SwaggerModule.setup("api-docs", app, document, {
		swaggerOptions: {
			persistAuthorization: true,
		},
	});
}
