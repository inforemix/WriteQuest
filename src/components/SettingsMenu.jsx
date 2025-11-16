import { useState, useEffect } from 'react';
import '../styles/SettingsMenu.css';
import { soundManager } from '../utils/sounds';
import { useLanguage } from '../contexts/LanguageContext';

function SettingsMenu({ isOpen, onClose, isAdmin, setIsAdmin }) {
  const { language, changeLanguage, t } = useLanguage();
  const [volume, setVolume] = useState(soundManager.volume * 100);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.enabled);
  const [musicVolume, setMusicVolume] = useState(soundManager.musicVolume * 100);
  const [musicEnabled, setMusicEnabled] = useState(soundManager.musicEnabled);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync state when menu opens
  useEffect(() => {
    if (isOpen) {
      setVolume(soundManager.volume * 100);
      setSoundEnabled(soundManager.enabled);
      setMusicVolume(soundManager.musicVolume * 100);
      setMusicEnabled(soundManager.musicEnabled);
    }
  }, [isOpen]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundManager.setVolume(newVolume / 100);

    // Play a test sound
    if (soundEnabled) {
      soundManager.playClick();
    }
  };

  const handleSoundToggle = () => {
    const newState = soundManager.toggle();
    setSoundEnabled(newState);
  };

  const handleMusicVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolume(newVolume);
    soundManager.setMusicVolume(newVolume / 100);
  };

  const handleMusicToggle = () => {
    const newState = soundManager.toggleMusic();
    setMusicEnabled(newState);
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
  };

  const handleResetProgress = () => {
    setShowResetConfirm(true);
  };

  const confirmResetProgress = () => {
    // Remove ALL game data including stages, completed status, and personal bests
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('completed-') || key.startsWith('pb-') || key === 'stages') {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    setShowResetConfirm(false);

    // Play click sound
    soundManager.playClick();

    // Close settings and reload to show reset progress
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 300);
  };

  const cancelResetProgress = () => {
    setShowResetConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-menu" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">{t('settingsTitle')}</h2>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          {/* Mode Section */}
          <div className="settings-section">
            <h3 className="section-title">Admin Mode</h3>
            <div className="setting-item">
              <label className="setting-label">
                <span>Able to add, delete, and reorder stages</span>
                <button
                  className={`toggle-switch ${isAdmin ? 'active' : ''}`}
                  onClick={() => setIsAdmin(!isAdmin)}
                  aria-label="Toggle admin mode"
                >
                  <span className="toggle-slider"></span>
                </button>
              </label>
            </div>
          </div>

          {/* Sound Section */}
          <div className="settings-section">
            <div className="setting-item">
              <label className="setting-label">
                <span>Enable sound effects</span>
                <button
                  className={`toggle-switch ${soundEnabled ? 'active' : ''}`}
                  onClick={handleSoundToggle}
                  aria-label="Toggle sound"
                >
                  <span className="toggle-slider"></span>
                </button>
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <span>Volume</span>
                <span className="volume-value">{Math.round(volume)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                disabled={!soundEnabled}
                className="volume-slider"
                style={{ '--value': `${volume}%` }}
              />
            </div>
          </div>

          {/* Music Section */}
          <div className="settings-section">
            <div className="setting-item">
              <label className="setting-label">
                <span>Enable background music</span>
                <button
                  className={`toggle-switch ${musicEnabled ? 'active' : ''}`}
                  onClick={handleMusicToggle}
                  aria-label="Toggle music"
                >
                  <span className="toggle-slider"></span>
                </button>
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <span>Music Volume</span>
                <span className="volume-value">{Math.round(musicVolume)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={handleMusicVolumeChange}
                disabled={!musicEnabled}
                className="volume-slider"
                style={{ '--value': `${musicVolume}%` }}
              />
            </div>
          </div>

          {/* Language Section - Hidden for MVP */}
          {false && (
            <div className="settings-section">
              <h3 className="section-title">{t('language')}</h3>
              <p className="setting-description">{t('languageDesc')}</p>

              <div className="language-options">
                <button
                  className={`language-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  <span className="language-flag">🇺🇸</span>
                  <span className="language-name">{t('english')}</span>
                </button>

                <button
                  className={`language-btn ${language === 'es' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('es')}
                >
                  <span className="language-flag">🇪🇸</span>
                  <span className="language-name">{t('spanish')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Admin Section - Reset Progress */}
          {isAdmin && (
            <div className="settings-section danger-section">
              <h3 className="section-title">{t('resetProgress')}</h3>

              <div className="setting-item">
                <button className="reset-progress-btn" onClick={handleResetProgress}>
                  🗑️ {t('resetProgressBtn')}
                </button>
                <p className="reset-warning">{t('resetProgressDesc')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-modal">
              <div className="confirm-icon">⚠️</div>
              <h3 className="confirm-title">{t('resetProgressBtn')}</h3>
              <p className="confirm-text">
                {t('confirmReset')}
              </p>
              <div className="confirm-actions">
                <button className="confirm-cancel" onClick={cancelResetProgress}>
                  {t('cancel')}
                </button>
                <button className="confirm-delete" onClick={confirmResetProgress}>
                  {t('resetProgress')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsMenu;
