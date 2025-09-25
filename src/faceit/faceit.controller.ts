import {
  Controller,
  Get,
  Query,
  BadRequestException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { FaceitService } from './faceit.service';
import { SteamService } from '../steam/steam.service';

@Controller('faceit')
export class FaceitController {
  constructor(
    private readonly faceitService: FaceitService,
    private readonly steamService: SteamService,
  ) {}

  @Get('player')
  async findPlayer(@Query('q') query: string) {
    try {
      if (!query) {
        throw new BadRequestException('Параметр q обязателен');
      }

      const inputType = this.detectInputType(query);
      let result: any;

      switch (inputType) {
        case 'steamId64':
          result = await this.faceitService.findPlayerBySteamId(query);
          break;
        case 'steamUrl':
          const steamId =
            await this.steamService.extractSteamId64FromUrl(query);
          if (steamId) {
            result = await this.faceitService.findPlayerBySteamId(steamId);
          }
          break;
        case 'nickname':
          result = await this.faceitService.findPlayerByNickname(query);
          break;
        default:
          throw new BadRequestException('Неверный формат входных данных');
      }

      if (!result) {
        throw new NotFoundException('Игрок не найден');
      }

      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Ошибка при поиске игрока');
    }
  }

  @Get('stats/:player_id')
  async getStats(@Param('player_id') player_id: string) {
    try {
      return await this.faceitService.getStats(player_id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Ошибка при получении статистики');
    }
  }
  @Get('games/:player_id')
  async getGames(@Param('player_id') player_id: string) {
    try {
      return await this.faceitService.getGames(player_id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Ошибка при получении статистики');
    }
  }
  @Get('mapstats/:player_id')
  async getStatsByMap(@Param('player_id') player_id: string) {
    try {
      return await this.faceitService.getStatsByMap(player_id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Ошибка при получении статистики');
    }
  }

  private detectInputType(
    identifier: string,
  ): 'steamId64' | 'steamUrl' | 'nickname' | 'faceitPlayerId' {
    const cleanIdentifier = identifier.trim();
    if (this.isFaceitPlayerId(cleanIdentifier)) {
      return 'faceitPlayerId';
    }

    if (/^\d{17}$/.test(cleanIdentifier)) {
      return 'steamId64';
    }

    if (
      cleanIdentifier.includes('steamcommunity.com') ||
      cleanIdentifier.includes('steam://') ||
      cleanIdentifier.startsWith('https://steam.')
    ) {
      return 'steamUrl';
    }
    return 'nickname';
  }

  private isFaceitPlayerId(identifier: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier,
    );
  }
}
