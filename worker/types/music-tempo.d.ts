/*
** EPITECH PROJECT, 2025
** music-tempo.d.ts
** File description:
** Type definitions for the music-tempo module
*/
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