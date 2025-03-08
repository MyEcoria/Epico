declare module 'music-tempo' {
    interface MusicTempoOptions {
      audioData: number[];
    }
  
    class MusicTempo {
      constructor(audioData: number[]);
      tempo: number;
      beats: number[];
      beatInterval: number;
    }
  
    export = MusicTempo;
  }