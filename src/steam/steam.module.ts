import { Module } from '@nestjs/common';
import { SteamService } from './steam.service';
import { HttpModule  } from '@nestjs/axios';

@Module({
  providers: [SteamService],
  exports: [SteamService],
  imports: [HttpModule],
})
export class SteamModule {}
