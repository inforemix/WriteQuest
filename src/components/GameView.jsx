import { useState, useEffect, useRef } from 'react';
import '../styles/GameView.css';

function GameView({ stage, onComplete }) {
  const [pieces, setPieces] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(stage.mode === 'easy' ? 30 : 60);
  const [isWon, setIsWon] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const timerRef = useRef();
  const hintTimerRef = useRef();
  const gridSize = stage.mode === 'easy' ? 2 : 3;
  const isDraggable = true; // Enable drag-drop for both modes

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }

    initializePuzzle();
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimeExpired(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
    };
  }, []);

  const initializePuzzle = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const pieceWidth = canvas.width / gridSize;
      const pieceHeight = canvas.height / gridSize;
      const newPieces = [];

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const pieceCanvas = document.createElement('canvas');
          pieceCanvas.width = pieceWidth;
          pieceCanvas.height = pieceHeight;
          const pieceCtx = pieceCanvas.getContext('2d');

          pieceCtx.drawImage(
            canvas,
            col * pieceWidth,
            row * pieceHeight,
            pieceWidth,
            pieceHeight,
            0,
            0,
            pieceWidth,
            pieceHeight
          );

          const index = row * gridSize + col;
          newPieces.push({
            image: pieceCanvas.toDataURL(),
            originalIndex: index,
            currentIndex: index,
            rotation: 0,
            displayRotation: 0
          });
        }
      }

      scramblePuzzle(newPieces);
    };

    img.src = stage.image;
  };

  const scramblePuzzle = (piecesArray) => {
    // Scramble rotations with clockwise-only display
    piecesArray.forEach(piece => {
      const rotation = [90, 180, 270][Math.floor(Math.random() * 3)];
      piece.rotation = rotation;
      piece.displayRotation = rotation;
    });

    // Scramble positions for hard mode
    if (isDraggable) {
      const indices = piecesArray.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      piecesArray.forEach((piece, i) => {
        piece.currentIndex = indices[i];
      });
    }

    setPieces([...piecesArray]);
  };

  const handleRotate = (originalIndex) => {
    const newPieces = [...pieces];
    // Find the piece by its originalIndex (which never changes)
    const pieceIndex = newPieces.findIndex(p => p.originalIndex === originalIndex);
    const piece = newPieces[pieceIndex];

    // Update logical rotation (for win condition)
    piece.rotation = (piece.rotation + 90) % 360;

    // Update display rotation (use modulo to prevent accumulation)
    piece.displayRotation = (piece.displayRotation + 90) % 360;

    setPieces(newPieces);
    setMoves(m => m + 1);
    checkWin(newPieces);

    // Find the visual index for particles (position in sortedPieces)
    const sortedPieces = [...newPieces].sort((a, b) => a.currentIndex - b.currentIndex);
    const visualIndex = sortedPieces.findIndex(p => p.originalIndex === originalIndex);
    createParticles(visualIndex);
  };

  const handleRestartPuzzle = () => {
    setTimeExpired(false);
    setTime(stage.mode === 'easy' ? 30 : 60);
    setMoves(0);
    setIsWon(false);
    setShowHint(false);
    initializePuzzle();

    // Restart timer
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimeExpired(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleDragStart = (index) => {
    if (!isDraggable) return;
    setDraggedPiece(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex) => {
    if (!isDraggable || draggedPiece === null) return;

    const newPieces = [...pieces];
    const draggedIdx = newPieces.findIndex(p => p.currentIndex === draggedPiece);
    const targetIdx = newPieces.findIndex(p => p.currentIndex === targetIndex);

    [newPieces[draggedIdx].currentIndex, newPieces[targetIdx].currentIndex] =
      [newPieces[targetIdx].currentIndex, newPieces[draggedIdx].currentIndex];

    setPieces(newPieces);
    setDraggedPiece(null);
    setMoves(m => m + 1);
    checkWin(newPieces);
  };

  const handleShowHint = () => {
    if (showHint) return; // Prevent multiple clicks

    setShowHint(true);

    // Hide hint after 3 seconds
    hintTimerRef.current = setTimeout(() => {
      setShowHint(false);
    }, 3000);
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const handleShowTutorialAgain = () => {
    setShowTutorial(true);
  };

  const checkWin = (piecesArray) => {
    const isCorrect = piecesArray.every(piece =>
      piece.rotation === 0 && piece.currentIndex === piece.originalIndex
    );

    if (isCorrect && !isWon) {
      clearInterval(timerRef.current);
      setIsWon(true);
      showConfetti();

      // Save personal best time
      const key = `pb-${stage.mode}-${stage.id}`;
      const pb = localStorage.getItem(key);
      if (!pb || time < parseInt(pb)) {
        localStorage.setItem(key, time.toString());
      }

      // Mark stage as completed
      const completedKey = `completed-${stage.id}`;
      localStorage.setItem(completedKey, 'true');
    }
  };

  const createParticles = (index) => {
    const piece = document.querySelectorAll('.puzzle-piece')[index];
    if (!piece) return;

    const rect = piece.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        width: 8px;
        height: 8px;
        background: #10b981;
        --tx: ${(Math.random() - 0.5) * 100}px;
        --ty: ${(Math.random() - 0.5) * 100}px;
      `;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }
  };

  const showConfetti = () => {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    canvas.style.display = 'block';
    canvas.style.opacity = '1';

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
      precision mediump float;
      uniform vec2 resolution;
      uniform float time;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float t = time * 0.5;
        vec2 pos = vec2(uv.x * 20.0, uv.y * 20.0 + t * 5.0);
        float noise = random(floor(pos));

        vec2 cellPos = fract(pos);
        float confetti = 0.0;

        if (noise > 0.7) {
          float d = length(cellPos - vec2(0.5));
          confetti = smoothstep(0.3, 0.1, d);

          vec3 color = vec3(
            0.5 + 0.5 * sin(noise * 10.0),
            0.5 + 0.5 * sin(noise * 15.0 + 2.0),
            0.5 + 0.5 * sin(noise * 20.0 + 4.0)
          );

          float fade = smoothstep(3.0, 0.0, t);
          gl_FragColor = vec4(color * confetti * fade, confetti * fade);
        } else {
          gl_FragColor = vec4(0.0);
        }
      }
    `);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'resolution');
    const timeLocation = gl.getUniformLocation(program, 'time');

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    const startTime = Date.now();
    function render() {
      const currentTime = (Date.now() - startTime) / 1000;
      gl.uniform1f(timeLocation, currentTime);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (currentTime < 3.0) {
        requestAnimationFrame(render);
      } else {
        canvas.style.opacity = '0';
        setTimeout(() => {
          canvas.style.display = 'none';
        }, 500);
      }
    }
    render();
  };

  const sortedPieces = [...pieces].sort((a, b) => a.currentIndex - b.currentIndex);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const pb = localStorage.getItem(`pb-${stage.mode}-${stage.id}`);
  const isNewPB = isWon && (!pb || time < parseInt(pb));

  return (
    <div className="game-view">
      <canvas id="confetti-canvas"></canvas>

      <div className="game-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="back-button" onClick={onComplete}>← Back</button>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>{stage.name}</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="tutorial-button" onClick={handleShowTutorialAgain}>
              ❓
            </button>
            <button className="hint-button" onClick={handleShowHint} disabled={showHint || isWon}>
              💡 Hint
            </button>
            <div className={`difficulty-badge ${stage.mode}`}>
              {stage.mode === 'easy' ? '2×2' : '3×3'}
            </div>
          </div>
        </div>

        <div className="game-stats">
          <div className="stat">
            <div className={`stat-value ${time <= 10 ? 'time-warning' : ''}`}>
              {formatTime(time)}
            </div>
            <div className="stat-label">Time Remaining</div>
          </div>
          <div className="stat">
            <div className="stat-value">{moves}</div>
            <div className="stat-label">Moves</div>
          </div>
          {pb && (
            <div className="stat">
              <div className="stat-value">{formatTime(parseInt(pb))}</div>
              <div className="stat-label">Best</div>
            </div>
          )}
        </div>
      </div>

      <div className="puzzle-container">
        <div className={`puzzle-grid ${stage.mode}`}>
          {sortedPieces.map((piece, index) => (
            <div
              key={index}
              className={`puzzle-piece ${piece.rotation === 0 && piece.currentIndex === piece.originalIndex ? 'correct' : ''}`}
              style={{
                backgroundImage: `url(${piece.image})`,
                transform: `rotate(${piece.displayRotation}deg)`
              }}
              onClick={() => handleRotate(piece.originalIndex)}
              draggable={isDraggable}
              onDragStart={() => handleDragStart(piece.currentIndex)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(piece.currentIndex)}
            />
          ))}
        </div>

        {showHint && (
          <div className="hint-overlay">
            <div className="hint-image-container">
              <img src={stage.image} alt="Hint" className="hint-image" />
              <div className="hint-timer">Hint will hide in 3s...</div>
            </div>
          </div>
        )}
      </div>

      {isWon && (
        <div className="win-modal">
          <div className="win-emoji">🎉</div>
          <div className="win-title">Puzzle Complete!</div>
          <div className="win-stats">
            <div className="win-stat">
              <div className="win-stat-value">{formatTime(time)}</div>
              <div className="win-stat-label">Time Remaining</div>
            </div>
            <div className="win-stat">
              <div className="win-stat-value">{moves}</div>
              <div className="win-stat-label">Moves</div>
            </div>
          </div>
          {isNewPB && <div className="pb-indicator">🏆 New Personal Best!</div>}
          <button className="win-button" onClick={onComplete}>Continue</button>
        </div>
      )}

      {timeExpired && (
        <div className="time-expired-modal">
          <div className="time-expired-emoji">⏰</div>
          <div className="time-expired-title">Time's Up!</div>
          <p className="time-expired-text">Don't worry, let's try again!</p>
          <div className="time-expired-actions">
            <button className="restart-button" onClick={handleRestartPuzzle}>
              🔄 Restart Puzzle
            </button>
            <button className="back-button-modal" onClick={onComplete}>
              ← Back to Map
            </button>
          </div>
        </div>
      )}

      {showTutorial && (
        <div className="tutorial-overlay" onClick={handleCloseTutorial}>
          <div className="tutorial-modal" onClick={e => e.stopPropagation()}>
            <div className="tutorial-header">
              <h2 className="tutorial-title">🎮 How to Play</h2>
              <button className="close-button" onClick={handleCloseTutorial}>×</button>
            </div>
            <div className="tutorial-content">
              <div className="tutorial-section">
                <div className="tutorial-icon">🔄</div>
                <h3>Rotate Pieces</h3>
                <p>Click on any puzzle piece to rotate it 90° clockwise</p>
              </div>
              <div className="tutorial-section">
                <div className="tutorial-icon">🔀</div>
                <h3>Swap Positions</h3>
                <p>Drag and drop pieces to swap their positions</p>
              </div>
              <div className="tutorial-section">
                <div className="tutorial-icon">🎯</div>
                <h3>Complete the Puzzle</h3>
                <p>Match all pieces to their correct positions and rotations</p>
              </div>
              <div className="tutorial-section">
                <div className="tutorial-icon">⏱️</div>
                <h3>Beat the Clock</h3>
                <p>Easy: 30 seconds | Hard: 60 seconds</p>
              </div>
              <div className="tutorial-section">
                <div className="tutorial-icon">💡</div>
                <h3>Use Hints</h3>
                <p>Click the hint button to see the complete image for 3 seconds</p>
              </div>
            </div>
            <button className="tutorial-start-button" onClick={handleCloseTutorial}>
              Let's Play! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameView;
