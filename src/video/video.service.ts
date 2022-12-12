import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { v4 } from 'uuid';

@Injectable()
export class VideoService {
  constructor(
    private readonly configService: ConfigService,
  ) {
    this.client = twilio(
      configService.get('TWILIO_API_KEY_SID'),
      configService.get('TWILIO_API_KEY_SECRET'),
      { accountSid: configService.get('TWILIO_ACCOUNT_SID') }
    );
  }

  client: twilio.Twilio;

  async findOrCreateRoom(roomName) {
    try {
      // see if the room exists already. If it doesn't, this will throw
      // error 20404.
      await this.client.video.rooms(roomName).fetch();
    } catch (error) {
      // the room was not found, so create it
      if (error.code == 20404) {
        await this.client.video.rooms.create({
          uniqueName: roomName,
          type: "go",
        });
      } else {
        // let other errors bubble up
        throw error;
      }
    }
  };

  getAccessToken(roomName) {
    // create an access token
    const token = new twilio.jwt.AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      // generate a random unique identity for this participant
      { identity: v4() }
    );
    // create a video grant for this specific room
    const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
      room: roomName,
    });
  
    // add the video grant
    token.addGrant(videoGrant);
    // serialize the token and return it
    return token.toJwt();
  };
}
