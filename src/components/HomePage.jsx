import { useState } from 'react';
import '../styles/HomePage.css';
import { soundManager } from '../utils/sounds';
import { getAssetPath } from '../utils/assets';
import SettingsMenu from './SettingsMenu';

function HomePage({ isAdmin, setIsAdmin, onModeSelect }) {
  const [showSettings, setShowSettings] = useState(false);

  const handleModeSelect = (mode) => {
    soundManager.playClick();
    onModeSelect(mode);
  };

  return (
    <div className="map-home">
      <div className="home-content">
        <img src={getAssetPath('UI/title.png')} alt="Write Aqua" className="game-title-image" />

        <div className="character-background"></div>

        <div className="button-stack">
          <img
            src={getAssetPath('UI/Light Wood-easy.png')}
            alt="Easy"
            className="wood-button clickable"
            onClick={() => handleModeSelect('easy')}
          />
          <img
            src={getAssetPath('UI/Light Wood-hard.png')}
            alt="Hard"
            className="wood-button clickable"
            onClick={() => handleModeSelect('hard')}
          />
        </div>
      </div>

      <div className="version-badge">v0.2</div>

      <button
        className="settings-button"
        onClick={() => setShowSettings(true)}
        title="Settings"
      >
        <img src={getAssetPath('UI/setting.png')} alt="Settings" className="button-icon" />
      </button>

      <SettingsMenu
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />
    </div>
  );
}

export default HomePage;
