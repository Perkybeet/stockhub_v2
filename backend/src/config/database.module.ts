import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
})
export class DatabaseModule {
  constructor(private configService: ConfigService) {}

  getDatabaseConfig() {
    return {
      url: this.configService.get<string>('DATABASE_URL'),
    };
  }
}