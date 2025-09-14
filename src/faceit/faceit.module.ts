import { Module } from '@nestjs/common';
import { FaceitService } from './faceit.service';
import { FaceitController } from './faceit.controller';
import { SteamService } from 'src/steam/steam.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  controllers: [FaceitController],
  providers: [FaceitService, SteamService],
  imports: [HttpModule],
})
export class FaceitModule {}
