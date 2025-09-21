import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  HttpException,
  NotFoundException,
  LoggerService,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FaceitService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger(FaceitService.name);
  async getStats(player_id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://open.faceit.com/data/v4/players/${player_id}/games/cs2/stats?limit=100`,
          {
            headers: {
              Authorization: `Bearer ${this.configService.get<string>('faceitApiKey')}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException('Статистика игрока не найдена');
      }
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch FACEIT stats',
        error.response?.status || 500,
      );
    }
  }

  async findPlayerByNickname(nickname: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`,
          {
            headers: {
              Authorization: `Bearer ${this.configService.get<string>('faceitApiKey')}`,
            },
          },
        ),
      );

      if (!response.data || !response.data.player_id) {
        throw new NotFoundException('Игрок с таким ником не найден');
      }

      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException('Игрок с таким ником не найден');
      }
      throw new HttpException(
        error.response?.data?.message || 'Failed to find player by nickname',
        error.response?.status || 500,
      );
    }
  }

  async findPlayerBySteamId(steamId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${steamId}`,
          {
            headers: {
              Authorization: `Bearer ${this.configService.get<string>('faceitApiKey')}`,
            },
          },
        ),
      );

      if (!response.data || !response.data.player_id) {
        throw new NotFoundException('Игрок с таким SteamID не найден');
      }

      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException('Игрок с таким SteamID не найден');
      }
      throw new HttpException(
        error.response?.data?.message || 'Failed to find player by SteamID',
        error.response?.status || 500,
      );
    }
  }
  async getStatsByMap(player_id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://open.faceit.com/data/v4/players/${player_id}/stats/cs2`,
          {
            headers: {
              Authorization: `Bearer ${this.configService.get<string>('faceitApiKey')}`,
            },
          },
        ),
      );
      if (!response.data) {
        throw new NotFoundException('Статистика этого игрока не существует');
      }
      return response.data.segments;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException('Статистика игрока не найдена');
      }
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch FACEIT map stats',
        error.response?.status || 500,
      );
    }
  }
}
