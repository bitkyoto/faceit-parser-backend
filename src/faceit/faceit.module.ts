import { Module } from '@nestjs/common';
import { FaceitService } from './faceit.service';
import { FaceitController } from './faceit.controller';
import { SteamService } from 'src/steam/steam.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [FaceitController],
  providers: [FaceitService, SteamService],
  imports: [HttpModule, ConfigModule],
})
export class FaceitModule {}
