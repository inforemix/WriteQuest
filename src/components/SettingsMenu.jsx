import { useState, useEffect } from 'react';
import '../styles/SettingsMenu.css';
import { soundManager } from '../utils/sounds';

function SettingsMenu({ isOpen, onClose, isAdmin, setIsAdmin }) {
  const [volume, setVolume] = useState(soundManager.volume * 100);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.enabled);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  // Sync state when menu opens
  useEffect(() => {
    if (isOpen) {
      setVolume(soundManager.volume * 100);
      setSoundEnabled(soundManager.enabled);
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

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    // In a real app, this would trigger i18n language change
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-menu" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          {/* Mode Section */}
          <div className="settings-section">
            <h3 className="section-title">Mode</h3>

            <div className="setting-item">
              <label className="setting-label">
                <span>{isAdmin ? '🔐 Admin Mode' : '👤 Player Mode'}</span>
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
            <h3 className="section-title">Sound</h3>

            <div className="setting-item">
              <label className="setting-label">
                <span>Enable Sound</span>
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

          {/* Language Section */}
          <div className="settings-section">
            <h3 className="section-title">Language</h3>

            <div className="language-options">
              <button
                className={`language-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                <span className="language-flag">🇺🇸</span>
                <span className="language-name">English</span>
              </button>

              <button
                className={`language-btn ${language === 'zh' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('zh')}
              >
                <span className="language-flag">🇨🇳</span>
                <span className="language-name">中文</span>
              </button>

              <button
                className={`language-btn ${language === 'zh-tw' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('zh-tw')}
              >
                <span className="language-flag">🇹🇼</span>
                <span className="language-name">繁體中文</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsMenu;
