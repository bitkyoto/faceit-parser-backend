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
  private getKr = (games: any[]) => {
    if (!games || games.length === 0) {
      return 0;
    }
    const totalKr = games.reduce((sum: number, game: any) => {
      const kr = parseFloat(game.stats['K/R Ratio']) || 0;
      return sum + kr;
    }, 0);

    return (totalKr / games.length).toFixed(2);
  };
  getWinrate = (games: any[]) => {
    if (!games || games.length === 0) {
      return 0;
    }
    const totalWinrate = games.reduce((sum: number, game: any) => {
      const win = parseFloat(game.stats['Result']) || 0;
      return sum + win;
    }, 0);

    return ((totalWinrate / games.length) * 100).toFixed(0).toString() + '%';
  };
  getKd = (games: any[]) => {
    if (!games || games.length === 0) {
      return 0;
    }
    const totalKd = games.reduce((sum: number, game: any) => {
      const kd = parseFloat(game.stats['K/D Ratio']) || 0;
      return sum + kd;
    }, 0);

    return (totalKd / games.length).toFixed(2);
  };
  getAdr = (games: any[]) => {
    if (!games || games.length === 0) {
      return 0;
    }

    const totalAdr = games.reduce((sum: number, game: any) => {
      const adr = parseFloat(game.stats?.ADR) || 0;
      return sum + adr;
    }, 0);

    return (totalAdr / games.length).toFixed(1);
  };
  getAvg = (games: any[]) => {
    if (!games || games.length === 0) {
      return 0;
    }

    const totalKills = games.reduce((sum: number, game: any) => {
      const kills = parseFloat(game.stats['Kills']) || 0;
      return sum + kills;
    }, 0);

    return (totalKills / games.length).toFixed(1);
  };
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
      return {
        KR: this.getKr(response.data.items),
        Winrate: this.getWinrate(response.data.items),
        KD: this.getKd(response.data.items),
        ADR: this.getAdr(response.data.items),
        Avg: this.getAvg(response.data.items),
      };
      // winrate, kills, kd, kr, adr
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
  async getGames(player_id: string) {
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
