import Twilio from 'twilio-video';
const Video = require('twilio-video');

export const joinVideoRoom = async (roomName: string, token: string): Promise<Twilio.Room> => {
  // join the video room with the Access Token and the given room name
  const room = await Video.connect(token, {
    room: roomName,
  });
  return room;
};