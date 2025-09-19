import { Module } from '@nestjs/common';
import { SteamService } from './steam.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [SteamService],
  exports: [SteamService],
  imports: [HttpModule, ConfigModule],
})
export class SteamModule {}
