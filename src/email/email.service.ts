import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mailgun from 'mailgun-js';
 
@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService
  ) {
    this.mg = mailgun({
      apiKey: configService.get('MAILGUN_API_KEY'),
      domain: configService.get('MAILGUN_DOMAIN'),
    });
  }
 
  mg;
  
  sendMail(options) {
    this.mg.messages().send(options, (error, body) => {
      if (error) {
        console.error(error);
      }
      console.log(body);
    })
  }
}