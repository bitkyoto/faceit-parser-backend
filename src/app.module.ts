import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FaceitModule } from './faceit/faceit.module';
import { SteamModule } from './steam/steam.module';

@Module({
  imports: [FaceitModule, SteamModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
