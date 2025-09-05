import { useCallback, useState, useEffect } from 'react';

// 여기에 직접 업로드한 배경 음악 .wav 또는 .mp3 파일의 URL 3개를 붙여넣으세요.
export const backgroundMusicUrls = [
  'http://walktomusic.cafe24.com/game/bgm.mp3', // 예시 URL 1
  'http://walktomusic.cafe24.com/game/bgm2.mp3',                  // 예시 URL 2
  'http://walktomusic.cafe24.com/game/bgm3.mp3',                  // 예시 URL 3
];


// 여기에 직접 업로드한 효과음 .wav 또는 .mp3 파일들의 URL을 붙여넣으세요.
export const soundEffects = {
  click: 'http://walktomusic.cafe24.com/game/click.wav',
  shuffle: 'http://walktomusic.cafe24.com/game/shuffle.wav',
  chip: 'http://walktomusic.cafe24.com/game/chip.wav',
  ado: 'http://walktomusic.cafe24.com/game/ado.wav', // '아도'를 외칠 때
  fold: 'http://walktomusic.cafe24.com/game/fold.wav',
  flip: 'http://walktomusic.cafe24.com/game/flip.wav', // 카드를 뒤집을 때
  win: 'http://walktomusic.cafe24.com/game/win.wav', // 일반 승리
  lose: 'http://walktomusic.cafe24.com/game/lose.wav', // 일반 패배
  // --- 추가된 효과음 ---
  hit: 'http://walktomusic.cafe24.com/game/whip.wav', // 딜러가 카드를 공개(Hit)할 때
  adoWin: 'http://walktomusic.cafe24.com/game/ado_win.wav', // '아도' 성공 시 (더 드라마틱한 사운드)
  adoLose: 'http://walktomusic.cafe24.com/game/ado_lose.wav', // '아도' 실패 시 (더 드라마틱한 사운드)
};


export type SoundEffect = keyof typeof soundEffects;

// Use a singleton pattern for Audio elements to avoid re-creating them.
const sfxAudioCache: Map<SoundEffect, HTMLAudioElement> = new Map();
let backgroundMusic: HTMLAudioElement | null = null;
let elementsAreInitialized = false;

// This function initializes all audio elements once.
const initializeAudioElements = () => {
    if (elementsAreInitialized || typeof window === 'undefined') return;

    // Initialize Sound Effects
    for (const key in soundEffects) {
        const typedKey = key as SoundEffect;
        const url = soundEffects[typedKey];
        if (url && !url.startsWith('YOUR_')) {
            const audio = new Audio(url);
            // Add error handling to see if a file can be loaded at all
            audio.addEventListener('error', () => {
                console.error(`Error loading sound file for: ${typedKey}. Check URL or file format. URL: ${url}`);
            });
            sfxAudioCache.set(typedKey, audio);
        }
    }
    
    // Initialize Background Music
    if (backgroundMusicUrls.length > 0 && !backgroundMusic) {
        backgroundMusic = new Audio();
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3;
        backgroundMusic.addEventListener('error', (e) => {
            console.error(`Error loading background music. Check URL or file format.`, e);
        });
    }
    
    elementsAreInitialized = true;
};

export const useSounds = (isSfxMuted: boolean, isMusicMuted: boolean) => {
  // Initialize elements once on component mount. This helps with pre-loading.
  useEffect(() => {
    initializeAudioElements();
  }, []);

  const playSound = useCallback((sound: SoundEffect) => {
    if (isSfxMuted) return;
    
    const audio = sfxAudioCache.get(sound);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error(`Error playing sound '${sound}':`, error);
      });
    } else {
        console.warn(`Sound not loaded or URL not provided: ${sound}`);
    }
  }, [isSfxMuted]);
  
  const playBackgroundMusic = useCallback(() => {
    if (isMusicMuted || !backgroundMusic || backgroundMusicUrls.length === 0) return;

    const validUrls = backgroundMusicUrls.filter(url => !url.startsWith('YOUR_'));
    if (validUrls.length === 0) return;

    const randomIndex = Math.floor(Math.random() * validUrls.length);
    const trackUrl = validUrls[randomIndex];
    
    backgroundMusic.src = trackUrl;
    backgroundMusic.play().catch(error => {
        console.error("Background music could not be played. User interaction might be required.", error);
    });
  }, [isMusicMuted]);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
  }, []);

  // Effect to handle muting/unmuting music
  useEffect(() => {
    if (backgroundMusic) {
        backgroundMusic.muted = isMusicMuted;
    }
  }, [isMusicMuted]);

  return { playSound, playBackgroundMusic, stopBackgroundMusic };
};