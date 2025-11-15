import { useState, useEffect, useRef } from 'react';
import '../styles/GameView.css';
import { soundManager } from '../utils/sounds';
import { getAssetPath } from '../utils/assets';

function GameView({ stage, onComplete }) {
  const [pieces, setPieces] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(stage.mode === 'easy' ? 30 : 60);
  const [isWon, setIsWon] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [draggedFromIndex, setDraggedFromIndex] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const timerRef = useRef();
  const hintTimerRef = useRef();
  const dropTimeoutRef = useRef();
  const gridSize = stage.mode === 'easy' ? 2 : 3;
  const isDraggable = true; // Enable drag-drop for both modes

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }

    initializePuzzle();

    // Show hint for 3 seconds before starting the timer
    setShowHint(true);
    hintTimerRef.current = setTimeout(() => {
      setShowHint(false);

      // Start the timer after hint is hidden
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
    }, 3000);

    return () => {
      clearInterval(timerRef.current);
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
      if (dropTimeoutRef.current) {
        clearTimeout(dropTimeoutRef.current);
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

  const handleRotate = (originalIndex, event) => {
    // Prevent rotation while dragging or just dropped
    if (draggedPiece !== null || justDropped) {
      event?.preventDefault();
      event?.stopPropagation();
      return;
    }

    const newPieces = [...pieces];
    // Find the piece by its originalIndex (which never changes)
    const pieceIndex = newPieces.findIndex(p => p.originalIndex === originalIndex);
    const piece = newPieces[pieceIndex];

    // Update logical rotation (for win condition) - clockwise only (+90 degrees)
    piece.rotation = (piece.rotation + 90) % 360;

    // Update display rotation (continuous clockwise, no reset)
    piece.displayRotation = piece.displayRotation + 90;

    setPieces(newPieces);
    setMoves(m => m + 1);
    checkWin(newPieces);

    // Play rotation sound
    soundManager.playRotate();
  };

  const handleRestartPuzzle = () => {
    setTimeExpired(false);
    setTime(stage.mode === 'easy' ? 30 : 60);
    setMoves(0);
    setIsWon(false);
    initializePuzzle();

    // Clear existing timers
    clearInterval(timerRef.current);
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
    }

    // Show hint for 3 seconds before starting the timer
    setShowHint(true);
    hintTimerRef.current = setTimeout(() => {
      setShowHint(false);

      // Start the timer after hint is hidden
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
    }, 3000);
  };

  const handleDragStart = (index, visualIndex) => {
    if (!isDraggable) return;
    setDraggedPiece(index);
    setDraggedFromIndex(visualIndex);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex) => {
    if (!isDraggable || draggedPiece === null) return;

    // Play drop sound
    soundManager.playDrop();

    const newPieces = [...pieces];
    const draggedIdx = newPieces.findIndex(p => p.currentIndex === draggedPiece);
    const targetIdx = newPieces.findIndex(p => p.currentIndex === targetIndex);

    [newPieces[draggedIdx].currentIndex, newPieces[targetIdx].currentIndex] =
      [newPieces[targetIdx].currentIndex, newPieces[draggedIdx].currentIndex];

    setPieces(newPieces);
    setDraggedPiece(null);
    setDraggedFromIndex(null);
    setMoves(m => m + 1);
    checkWin(newPieces);

    // Prevent clicks immediately after drop
    setJustDropped(true);
    if (dropTimeoutRef.current) {
      clearTimeout(dropTimeoutRef.current);
    }
    dropTimeoutRef.current = setTimeout(() => {
      setJustDropped(false);
    }, 200); // 200ms delay to prevent accidental rotation after drop
  };

  const handleDragEnd = () => {
    setDraggedPiece(null);
    setDraggedFromIndex(null);

    // Also set justDropped flag in case drop didn't fire
    setJustDropped(true);
    if (dropTimeoutRef.current) {
      clearTimeout(dropTimeoutRef.current);
    }
    dropTimeoutRef.current = setTimeout(() => {
      setJustDropped(false);
    }, 200);
  };

  const handleShowHint = () => {
    if (showHint || hintCount >= 2) return; // Prevent multiple clicks and limit to 2 hints

    setShowHint(true);
    setHintCount(hintCount + 1);

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

      // Play win sound
      soundManager.playWin();

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

  const showConfetti = () => {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    // Force transparent background on canvas element
    canvas.style.display = 'block';
    canvas.style.opacity = '1';
    canvas.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    canvas.style.background = 'none';

    // Get WebGL context with alpha channel enabled
    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
      preserveDrawingBuffer: false,
      stencil: false,
      depth: false
    });

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Set canvas to window size
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    console.log('Canvas initialized:', width, height);

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
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec3 finalColor = vec3(0.0);

        // Create 80 confetti pieces
        for(float i = 0.0; i < 80.0; i += 1.0) {
          vec2 seed = vec2(i * 0.123, i * 0.456);
          float id = random(seed);

          // Starting position (spread across top)
          float startX = random(seed + vec2(1.0, 0.0));
          float startY = -0.2 - random(seed + vec2(2.0, 0.0)) * 0.3;

          // Falling speed with variation - SUPER FAST!
          float fallSpeed = 0.5 + random(seed + vec2(3.0, 0.0)) * 0.6;

          // Horizontal drift (wind effect) - rapid movement
          float drift = sin(time * 2.5 + id * 6.28) * 0.15;
          float driftSpeed = random(seed + vec2(4.0, 0.0)) * 0.12;

          // Current position
          float x = startX + drift + sin(time * 4.0 + id * 10.0) * driftSpeed;
          float y = startY + time * fallSpeed;

          // Loop confetti from bottom to top
          y = mod(y, 1.3) - 0.15;
          x = mod(x + 0.5, 1.0);

          vec2 confettiPos = vec2(x, y);
          vec2 diff = uv - confettiPos;

          // Rotation with smooth animation - SUPER FAST rotation!
          float rotSpeed = random(seed + vec2(5.0, 0.0)) * 12.0 - 6.0;
          float angle = time * rotSpeed + id * 6.28;

          // Rotate the difference vector
          float cosA = cos(angle);
          float sinA = sin(angle);
          vec2 rotDiff = vec2(
            diff.x * cosA - diff.y * sinA,
            diff.x * sinA + diff.y * cosA
          );

          // Confetti shape - rectangle
          float aspectRatio = resolution.x / resolution.y;
          float sizeX = 0.012;
          float sizeY = 0.020;

          // Add some size variation
          float sizeVariation = 0.7 + random(seed + vec2(6.0, 0.0)) * 0.6;
          sizeX *= sizeVariation;
          sizeY *= sizeVariation;

          // Smooth rectangle shape
          float rectX = smoothstep(sizeX, sizeX * 0.8, abs(rotDiff.x));
          float rectY = smoothstep(sizeY, sizeY * 0.8, abs(rotDiff.y));
          float confettiShape = rectX * rectY;

          // Vibrant colors - fixed per piece
          vec3 color;
          float colorId = random(seed + vec2(7.0, 0.0));

          if(colorId < 0.16) {
            color = vec3(1.0, 0.2, 0.3); // Red
          } else if(colorId < 0.33) {
            color = vec3(1.0, 0.8, 0.2); // Yellow
          } else if(colorId < 0.5) {
            color = vec3(0.2, 0.8, 1.0); // Blue
          } else if(colorId < 0.66) {
            color = vec3(0.3, 1.0, 0.4); // Green
          } else if(colorId < 0.83) {
            color = vec3(1.0, 0.4, 0.8); // Pink
          } else {
            color = vec3(0.7, 0.3, 1.0); // Purple
          }

          // Shimmer effect based on rotation
          float shimmer = 0.7 + 0.3 * abs(sin(angle * 2.0));
          color *= shimmer;

          // Depth effect - pieces further away are dimmer
          float depth = random(seed + vec2(8.0, 0.0));
          float depthFade = 0.6 + depth * 0.4;

          finalColor += color * confettiShape * depthFade;
        }

        // Fade in at start and fade out at end - SUPER FAST!
        float fadeIn = smoothstep(0.0, 0.15, time);
        float fadeOut = smoothstep(2.5, 1.8, time);
        float fade = fadeIn * fadeOut;

        // Boost brightness
        finalColor *= 1.5;

        // Output with proper alpha - only show pixels where there's confetti
        float alpha = min(1.0, length(finalColor)) * fade;
        gl_FragColor = vec4(finalColor * fade, alpha);
      }
    `);
    gl.compileShader(fragmentShader);

    // Check for shader compilation errors
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader error:', gl.getShaderInfoLog(fragmentShader));
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Check for linking errors
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

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

    // Set viewport to full canvas size
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Disable depth testing (not needed for 2D)
    gl.disable(gl.DEPTH_TEST);

    // Enable blending for transparency with correct blend mode
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Set clear color to fully transparent
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    const startTime = Date.now();
    function render() {
      const currentTime = (Date.now() - startTime) / 1000;

      // Clear with transparent background
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(timeLocation, currentTime);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Super short duration - 2.5 seconds
      if (currentTime < 2.5) {
        requestAnimationFrame(render);
      } else {
        canvas.style.opacity = '0';
        setTimeout(() => {
          canvas.style.display = 'none';
        }, 200);
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
        <button className="back-button" onClick={onComplete}>
          <img src={getAssetPath('UI/back.png')} alt="Back" className="back-icon" />
        </button>

        <div className="game-stats-row">
          <div className="stat-compact">
            <div className="stat-icon">⏱️</div>
            <div>
              <div className={`stat-value-compact ${time <= 10 ? 'time-warning' : ''}`}>
                {formatTime(time)}
              </div>
              <div className="stat-label-compact">Time</div>
            </div>
          </div>
          <div className="stat-compact">
            <div className="stat-icon">🎯</div>
            <div>
              <div className="stat-value-compact">{moves}</div>
              <div className="stat-label-compact">Moves</div>
            </div>
          </div>
          {pb && (
            <div className="stat-compact">
              <div className="stat-icon">🏆</div>
              <div>
                <div className="stat-value-compact">{formatTime(parseInt(pb))}</div>
                <div className="stat-label-compact">Best</div>
              </div>
            </div>
          )}
        </div>

        <div className="header-actions">
          <button className="tutorial-button" onClick={handleShowTutorialAgain}>
            ❓
          </button>
          <button
            className="hint-button"
            onClick={handleShowHint}
            disabled={showHint || isWon || hintCount >= 2}
          >
            <img src={getAssetPath('UI/hint-btn.png')} alt="Hint" className="hint-icon" />
            <span>{2 - hintCount}</span>
          </button>
        </div>
      </div>

      <div className="puzzle-container">
        <div className={`puzzle-grid ${stage.mode}`}>
          {sortedPieces.map((piece, index) => {
            const isBeingDragged = draggedPiece === piece.currentIndex;
            const isHollowSlot = draggedFromIndex === index;
            const isDropTarget = draggedPiece !== null && !isBeingDragged && !isHollowSlot;

            return (
              <div
                key={index}
                className={`puzzle-piece
                  ${piece.rotation === 0 && piece.currentIndex === piece.originalIndex ? 'correct' : ''}
                  ${isBeingDragged ? 'dragging' : ''}
                  ${isHollowSlot ? 'hollow-slot' : ''}
                  ${isDropTarget ? 'drop-target' : ''}`}
                style={{
                  backgroundImage: isHollowSlot ? 'none' : `url(${piece.image})`,
                  transform: isBeingDragged ? 'scale(1.15)' : `rotate(${piece.displayRotation}deg)`,
                  transition: isBeingDragged ? 'none' : undefined
                }}
                onClick={(e) => handleRotate(piece.originalIndex, e)}
                draggable={isDraggable}
                onDragStart={() => handleDragStart(piece.currentIndex, index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(piece.currentIndex)}
                onDragEnd={handleDragEnd}
              />
            );
          })}
        </div>

        <h2 className="stage-title">{stage.name}</h2>

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
          <div className="time-expired-title">Time&apos;s Up!</div>
          <p className="time-expired-text">Don&apos;t worry, let&apos;s try again!</p>
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
              Let&apos;s Play! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameView;
