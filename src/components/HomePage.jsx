import '../styles/HomePage.css';

function HomePage({ isAdmin, setIsAdmin, onModeSelect }) {
  return (
    <div className="map-home">
      <button
        className={`admin-toggle ${isAdmin ? 'active' : ''}`}
        onClick={() => setIsAdmin(!isAdmin)}
      >
        {isAdmin ? '🔐 Admin Mode' : '👤 Player Mode'}
      </button>

      <div className="clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      <div className="game-title">
        <h1>PUZZLE QUEST</h1>
        <p>Choose Your Adventure</p>
      </div>

      <div className="mode-selector">
        <div className="mode-node" onClick={() => onModeSelect('easy')}>
          <div className="node-circle">🌟</div>
          <div className="mode-label">Easy Mode</div>
        </div>

        <div className="mode-node" onClick={() => onModeSelect('hard')}>
          <div className="node-circle">🔥</div>
          <div className="mode-label">Hard Mode</div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
