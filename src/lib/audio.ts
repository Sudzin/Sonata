export class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElements: [HTMLAudioElement, HTMLAudioElement];
  private sources: [MediaElementAudioSourceNode | null, MediaElementAudioSourceNode | null] = [null, null];
  private gainNodes: [GainNode | null, GainNode | null] = [null, null];
  
  public analyser: AnalyserNode | null = null;
  private eqBands: BiquadFilterNode[] = [];
  private masterGain: GainNode | null = null;
  
  private currentIdx = 0;
  private crossfadeTime = 3; // seconds
  
  public onTimeUpdate?: (time: number, duration: number) => void;
  public onEnded?: () => void;
  
  // Custom EQ preset values
  public readonly eqFrequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  constructor() {
    this.audioElements = [new Audio(), new Audio()];
    
    this.audioElements.forEach((audio, idx) => {
      audio.crossOrigin = "anonymous";
      audio.addEventListener("timeupdate", () => {
        if (this.currentIdx === idx && this.onTimeUpdate) {
          this.onTimeUpdate(audio.currentTime, audio.duration || 0);
        }
      });
      audio.addEventListener("ended", () => {
        if (this.currentIdx === idx && this.onEnded) {
          this.onEnded();
        }
      });
    });
  }

  public async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    this.masterGain = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    
    // Create 10-band EQ
    let prevNode: AudioNode = this.masterGain;
    this.eqFrequencies.forEach((freq) => {
      if (!this.ctx) return;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = freq;
      filter.Q.value = 1;
      filter.gain.value = 0; // Default flat
      this.eqBands.push(filter);
      
      prevNode.connect(filter);
      prevNode = filter;
    });
    
    prevNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    
    // Setup sources and gain nodes for crossfading
    this.audioElements.forEach((audio, idx) => {
      if (!this.ctx) return;
      const source = this.ctx.createMediaElementSource(audio);
      const gain = this.ctx.createGain();
      gain.gain.value = idx === this.currentIdx ? 1 : 0;
      
      source.connect(gain);
      gain.connect(this.masterGain!);
      
      this.sources[idx] = source;
      this.gainNodes[idx] = gain;
    });
  }
  
  public setVolume(val: number) {
    if (this.masterGain) {
      // Logarithmic volume for more natural feel
      this.masterGain.gain.setTargetAtTime(Math.pow(val, 2), this.ctx?.currentTime || 0, 0.05);
    }
  }

  public setEqBand(index: number, gainValue: number) {
    if (this.eqBands[index]) {
      this.eqBands[index].gain.value = gainValue;
    }
  }
  
  public async playTrack(url: string, crossfade = true) {
    await this.init();
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
    }
    
    const nextIdx = 1 - this.currentIdx;
    const currentAudio = this.audioElements[this.currentIdx];
    const nextAudio = this.audioElements[nextIdx];
    const currentGain = this.gainNodes[this.currentIdx]!;
    const nextGain = this.gainNodes[nextIdx]!;
    
    nextAudio.src = url;
    await nextAudio.play();
    
    if (crossfade && !currentAudio.paused && this.ctx) {
      const now = this.ctx.currentTime;
      // Fade out current
      currentGain.gain.cancelScheduledValues(now);
      currentGain.gain.setValueAtTime(currentGain.gain.value, now);
      currentGain.gain.linearRampToValueAtTime(0, now + this.crossfadeTime);
      
      // Fade in next
      nextGain.gain.cancelScheduledValues(now);
      nextGain.gain.setValueAtTime(0, now);
      nextGain.gain.linearRampToValueAtTime(1, now + this.crossfadeTime);
      
      // Stop old audio after fade
      setTimeout(() => {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }, this.crossfadeTime * 1000);
    } else {
      currentAudio.pause();
      currentGain.gain.value = 0;
      nextGain.gain.value = 1;
    }
    
    this.currentIdx = nextIdx;
  }
  
  public togglePlay() {
    const audio = this.audioElements[this.currentIdx];
    if (audio.paused) {
      this.ctx?.resume();
      audio.play();
    } else {
      audio.pause();
    }
  }

  public seek(time: number) {
    this.audioElements[this.currentIdx].currentTime = time;
  }

  public isPlaying(): boolean {
    return !this.audioElements[this.currentIdx].paused;
  }
  
  public destroy() {
    this.audioElements.forEach(a => {
      a.pause();
      a.removeAttribute('src');
    });
    this.ctx?.close();
  }
}

// Export singleton instance
export const engine = new AudioEngine();
