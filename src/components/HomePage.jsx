import { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import { soundManager } from '../utils/sounds';
import { getAssetPath } from '../utils/assets';
import { useLanguage } from '../contexts/LanguageContext';
import SettingsMenu from './SettingsMenu';
import VideoModal from './VideoModal';

function HomePage({ isAdmin, setIsAdmin, onModeSelect }) {
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Start background music on mount
  useEffect(() => {
    soundManager.startBackgroundMusic();
  }, []);

  const handlePlayClick = () => {
    soundManager.playClick();
    // Default to Easy mode when clicking Play
    onModeSelect('easy');
  };

  const handleStoryClick = () => {
    soundManager.playClick();
    setShowVideo(true);
  };

  return (
    <div
      className="map-home"
      style={{
        '--bg-image': `url(${getAssetPath('UI/Home-graphic.jpg')})`,
        '--bg-image-mobile': `url(${getAssetPath('UI/mobile-graphic.jpg')})`
      }}
    >
      <div className="home-content">
        <img src={getAssetPath('UI/title.png')} alt="Write Aqua" className="game-title-image" />

        <div className="character-background"></div>

        <div className="button-stack">
          <img
            src={getAssetPath('UI/Play.png')}
            alt="Play"
            className="wood-button clickable"
            onClick={handlePlayClick}
          />
          <img
            src={getAssetPath('UI/story.png')}
            alt="Story"
            className="wood-button clickable"
            onClick={handleStoryClick}
          />
        </div>
      </div>

      <div className="version-badge">v0.3</div>

      <button
        className="settings-button"
        onClick={() => setShowSettings(true)}
        title={t('settings')}
      >
        <img src={getAssetPath('UI/setting.png')} alt={t('settings')} className="button-icon" />
      </button>

      <SettingsMenu
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      <VideoModal
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
        videoUrl="https://youtu.be/llbuZV0ft6Y?si=S9rzM5wgr3194kkh"
      />
    </div>
  );
}

export default HomePage;
