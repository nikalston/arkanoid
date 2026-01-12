export class Sound {
  private ctx: AudioContext | null = null;
  private musicPlaying: boolean = false;
  private musicTimeout: number | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private delay: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private loopCount: number = 0;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      // Music chain with effects
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.7;

      // Warm low-pass filter
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 2500;
      this.filter.Q.value = 0.5;

      // Echo/delay effect
      this.delay = this.ctx.createDelay(1);
      this.delay.delayTime.value = 0.3;
      this.delayGain = this.ctx.createGain();
      this.delayGain.gain.value = 0.3;

      // Connect: musicGain -> filter -> master
      //                   -> delay -> delayGain -> filter (feedback)
      this.musicGain.connect(this.filter);
      this.filter.connect(this.masterGain);

      this.musicGain.connect(this.delay);
      this.delay.connect(this.delayGain);
      this.delayGain.connect(this.filter);
      this.delayGain.connect(this.delay); // Feedback loop
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

  // Smooth synth note with envelope
  private playMusicNote(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    attack: number = 0.05,
    release: number = 0.15
  ): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Smooth ADSR-like envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + attack);
    gain.gain.setValueAtTime(volume * 0.7, startTime + attack + 0.05);
    gain.gain.linearRampToValueAtTime(volume * 0.6, startTime + duration - release);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(this.musicGain!);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  // Deep sub bass with sine wave
  private playBass(freq: number, startTime: number, duration: number, volume: number): void {
    const ctx = this.getContext();

    // Sub bass (sine)
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(freq, startTime);
    subGain.gain.setValueAtTime(0, startTime);
    subGain.gain.linearRampToValueAtTime(volume, startTime + 0.08);
    subGain.gain.linearRampToValueAtTime(volume * 0.8, startTime + duration * 0.5);
    subGain.gain.linearRampToValueAtTime(0, startTime + duration);
    sub.connect(subGain);
    subGain.connect(this.musicGain!);
    sub.start(startTime);
    sub.stop(startTime + duration + 0.1);

    // Harmonic layer (triangle, octave up)
    const harm = ctx.createOscillator();
    const harmGain = ctx.createGain();
    harm.type = 'triangle';
    harm.frequency.setValueAtTime(freq * 2, startTime);
    harmGain.gain.setValueAtTime(0, startTime);
    harmGain.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.05);
    harmGain.gain.linearRampToValueAtTime(0, startTime + duration * 0.6);
    harm.connect(harmGain);
    harmGain.connect(this.musicGain!);
    harm.start(startTime);
    harm.stop(startTime + duration + 0.1);
  }

  // Pad/atmosphere sound
  private playPad(freqs: number[], startTime: number, duration: number, volume: number): void {
    const ctx = this.getContext();

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      // Slight detune for thickness
      osc.detune.setValueAtTime((i - 1) * 8, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + duration * 0.3);
      gain.gain.linearRampToValueAtTime(volume * 0.8, startTime + duration * 0.7);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(gain);
      gain.connect(this.musicGain!);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.2);
    });
  }

  private playMusicLoop(): void {
    if (!this.musicPlaying) return;

    const ctx = this.getContext();
    const now = ctx.currentTime;
    const bpm = 138;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const eighth = beat / 2;

    const variation = this.loopCount % 4;
    this.loopCount++;

    // Driving bass - hits on every beat
    const bassPattern = [
      82, 82, 82, 82,  // E2
      110, 110, 110, 110,  // A2
      98, 98, 98, 98,  // G2
      110, 110, 82, 98,  // A2, E2, G2
    ];

    bassPattern.forEach((freq, i) => {
      this.playBass(freq, now + i * beat, beat * 0.8, 0.15);
    });

    // Punchy kick-style sub hits
    [0, 2, 4, 6, 8, 10, 12, 14].forEach(i => {
      this.playMusicNote(41, now + i * beat, beat * 0.3, 'sine', 0.2, 0.01, 0.1);
    });

    // Synth stabs - offbeat energy
    const stabPattern = [
      { time: eighth, freq: 330 },
      { time: beat + eighth, freq: 330 },
      { time: beat * 2 + eighth, freq: 392 },
      { time: beat * 3 + eighth, freq: 392 },
      { time: bar + eighth, freq: 440 },
      { time: bar + beat + eighth, freq: 440 },
      { time: bar + beat * 2 + eighth, freq: 392 },
      { time: bar + beat * 3 + eighth, freq: 330 },
    ];

    stabPattern.forEach(stab => {
      this.playMusicNote(stab.freq, now + stab.time, eighth * 0.7, 'sawtooth', 0.07, 0.01, 0.08);
      this.playMusicNote(stab.freq, now + stab.time + bar * 2, eighth * 0.7, 'sawtooth', 0.07, 0.01, 0.08);
    });

    // Fast arpeggios
    const arpNotes = variation % 2 === 0
      ? [330, 440, 523, 659, 523, 440, 330, 440]
      : [392, 494, 587, 784, 587, 494, 392, 494];

    arpNotes.forEach((freq, i) => {
      this.playMusicNote(freq, now + bar + i * eighth, eighth * 0.9, 'triangle', 0.06, 0.02, 0.1);
      this.playMusicNote(freq, now + bar * 3 + i * eighth, eighth * 0.9, 'triangle', 0.06, 0.02, 0.1);
    });

    // Lead melody - varies each loop
    const leadPhrases = [
      [
        { freq: 659, time: 0, dur: beat },
        { freq: 587, time: beat, dur: eighth },
        { freq: 523, time: beat * 1.5, dur: eighth },
        { freq: 587, time: beat * 2, dur: beat * 2 },
      ],
      [
        { freq: 523, time: 0, dur: eighth },
        { freq: 587, time: eighth, dur: eighth },
        { freq: 659, time: beat, dur: beat },
        { freq: 523, time: beat * 2.5, dur: beat * 1.5 },
      ],
      [
        { freq: 784, time: 0, dur: beat * 0.75 },
        { freq: 659, time: beat, dur: beat * 0.75 },
        { freq: 587, time: beat * 2, dur: beat },
        { freq: 523, time: beat * 3, dur: beat },
      ],
      [
        { freq: 587, time: eighth, dur: beat },
        { freq: 659, time: beat * 1.5, dur: beat },
        { freq: 784, time: beat * 3, dur: beat },
      ],
    ];

    const lead = leadPhrases[variation];
    lead.forEach(note => {
      this.playMusicNote(note.freq, now + bar * 2 + note.time, note.dur, 'square', 0.08, 0.02, 0.15);
    });

    // Second lead phrase
    const lead2 = leadPhrases[(variation + 1) % 4];
    lead2.forEach(note => {
      this.playMusicNote(note.freq, now + bar * 3 + note.time, note.dur, 'square', 0.08, 0.02, 0.15);
    });

    // Hi-hat style clicks for rhythm
    for (let i = 0; i < 16; i++) {
      if (i % 2 === 1 || variation === 2) {
        this.playMusicNote(8000, now + i * beat, 0.05, 'square', 0.02, 0.005, 0.02);
      }
    }

    // Loop duration (4 bars = 16 beats)
    const loopDuration = bar * 4 * 1000;

    this.musicTimeout = window.setTimeout(() => {
      this.playMusicLoop();
    }, loopDuration - 50);
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
    this.loopCount = 0;
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
