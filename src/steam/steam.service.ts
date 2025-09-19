import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SteamService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  /**
   * Извлекает SteamID64 из Steam URL используя Steam Web API
   */
  async extractSteamId64FromUrl(url: string): Promise<string> {
    try {
      const normalizedUrl = this.normalizeSteamUrl(url);
      // Если URL уже содержит SteamID64
      if (normalizedUrl.includes('/profiles/')) {
        return this.extractFromProfileUrl(normalizedUrl);
      }

      // Если это custom URL, используем Steam Web API
      if (normalizedUrl.includes('/id/')) {
        return await this.resolveVanityUrl(normalizedUrl);
      }

      throw new BadRequestException('Неверный формат Steam URL');
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Не удалось извлечь SteamID64 из URL');
    }
  }

  /**
   * Нормализует Steam URL
   */
  private normalizeSteamUrl(url: string): string {
    const trimmedUrl = url.trim();

    // Добавляем https:// если отсутствует
    if (!trimmedUrl.startsWith('http')) {
      if (trimmedUrl.includes('steamcommunity.com')) {
        return `https://${trimmedUrl}`;
      }
      // Предполагаем, что это custom URL name
      return `https://steamcommunity.com/id/${trimmedUrl}`;
    }

    // Заменяем http на https
    return trimmedUrl.replace(/^http:/, 'https:');
  }

  /**
   * Извлекает SteamID64 из URL профиля
   */
  private extractFromProfileUrl(url: string): string {
    const match = url.match(/steamcommunity\.com\/profiles\/(\d{17})/);
    if (!match) {
      throw new BadRequestException('Неверный формат профиля Steam');
    }
    return match[1];
  }

  /**
   * Извлекает custom URL name из Steam URL
   */
  private extractVanityUrlFromCustomUrl(url: string): string {
    const match = url.match(/steamcommunity\.com\/id\/([^\/]+)/);
    if (!match) {
      throw new BadRequestException('Неверный формат custom Steam URL');
    }
    return match[1];
  }

  /**
   * Использует Steam Web API для разрешения vanity URL в SteamID64
   */
  private async resolveVanityUrl(url: string): Promise<string> {
    const vanityUrl = this.extractVanityUrlFromCustomUrl(url);

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/',
          {
            params: {
              key: this.configService.get<string>('steamApiKey'),
              vanityurl: vanityUrl,
            },
          },
        ),
      );

      const data = response.data;

      if (data.response && data.response.success === 1) {
        return data.response.steamid;
      } else if (data.response && data.response.success === 42) {
        throw new BadRequestException('Custom URL не найден');
      } else {
        throw new BadRequestException(
          data.response?.message || 'Не удалось разрешить vanity URL',
        );
      }
    } catch (error) {
      if (error.response?.status === 401) {
        throw new BadRequestException('Неверный Steam API ключ');
      }
      if (error.response?.status === 403) {
        throw new BadRequestException('Доступ к Steam API запрещен');
      }
      if (error.code === 'ECONNABORTED') {
        throw new BadRequestException('Таймаут запроса к Steam API');
      }
      throw error;
    }
  }

  /**
   * Универсальный метод для получения SteamID64 из любого формата
   */
  // async getSteamId64(input: string): Promise<string> {
  //   try {
  //     // Если это уже SteamID64
  //     if (/^\d{17}$/.test(input.trim())) {
  //       return input.trim();
  //     }

  //     // Если это Steam URL
  //     if (input.includes('steamcommunity.com')) {
  //       return await this.extractSteamId64FromUrl(input);
  //     }

  //     // Пробуем как vanity URL name
  //     try {
  //       return await this.resolveVanityUrl(
  //         `https://steamcommunity.com/id/${input}`,
  //       );
  //     } catch {
  //       throw new BadRequestException('Не удалось определить SteamID64');
  //     }
  //   } catch (error) {
  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw new BadRequestException(
  //       'Ошибка при обработке Steam идентификатора',
  //     );
  //   }
  // }
}
