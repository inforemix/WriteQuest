/**
 * Sound Effects Manager
 * Handles all game audio using Web Audio API
 */

class SoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.5;
    this.audioContext = null;
    this.sounds = {};

    // Background music properties
    this.musicEnabled = true;
    this.musicVolume = 0.205;
    this.backgroundMusic = null;
    this.musicGainNode = null;

    // Load saved preferences
    const savedVolume = localStorage.getItem('soundVolume');
    const savedEnabled = localStorage.getItem('soundEnabled');
    const savedMusicEnabled = localStorage.getItem('musicEnabled');
    const savedMusicVolume = localStorage.getItem('musicVolume');

    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true';
    }
    if (savedMusicEnabled !== null) {
      this.musicEnabled = savedMusicEnabled === 'true';
    }
    if (savedMusicVolume !== null) {
      this.musicVolume = parseFloat(savedMusicVolume);
    }
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  init() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      // Resume context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      this.enabled = false;
    }
  }

  /**
   * Create simple tones using oscillators (no external files needed)
   */
  playRotate() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.error('Error playing rotate sound:', error);
    }
  }

  playDrop() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.15);

      gainNode.gain.setValueAtTime(this.volume * 0.25, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.15);
    } catch (error) {
      console.error('Error playing drop sound:', error);
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioContext) return;

      // Play ascending chord
      const frequencies = [523.25, 659.25, 783.99]; // C, E, G

      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.1);

        gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime + index * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.1 + 0.5);

        oscillator.start(this.audioContext.currentTime + index * 0.1);
        oscillator.stop(this.audioContext.currentTime + index * 0.1 + 0.5);
      });
    } catch (error) {
      console.error('Error playing success sound:', error);
    }
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.05);
    } catch (error) {
      console.error('Error playing click sound:', error);
    }
  }

  playWin() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioContext) return;

      // Exciting victory fanfare with more energy
      const melody = [
        { freq: 523.25, time: 0, duration: 0.15 },      // C
        { freq: 659.25, time: 0.1, duration: 0.15 },    // E
        { freq: 783.99, time: 0.2, duration: 0.2 },     // G
        { freq: 1046.5, time: 0.35, duration: 0.3 },    // C (high)
        { freq: 1318.5, time: 0.6, duration: 0.4 }      // E (very high)
      ];

      melody.forEach(note => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Use triangle wave for a brighter, more cheerful sound
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(note.freq, this.audioContext.currentTime + note.time);

        gainNode.gain.setValueAtTime(this.volume * 0.35, this.audioContext.currentTime + note.time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + note.time + note.duration);

        oscillator.start(this.audioContext.currentTime + note.time);
        oscillator.stop(this.audioContext.currentTime + note.time + note.duration);
      });

      // Add "yeah!" voice-like sound using multiple oscillators
      setTimeout(() => {
        this.playYeahSound();
      }, 200);

    } catch (error) {
      console.error('Error playing win sound:', error);
    }
  }

  playYeahSound() {
    if (!this.enabled) return;
    try {
      if (!this.audioContext) return;

      // Create a "yeah!" sound by combining multiple frequencies
      // Simulating vowel formants for a voice-like "yeah" sound
      const formants = [
        { freq: 700, gain: 0.3 },   // First formant
        { freq: 1220, gain: 0.2 },  // Second formant
        { freq: 2600, gain: 0.15 }  // Third formant
      ];

      formants.forEach(formant => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Use sawtooth for more harmonics
        oscillator.type = 'sawtooth';

        // Sweep frequency to create "yeah" sound
        oscillator.frequency.setValueAtTime(formant.freq * 0.7, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(formant.freq, this.audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(formant.freq * 0.9, this.audioContext.currentTime + 0.3);

        // Bandpass filter to shape the sound
        filter.type = 'bandpass';
        filter.frequency.value = formant.freq;
        filter.Q.value = 5;

        // Envelope for natural "yeah" articulation
        gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(this.volume * formant.gain, this.audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(this.volume * formant.gain, this.audioContext.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
      });

      // Add noise burst for consonant "y" sound
      const bufferSize = this.audioContext.sampleRate * 0.05;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1;
      }

      const noise = this.audioContext.createBufferSource();
      const noiseGain = this.audioContext.createGain();
      const noiseFilter = this.audioContext.createBiquadFilter();

      noise.buffer = buffer;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.audioContext.destination);

      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 2000;

      noiseGain.gain.setValueAtTime(this.volume * 0.15, this.audioContext.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

      noise.start(this.audioContext.currentTime);

    } catch (error) {
      console.error('Error playing yeah sound:', error);
    }
  }

  playHover() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.05);
    } catch (error) {
      console.error('Error playing hover sound:', error);
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    localStorage.setItem('soundVolume', this.volume.toString());
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    localStorage.setItem('soundEnabled', enabled.toString());
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled.toString());
    return this.enabled;
  }

  /**
   * Start background music
   */
  async startBackgroundMusic() {
    if (!this.musicEnabled) return;

    try {
      this.init();
      if (!this.audioContext) return;

      // Create audio element if not exists
      if (!this.backgroundMusic) {
        // Use dynamic import to get base URL for production builds
        const musicPath = import.meta.env.BASE_URL + 'WAqua-music.mp3';
        this.backgroundMusic = new Audio(musicPath);
        this.backgroundMusic.loop = true;

        // Create gain node for volume control
        const source = this.audioContext.createMediaElementSource(this.backgroundMusic);
        this.musicGainNode = this.audioContext.createGain();
        source.connect(this.musicGainNode);
        this.musicGainNode.connect(this.audioContext.destination);

        // Set initial volume
        this.musicGainNode.gain.value = this.musicVolume;
      }

      // Play music
      await this.backgroundMusic.play();
    } catch (error) {
      console.error('Error starting background music:', error);
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  /**
   * Pause background music
   */
  pauseBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  /**
   * Resume background music
   */
  resumeBackgroundMusic() {
    if (this.backgroundMusic && this.musicEnabled) {
      this.backgroundMusic.play().catch(error => {
        console.error('Error resuming background music:', error);
      });
    }
  }

  /**
   * Set music volume
   */
  setMusicVolume(value) {
    this.musicVolume = Math.max(0, Math.min(1, value));
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.musicVolume;
    }
    localStorage.setItem('musicVolume', this.musicVolume.toString());
  }

  /**
   * Set music enabled state
   */
  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    localStorage.setItem('musicEnabled', enabled.toString());

    if (enabled) {
      this.startBackgroundMusic();
    } else {
      this.pauseBackgroundMusic();
    }
  }

  /**
   * Toggle music on/off
   */
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    localStorage.setItem('musicEnabled', this.musicEnabled.toString());

    if (this.musicEnabled) {
      this.startBackgroundMusic();
    } else {
      this.pauseBackgroundMusic();
    }

    return this.musicEnabled;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
