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

    // Load saved preferences
    const savedVolume = localStorage.getItem('soundVolume');
    const savedEnabled = localStorage.getItem('soundEnabled');

    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true';
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

      // Victory fanfare
      const melody = [
        { freq: 523.25, time: 0 },    // C
        { freq: 659.25, time: 0.15 },  // E
        { freq: 783.99, time: 0.3 },   // G
        { freq: 1046.5, time: 0.45 }   // C (high)
      ];

      melody.forEach(note => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(note.freq, this.audioContext.currentTime + note.time);

        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime + note.time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + note.time + 0.4);

        oscillator.start(this.audioContext.currentTime + note.time);
        oscillator.stop(this.audioContext.currentTime + note.time + 0.4);
      });
    } catch (error) {
      console.error('Error playing win sound:', error);
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
}

// Export singleton instance
export const soundManager = new SoundManager();
