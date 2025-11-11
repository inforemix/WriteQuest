import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import MapView from './components/MapView';
import GameView from './components/GameView';
import './styles/App.css';

function App() {
  const [screen, setScreen] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [stages, setStages] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('stages');
    if (saved) {
      setStages(JSON.parse(saved));
    }
  }, []);

  const saveStages = (newStages) => {
    setStages(newStages);
    localStorage.setItem('stages', JSON.stringify(newStages));
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setScreen('map');
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
        />
      )}

      {screen === 'game' && currentStage && (
        <GameView
          stage={currentStage}
          onComplete={handleGameComplete}
        />
      )}
    </div>
  );
}

export default App;
