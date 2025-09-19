import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FaceitModule } from './faceit/faceit.module';
import { SteamModule } from './steam/steam.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [FaceitModule, SteamModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
