import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import MapView from './components/MapView';
import GameView from './components/GameView';
import { defaultStages } from './data/preloadStages';
import { LanguageProvider } from './contexts/LanguageContext';
import { getAssetPath } from './utils/assets';
import './styles/App.css';

function App() {
  // Set CSS variables for asset paths
  useEffect(() => {
    document.documentElement.style.setProperty('--wood-nav-bg', `url(${getAssetPath('UI/wood-nav.jpg')})`);
    document.documentElement.style.setProperty('--mobile-bk', `url(${getAssetPath('UI/mobile-bk.png')})`);
    document.documentElement.style.setProperty('--mobile-hint', `url(${getAssetPath('UI/mobile-hint.png')})`);
    document.documentElement.style.setProperty('--light-wood-panel', `url(${getAssetPath('UI/LightWoodpanel.png')})`);
  }, []);
  const [screen, setScreen] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [stages, setStages] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);

  useEffect(() => {
    // Always reset to default preloaded stages on app start
    setStages(defaultStages);
    localStorage.setItem('stages', JSON.stringify(defaultStages));

    // Clear all completion and personal best data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('pb-') || key.startsWith('completed-')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  const saveStages = (newStages) => {
    setStages(newStages);
    localStorage.setItem('stages', JSON.stringify(newStages));
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setScreen('map');
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
  };

  const handlePlayStage = (stage) => {
    setCurrentStage(stage);
    setScreen('game');
  };

  const handleDeleteStage = (stageId) => {
    if (confirm('Delete this stage?')) {
      const newStages = stages.filter(s => s.id !== stageId);
      saveStages(newStages);
    }
  };

  const handleGameComplete = () => {
    setScreen('map');
    setCurrentStage(null);
  };

  return (
    <LanguageProvider>
      <div className="app">
        {screen === 'home' && (
          <HomePage
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
            onModeSelect={handleModeSelect}
          />
        )}

        {screen === 'map' && (
          <MapView
            mode={selectedMode}
            stages={stages}
            isAdmin={isAdmin}
            onBack={() => setScreen('home')}
            onPlayStage={handlePlayStage}
            onDeleteStage={handleDeleteStage}
            onStagesUpdate={saveStages}
            onModeChange={handleModeChange}
          />
        )}

        {screen === 'game' && currentStage && (
          <GameView
            stage={currentStage}
            onComplete={handleGameComplete}
            allStages={stages}
          />
        )}
      </div>
    </LanguageProvider>
  );
}

export default App;
