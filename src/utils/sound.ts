export class Sound {
  private ctx: AudioContext | null = null;
  private musicPlaying: boolean = false;
  private musicTimeout: number | null = null;
  private masterGain: GainNode | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'square', volume: number = 0.3): void {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  // 80's arcade background music
  private playNote(freq: number, startTime: number, duration: number, type: OscillatorType, volume: number): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.setValueAtTime(volume, startTime + duration - 0.02);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playMusicLoop(): void {
    if (!this.musicPlaying) return;

    const ctx = this.getContext();
    const now = ctx.currentTime;
    const bpm = 140;
    const beatDuration = 60 / bpm;
    const sixteenth = beatDuration / 4;

    // 80's arcade melody - pentatonic scale patterns
    const melody = [
      330, 392, 440, 523, 440, 392, 330, 294,
      330, 392, 440, 523, 587, 523, 440, 392,
      294, 330, 392, 440, 392, 330, 294, 262,
      294, 330, 392, 330, 294, 262, 294, 330,
    ];

    // Bass line
    const bass = [
      110, 110, 147, 147, 165, 165, 131, 131,
      110, 110, 147, 147, 165, 165, 131, 131,
    ];

    // Arpeggio pattern
    const arp = [
      [220, 277, 330], [220, 277, 330], [294, 370, 440], [294, 370, 440],
      [330, 415, 494], [330, 415, 494], [262, 330, 392], [262, 330, 392],
    ];

    // Play melody
    melody.forEach((freq, i) => {
      if (freq > 0) {
        this.playNote(freq, now + i * sixteenth * 2, sixteenth * 1.8, 'square', 0.08);
      }
    });

    // Play bass
    bass.forEach((freq, i) => {
      this.playNote(freq, now + i * beatDuration, beatDuration * 0.9, 'sawtooth', 0.1);
    });

    // Play arpeggios
    arp.forEach((chord, i) => {
      chord.forEach((freq, j) => {
        this.playNote(freq, now + i * beatDuration * 2 + j * sixteenth, sixteenth * 0.8, 'triangle', 0.05);
      });
    });

    // Loop duration (16 beats)
    const loopDuration = beatDuration * 16 * 1000;

    this.musicTimeout = window.setTimeout(() => {
      this.playMusicLoop();
    }, loopDuration - 100);
  }

  startMusic(): void {
    // Always stop first to prevent multiple loops
    this.stopMusic();
    this.getContext();
    this.musicPlaying = true;
    this.masterGain!.gain.setValueAtTime(1, this.ctx!.currentTime);
    this.playMusicLoop();
  }

  stopMusic(): void {
    this.musicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
    // Mute immediately to stop any scheduled notes
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  pauseMusic(): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  resumeMusic(): void {
    if (!this.musicPlaying) return;
    // Clear any existing timeout to prevent duplicates
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
    }
    this.playMusicLoop();
  }

  paddle(): void {
    this.playTone(220, 0.1, 'sine', 0.2);
  }

  brick(): void {
    this.playTone(440, 0.08, 'square', 0.15);
  }

  wall(): void {
    this.playTone(150, 0.05, 'sine', 0.1);
  }

  gameOver(): void {
    this.getContext();
    [200, 150, 100].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sawtooth', 0.2), i * 150);
    });
  }

  win(): void {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.2), i * 100);
    });
  }
}
