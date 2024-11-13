import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ConfigurationType } from 'src/commons/configs/configuration';
import { SERVICE_NAME } from 'src/commons/constants/constant';

@Injectable()
export class TelegramBotService {
  private readonly _botToken = this.configService.get<ConfigurationType['botToken']>('botToken') || '';
  private readonly _devopsChatGroupId =
    this.configService.get<ConfigurationType['devopsChatGroupId']>('devopsChatGroupId') || '';
  private readonly _telegramBotUrl = 'https://api.telegram.org/bot';

  constructor(private readonly configService: ConfigService<ConfigurationType>) {}

  /**
   * Sends a message to the devops chat group via Telegram bot.
   * @param {Object} options - The options for sending the message.
   * @param {string} options.message - The message to be sent.
   * @returns {Promise<Object>} - A promise that resolves to the response from the Telegram API.
   */
  async sendMessageToDevops({ message }: { message: string }): Promise<undefined> {
    // Send a POST request to the Telegram API to send a message.
    axios
      .post(`${this._telegramBotUrl}${this._botToken}/sendMessage`, {
        chat_id: this._devopsChatGroupId, // The ID of the devops chat group.
        text: `${process.env.NODE_ENV} | ${SERVICE_NAME} | \n ${message.replaceAll('\\n', '\n')}`, // The message to be sent.
      })
      .catch((error: any) => {
        // Log the error if there is any.
        console.log(`🚀 ~ TelegramService ~ sendMessageToDevops ~ error:`, error.message || error);
      });
    return;
  }
}
