/**
 * Cantonese Audio Utility
 *
 * This utility provides Cantonese pronunciation for Chinese characters.
 *
 * For v0.5, we're preparing for integration with https://www.cantonesetools.org/en/cantonese-text-to-sound
 *
 * Future implementation will:
 * 1. Use local audio files in /public/audio/ (MP3 format)
 * 2. Fall back to API calls to cantonesetools.org if local files unavailable
 * 3. Cache audio data for offline use
 */

import { getAssetPath } from './assets';

/**
 * Cantonese pronunciation mapping for characters
 * Based on Jyutping romanization system
 */
export const cantonesePronunciation = {
  // Basic Mode Characters
  '木': { jyutping: 'muk6', english: 'Wood', filename: 'muk6.mp3' },
  '水': { jyutping: 'seoi2', english: 'Water', filename: 'seoi2.mp3' },
  '火': { jyutping: 'fo2', english: 'Fire', filename: 'fo2.mp3' },
  '山': { jyutping: 'saan1', english: 'Mountain', filename: 'saan1.mp3' },
  '雨': { jyutping: 'jyu5', english: 'Rain', filename: 'jyu5.mp3' },
  '日': { jyutping: 'jat6', english: 'Sun', filename: 'jat6.mp3' },
  '土': { jyutping: 'tou2', english: 'Ground', filename: 'tou2.mp3' },
  '月': { jyutping: 'jyut6', english: 'Moon', filename: 'jyut6.mp3' },
  '人': { jyutping: 'jan4', english: 'Human', filename: 'jan4.mp3' },
  '天': { jyutping: 'tin1', english: 'Sky', filename: 'tin1.mp3' },
  '大': { jyutping: 'daai6', english: 'Big', filename: 'daai6.mp3' },
  '女': { jyutping: 'neoi5', english: 'Woman', filename: 'neoi5.mp3' },
  '田': { jyutping: 'tin4', english: 'Field', filename: 'tin4.mp3' },
  '心': { jyutping: 'sam1', english: 'Heart', filename: 'sam1.mp3' },
  '男': { jyutping: 'naam4', english: 'Man', filename: 'naam4.mp3' },
  '石': { jyutping: 'sek6', english: 'Rock', filename: 'sek6.mp3' },
  '光': { jyutping: 'gwong1', english: 'Light', filename: 'gwong1.mp3' },
  '兄': { jyutping: 'hing1', english: 'Elder Brother', filename: 'hing1.mp3' },
  '父': { jyutping: 'fu6', english: 'Father', filename: 'fu6.mp3' },
  '妹': { jyutping: 'mui6', english: 'Younger Sister', filename: 'mui6.mp3' },

  // Advanced Mode Characters
  '海': { jyutping: 'hoi2', english: 'Ocean', filename: 'hoi2.mp3' },
  '春': { jyutping: 'ceon1', english: 'Spring', filename: 'ceon1.mp3' },
  '夏': { jyutping: 'haa6', english: 'Summer', filename: 'haa6.mp3' },
  '秋': { jyutping: 'cau1', english: 'Autumn', filename: 'cau1.mp3' },
  '冬': { jyutping: 'dung1', english: 'Winter', filename: 'dung1.mp3' },
  '學': { jyutping: 'hok6', english: 'Study', filename: 'hok6.mp3' },
  '善': { jyutping: 'sin6', english: 'Kindness', filename: 'sin6.mp3' },
  '美': { jyutping: 'mei5', english: 'Beauty', filename: 'mei5.mp3' },
  '愛': { jyutping: 'oi3', english: 'Love', filename: 'oi3.mp3' },
  '危': { jyutping: 'ngai4', english: 'Danger', filename: 'ngai4.mp3' },
  '風': { jyutping: 'fung1', english: 'Wind', filename: 'fung1.mp3' },
  '星': { jyutping: 'sing1', english: 'Star', filename: 'sing1.mp3' },
  '快': { jyutping: 'faai3', english: 'Fast', filename: 'faai3.mp3' },
  '毒': { jyutping: 'duk6', english: 'Poison', filename: 'duk6.mp3' },
  '島': { jyutping: 'dou2', english: 'Island', filename: 'dou2.mp3' },
  '電': { jyutping: 'din6', english: 'Electricity', filename: 'din6.mp3' },
  '燒': { jyutping: 'siu1', english: 'Burn', filename: 'siu1.mp3' },
  '寫': { jyutping: 'se2', english: 'Write', filename: 'se2.mp3' },
  '飛': { jyutping: 'fei1', english: 'Fly', filename: 'fei1.mp3' },
  '慢': { jyutping: 'maan6', english: 'Slow', filename: 'maan6.mp3' }
};

/**
 * Get pronunciation data for a Chinese character
 * @param {string} character - Chinese character
 * @returns {object|null} Pronunciation data or null if not found
 */
export function getPronunciation(character) {
  return cantonesePronunciation[character] || null;
}

/**
 * Play Cantonese pronunciation audio for a character
 * @param {string} character - Chinese character
 * @param {function} onError - Error callback
 * @returns {HTMLAudioElement|null} Audio element or null if character not found
 */
export function playCantonesePronunciation(character, onError) {
  const pronunciation = getPronunciation(character);

  if (!pronunciation) {
    console.warn(`No pronunciation data for character: ${character}`);
    return null;
  }

  // Try to load from local audio files first
  const audioPath = getAssetPath(`audio/${pronunciation.filename}`);
  const audio = new Audio(audioPath);

  audio.onerror = () => {
    console.warn(`Audio file not found: ${audioPath}`);
    if (onError) {
      onError(`Audio file not available for ${character} (${pronunciation.jyutping})`);
    }

    // TODO: Future implementation - fetch from cantonesetools.org API
    // For now, we'll just log the Jyutping romanization
    console.log(`Pronunciation: ${character} = ${pronunciation.jyutping}`);
  };

  audio.play().catch(err => {
    console.error('Error playing audio:', err);
    if (onError) {
      onError(`Cannot play audio for ${character}`);
    }
  });

  return audio;
}

/**
 * Preload audio files for better performance
 * @param {array} characters - Array of Chinese characters
 */
export function preloadAudio(characters) {
  characters.forEach(char => {
    const pronunciation = getPronunciation(char);
    if (pronunciation) {
      const audio = new Audio(getAssetPath(`audio/${pronunciation.filename}`));
      audio.preload = 'auto';
      audio.load();
    }
  });
}

/**
 * Get Cantonesetools.org URL for a character
 * @param {string} character - Chinese character
 * @returns {string} URL to cantonesetools.org pronunciation page
 */
export function getCantonesetoolsUrl(character) {
  return `https://www.cantonesetools.org/en/cantonese-text-to-sound?searchtext=${encodeURIComponent(character)}`;
}

export default {
  cantonesePronunciation,
  getPronunciation,
  playCantonesePronunciation,
  preloadAudio,
  getCantonesetoolsUrl
};
