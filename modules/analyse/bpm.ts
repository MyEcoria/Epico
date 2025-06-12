import MusicTempo from 'music-tempo';
import { logger } from '../logger';
var AudioContext = require("web-audio-api").AudioContext;

export async function analyseBpm2(buffer: any): Promise<number> {
  var audioData: number[] = [];
  // Take the average of the two channels
  if (buffer.numberOfChannels == 2) {
    var channel1Data = buffer.getChannelData(0);
    var channel2Data = buffer.getChannelData(1);
    var length = channel1Data.length;
    for (var i = 0; i < length; i++) {
      audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
    }
  } else {
    audioData = Array.from(buffer.getChannelData(0));
  }
  var mt = new MusicTempo(audioData);

  return mt.tempo;
}

export async function analyseBpm(buffer: any): Promise<number> {
    var context = new AudioContext();
    return new Promise((resolve, reject) => {
        context.decodeAudioData(buffer, async (decodedData: any) => {
            try {
                let bpm = await analyseBpm2(decodedData);
                resolve(bpm);
            } catch (error) {
                logger.log({ level: 'error', message: `BPM analysis failed: ${(error as any).message}` });
                resolve(0);
            }
        }, reject);
    });
}
