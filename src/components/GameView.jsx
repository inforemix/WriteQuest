import { useState, useEffect, useRef } from 'react';
import '../styles/GameView.css';
import { soundManager } from '../utils/sounds';
import { getAssetPath } from '../utils/assets';
import { useLanguage } from '../contexts/LanguageContext';
import { playCantonesePronunciation, getPronunciation } from '../utils/cantoneseAudio';

function GameView({ stage, onComplete, allStages }) {
  const { t } = useLanguage();
  const [pieces, setPieces] = useState([]);
  const [moves, setMoves] = useState(stage.mode === 'hard' ? 30 : 15);
  const [time, setTime] = useState(stage.mode === 'easy' ? 20 : 50);
  const [isWon, setIsWon] = useState(false);
  const [moveLimitExceeded, setMoveLimitExceeded] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [draggedFromIndex, setDraggedFromIndex] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintFadingOut, setHintFadingOut] = useState(false);
  const [hintCountdown, setHintCountdown] = useState(3);
  const [showTutorial, setShowTutorial] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [justDropped, setJustDropped] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [touchDragTarget, setTouchDragTarget] = useState(null);
  const [isLastEasyPuzzle, setIsLastEasyPuzzle] = useState(false);
  const [isLastHardPuzzle, setIsLastHardPuzzle] = useState(false);
  const timerRef = useRef();
  const hintTimerRef = useRef();
  const hintCountdownRef = useRef();
  const dropTimeoutRef = useRef();
  const touchStartPos = useRef({ x: 0, y: 0 });
  const gridSize = stage.mode === 'easy' ? 2 : 3;
  const isDraggable = true; // Enable drag-drop for both modes
  const moveLimit = stage.mode === 'hard' ? 30 : 15; // Hard: 30, Easy: 15 moves countdown

  // Check if this is the last easy puzzle to complete
  useEffect(() => {
    if (stage.mode === 'easy' && allStages) {
      const easyStages = allStages.filter(s => s.mode === 'easy');
      const completedEasyStages = easyStages.filter(s => {
        if (s.id === stage.id) return false; // Exclude current stage
        const completedKey = `completed-${s.id}`;
        return localStorage.getItem(completedKey) === 'true';
      });

      // This is the last puzzle if all other easy puzzles are completed
      const isLast = completedEasyStages.length === easyStages.length - 1;
      setIsLastEasyPuzzle(isLast);
    }
  }, [stage, allStages]);

  // Check if this is the last hard puzzle to complete
  useEffect(() => {
    if (stage.mode === 'hard' && allStages) {
      const hardStages = allStages.filter(s => s.mode === 'hard');
      const completedHardStages = hardStages.filter(s => {
        if (s.id === stage.id) return false; // Exclude current stage
        const completedKey = `completed-${s.id}`;
        return localStorage.getItem(completedKey) === 'true';
      });

      // This is the last puzzle if all other hard puzzles are completed
      const isLast = completedHardStages.length === hardStages.length - 1;
      setIsLastHardPuzzle(isLast);
    }
  }, [stage, allStages]);

  useEffect(() => {
    // Set background CSS variables
    const pollutedBgUrl = getAssetPath('UI/polluted-bg.jpg');
    const cleanBgUrl = getAssetPath('UI/clean-bg.jpg');
    document.documentElement.style.setProperty('--polluted-bg', `url(${pollutedBgUrl})`);
    document.documentElement.style.setProperty('--clean-bg', `url(${cleanBgUrl})`);

    initializePuzzle();

    // Show hint immediately with countdown starting at 3
    setShowHint(true);
    setHintCountdown(3);

    // Start countdown interval
    hintCountdownRef.current = setInterval(() => {
      setHintCountdown(prev => {
        if (prev <= 1) {
          clearInterval(hintCountdownRef.current);
          return prev;
        }
        return prev - 1;
      });
    }, 1000);

    // Trigger fade-out after 2.7 seconds (before the full 3 seconds)
    hintTimerRef.current = setTimeout(() => {
      setHintFadingOut(true);

      // Hide hint after fade-out animation completes (0.3s)
      setTimeout(() => {
        setShowHint(false);
        setHintFadingOut(false);

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
      }, 300);
    }, 2700);

    return () => {
      clearInterval(timerRef.current);
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
      if (hintCountdownRef.current) {
        clearInterval(hintCountdownRef.current);
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

    // Check move limit (both modes count down)
    if (moves <= 0) {
      setMoveLimitExceeded(true);
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
    // Decrement moves (both modes count down)
    const newMoves = moves - 1;
    setMoves(newMoves);

    // Check if moves ran out after this move
    if (newMoves <= 0) {
      setMoveLimitExceeded(true);
    }

    checkWin(newPieces);

    // Play rotation sound
    soundManager.playRotate();
  };

  const handleRestartPuzzle = () => {
    setTimeExpired(false);
    setMoveLimitExceeded(false);
    setTime(stage.mode === 'easy' ? 20 : 50);
    setMoves(stage.mode === 'hard' ? 30 : 15);
    setIsWon(false);
    initializePuzzle();

    // Clear existing timers and intervals
    clearInterval(timerRef.current);
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
    }
    if (hintCountdownRef.current) {
      clearInterval(hintCountdownRef.current);
    }

    // Show hint immediately with countdown starting at 3
    setShowHint(true);
    setHintFadingOut(false);
    setHintCountdown(3);

    // Start countdown interval
    hintCountdownRef.current = setInterval(() => {
      setHintCountdown(prev => {
        if (prev <= 1) {
          clearInterval(hintCountdownRef.current);
          return prev;
        }
        return prev - 1;
      });
    }, 1000);

    // Trigger fade-out after 2.7 seconds (before the full 3 seconds)
    hintTimerRef.current = setTimeout(() => {
      setHintFadingOut(true);

      // Hide hint after fade-out animation completes (0.3s)
      setTimeout(() => {
        setShowHint(false);
        setHintFadingOut(false);

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
      }, 300);
    }, 2700);
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

    // Check move limit (both modes count down)
    if (moves <= 0) {
      setMoveLimitExceeded(true);
      setDraggedPiece(null);
      setDraggedFromIndex(null);
      return;
    }

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
    // Decrement moves (both modes count down)
    const newMoves = moves - 1;
    setMoves(newMoves);

    // Check if moves ran out after this move
    if (newMoves <= 0) {
      setMoveLimitExceeded(true);
    }

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

  // Touch event handlers for mobile support
  const handleTouchStart = (e, index, visualIndex) => {
    if (!isDraggable) return;

    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    // Don't set drag state immediately - wait for movement
    // This allows taps to still register as clicks for rotation
  };

  const handleTouchMove = (e) => {
    if (!isDraggable) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

    // Only start dragging if moved more than 10px (prevents accidental drags on taps)
    if (deltaX > 10 || deltaY > 10) {
      // Now we know it's a drag, not a tap
      e.preventDefault(); // Prevent scrolling

      // Get the piece being dragged from the touch target
      if (draggedPiece === null) {
        const target = e.target;
        if (target.classList.contains('puzzle-piece')) {
          const index = parseInt(target.dataset.currentIndex);
          const visualIndex = Array.from(target.parentElement.children).indexOf(target);
          setDraggedPiece(index);
          setDraggedFromIndex(visualIndex);
        }
      }

      setTouchDragTarget({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = (e) => {
    if (draggedPiece === null) {
      // This was a tap, not a drag - let the click handler deal with it
      return;
    }

    e.preventDefault();

    const touch = e.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    // Find the closest puzzle piece element
    let puzzlePiece = targetElement;
    while (puzzlePiece && !puzzlePiece.classList.contains('puzzle-piece')) {
      puzzlePiece = puzzlePiece.parentElement;
    }

    if (puzzlePiece) {
      // Get the index from the piece
      const targetIndex = parseInt(puzzlePiece.dataset.currentIndex);
      if (!isNaN(targetIndex) && targetIndex !== draggedPiece) {
        handleDrop(targetIndex);
      }
    }

    // Reset drag state
    setDraggedPiece(null);
    setDraggedFromIndex(null);
    setTouchDragTarget(null);

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
    setHintCountdown(3);

    // Start countdown interval
    if (hintCountdownRef.current) {
      clearInterval(hintCountdownRef.current);
    }
    hintCountdownRef.current = setInterval(() => {
      setHintCountdown(prev => {
        if (prev <= 1) {
          clearInterval(hintCountdownRef.current);
          return prev;
        }
        return prev - 1;
      });
    }, 1000);

    // Trigger fade-out after 2.7 seconds
    hintTimerRef.current = setTimeout(() => {
      setHintFadingOut(true);

      // Hide hint after fade-out animation completes (0.3s)
      setTimeout(() => {
        setShowHint(false);
        setHintFadingOut(false);
      }, 300);
    }, 2700);
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
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
      uniform float variation;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      // Noise function for organic movement
      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec3 finalColor = vec3(0.0);

        // Animation type based on variation (0-2)
        // 0: Burst explosion from center
        // 1: Waterfall with splash
        // 2: Spiral celebration

        // Create 100 confetti pieces for more excitement
        for(float i = 0.0; i < 100.0; i += 1.0) {
          vec2 seed = vec2(i * 0.123, i * 0.456);
          float id = random(seed);

          float x, y;
          float gravity = 0.0;

          if(variation < 0.5) {
            // BURST EXPLOSION - pieces explode from center then fall with gravity
            float burstAngle = random(seed + vec2(1.0, 0.0)) * 6.28318;
            float burstSpeed = 0.3 + random(seed + vec2(2.0, 0.0)) * 0.7;
            float burstTime = min(time * 2.0, 1.0); // Quick burst

            // Initial burst outward
            float burstX = cos(burstAngle) * burstSpeed * burstTime;
            float burstY = sin(burstAngle) * burstSpeed * burstTime;

            // Gravity kicks in after burst
            gravity = max(0.0, time - 0.3) * 1.5;

            x = 0.5 + burstX + sin(time * 3.0 + id * 4.0) * 0.05;
            y = 0.5 + burstY - gravity * gravity * 0.3;

            // Bounce effect at bottom
            if(y < 0.0) {
              float bounceCount = floor(-y / 0.3);
              y = abs(mod(y, 0.3)) * pow(0.5, bounceCount);
            }
          } else if(variation < 1.5) {
            // WATERFALL WITH SPLASH - cascading from multiple points
            float columnId = floor(random(seed + vec2(1.0, 0.0)) * 5.0);
            float startX = 0.15 + columnId * 0.175;
            float startY = 1.2 + random(seed + vec2(2.0, 0.0)) * 0.5;

            float fallSpeed = 0.8 + random(seed + vec2(3.0, 0.0)) * 0.6;
            float waterNoise = noise(vec2(time * 2.0, i * 0.1)) * 0.1;

            x = startX + waterNoise + sin(time * 5.0 + id * 8.0) * 0.03;
            y = startY - time * fallSpeed;

            // Splash effect when hitting bottom
            if(y < 0.1) {
              float splashTime = (0.1 - y) / fallSpeed;
              float splashAngle = random(seed + vec2(4.0, 0.0)) * 3.14159;
              float splashSpeed = 0.3 + random(seed + vec2(5.0, 0.0)) * 0.4;
              x += cos(splashAngle) * splashSpeed * splashTime;
              y = 0.1 + sin(splashAngle) * splashSpeed * splashTime - splashTime * splashTime * 0.8;
            }

            // Loop back to top
            if(y < -0.2) {
              y = mod(y + 1.4, 1.4);
            }
          } else {
            // SPIRAL CELEBRATION - pieces spiral outward with sparkle
            float spiralAngle = id * 6.28318 + time * (2.0 + random(seed + vec2(1.0, 0.0)) * 2.0);
            float spiralRadius = time * 0.3 * (0.5 + random(seed + vec2(2.0, 0.0)) * 0.5);
            spiralRadius = min(spiralRadius, 0.6);

            // Add wave motion
            float wave = sin(time * 4.0 + id * 3.0) * 0.05;

            x = 0.5 + cos(spiralAngle) * spiralRadius + wave;
            y = 0.5 + sin(spiralAngle) * spiralRadius * 0.7 - time * 0.1;

            // Gentle gravity pull
            y -= time * time * 0.03;
          }

          vec2 confettiPos = vec2(x, y);
          vec2 diff = uv - confettiPos;

          // Dynamic rotation based on movement
          float rotSpeed = random(seed + vec2(5.0, 0.0)) * 15.0 - 7.5;
          float tumble = sin(time * 6.0 + id * 5.0) * 2.0; // Tumbling effect
          float angle = time * rotSpeed + tumble + id * 6.28;

          // Rotate the difference vector
          float cosA = cos(angle);
          float sinA = sin(angle);
          vec2 rotDiff = vec2(
            diff.x * cosA - diff.y * sinA,
            diff.x * sinA + diff.y * cosA
          );

          // Variable shapes - mix of rectangles and squares
          float shapeType = random(seed + vec2(9.0, 0.0));
          float sizeX = shapeType < 0.3 ? 0.008 : 0.012;
          float sizeY = shapeType < 0.3 ? 0.008 : 0.018;

          // Size variation with pulse
          float pulse = 1.0 + sin(time * 8.0 + id * 4.0) * 0.15;
          float sizeVariation = (0.6 + random(seed + vec2(6.0, 0.0)) * 0.8) * pulse;
          sizeX *= sizeVariation;
          sizeY *= sizeVariation;

          // Smooth rectangle shape
          float rectX = smoothstep(sizeX, sizeX * 0.7, abs(rotDiff.x));
          float rectY = smoothstep(sizeY, sizeY * 0.7, abs(rotDiff.y));
          float confettiShape = rectX * rectY;

          // Expanded vibrant color palette
          vec3 color;
          float colorId = random(seed + vec2(7.0, 0.0));

          if(colorId < 0.125) {
            color = vec3(1.0, 0.2, 0.3); // Red
          } else if(colorId < 0.25) {
            color = vec3(1.0, 0.8, 0.2); // Yellow
          } else if(colorId < 0.375) {
            color = vec3(0.2, 0.8, 1.0); // Blue
          } else if(colorId < 0.5) {
            color = vec3(0.3, 1.0, 0.4); // Green
          } else if(colorId < 0.625) {
            color = vec3(1.0, 0.4, 0.8); // Pink
          } else if(colorId < 0.75) {
            color = vec3(0.7, 0.3, 1.0); // Purple
          } else if(colorId < 0.875) {
            color = vec3(1.0, 0.5, 0.0); // Orange
          } else {
            color = vec3(0.0, 1.0, 0.8); // Cyan
          }

          // Enhanced shimmer with sparkle bursts
          float shimmer = 0.6 + 0.4 * abs(sin(angle * 2.0 + time * 3.0));
          float sparkle = pow(max(0.0, sin(time * 20.0 + id * 15.0)), 8.0) * 0.5;
          color *= shimmer + sparkle;

          // Depth effect with distance fade
          float depth = random(seed + vec2(8.0, 0.0));
          float depthFade = 0.5 + depth * 0.5;

          // Distance from visible area fade
          float edgeFade = 1.0 - smoothstep(0.0, 0.15, max(-y, y - 1.0));
          edgeFade *= 1.0 - smoothstep(0.0, 0.15, max(-x, x - 1.0));

          finalColor += color * confettiShape * depthFade * edgeFade;
        }

        // Smooth fade in and out
        float fadeIn = smoothstep(0.0, 0.2, time);
        float fadeOut = smoothstep(3.0, 2.0, time);
        float fade = fadeIn * fadeOut;

        // Brightness boost
        finalColor *= 1.6;

        // Output with alpha
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
    const variationLocation = gl.getUniformLocation(program, 'variation');

    // Random variation: 0 = burst, 1 = waterfall, 2 = spiral
    const animationVariation = Math.floor(Math.random() * 3);

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(variationLocation, animationVariation);

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

      // Duration - 3 seconds for varied animations
      if (currentTime < 3.0) {
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
    <div className={`game-view ${isWon ? 'completed' : ''}`}>
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
              <div className="stat-label-compact">{t('time')}</div>
            </div>
          </div>
          <div className="stat-compact">
            <div className="stat-icon">🎯</div>
            <div>
              <div className="stat-value-compact">{moves}</div>
              <div className="stat-label-compact">{t('moves')}</div>
            </div>
          </div>
          {pb && (
            <div className="stat-compact">
              <div className="stat-icon">🏆</div>
              <div>
                <div className="stat-value-compact">{formatTime(parseInt(pb))}</div>
                <div className="stat-label-compact">{t('best')}</div>
              </div>
            </div>
          )}
        </div>

        <div className="header-actions">
          <button className="tutorial-button" onClick={handleShowTutorialAgain}>
            ?
          </button>
          <button
            className="hint-button"
            onClick={handleShowHint}
            disabled={showHint || isWon || hintCount >= 2}
          >
            <img src={getAssetPath('UI/hint-btn.png')} alt={t('hint')} className="hint-icon" />
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
                  ${isDropTarget ? 'drop-target' : ''}
                  ${isWon ? 'puzzle-complete' : ''}`}
                style={{
                  backgroundImage: isHollowSlot ? 'none' : `url(${piece.image})`,
                  transform: isBeingDragged ? 'scale(1.15)' : `rotate(${piece.displayRotation}deg)`,
                  transition: isBeingDragged ? 'none' : undefined,
                  cursor: isWon ? 'default' : undefined,
                  pointerEvents: isWon ? 'none' : 'auto'
                }}
                data-current-index={piece.currentIndex}
                onClick={(e) => !isWon && handleRotate(piece.originalIndex, e)}
                draggable={isDraggable && !isWon}
                onDragStart={() => !isWon && handleDragStart(piece.currentIndex, index)}
                onDragOver={!isWon ? handleDragOver : undefined}
                onDrop={() => !isWon && handleDrop(piece.currentIndex)}
                onDragEnd={!isWon ? handleDragEnd : undefined}
                onTouchStart={(e) => !isWon && handleTouchStart(e, piece.currentIndex, index)}
                onTouchMove={!isWon ? handleTouchMove : undefined}
                onTouchEnd={!isWon ? handleTouchEnd : undefined}
              />
            );
          })}
        </div>

        <div className="stage-info-container">
          <h2 className="stage-title">{stage.english}</h2>
          {stage.chinese && (
            <div className="stage-pronunciation-detail">
              {getPronunciation(stage.chinese)?.jyutping || ''}
              <button
                className="audio-button"
                onClick={() => {
                  playCantonesePronunciation(stage.chinese, (error) => {
                    console.warn(error);
                    // Show pronunciation text if audio unavailable
                    const pronunciation = getPronunciation(stage.chinese);
                    if (pronunciation) {
                      alert(`Pronunciation: ${pronunciation.jyutping}\n${stage.english}`);
                    }
                  });
                }}
                title={`Hear pronunciation: ${stage.chinese}`}
              >
                🔊
              </button>
            </div>
          )}
        </div>

        {showHint && (
          <div className={`hint-overlay ${hintFadingOut ? 'hint-fade-out' : ''}`}>
            <div className="hint-image-container">
              <img src={stage.image} alt="Hint" className="hint-image" />
              <div className="hint-timer">{hintCountdown}</div>
            </div>
          </div>
        )}
      </div>

      {isWon && (
        <>
          {/* Win celebration video for last easy mode puzzle */}
          {stage.mode === 'easy' && isLastEasyPuzzle && (
            <video
              className="win-celebration-video"
              autoPlay
              muted={false}
              playsInline
              onEnded={(e) => {
                e.target.style.display = 'none';
              }}
              onError={(e) => {
                console.error('Win video failed to load');
                e.target.style.display = 'none';
              }}
            >
              <source src={getAssetPath('UI/Win-Easy.mp4')} type="video/mp4" />
            </video>
          )}

          {/* Win celebration video for last hard mode puzzle */}
          {stage.mode === 'hard' && isLastHardPuzzle && (
            <video
              className="win-celebration-video"
              autoPlay
              muted={false}
              playsInline
              onEnded={(e) => {
                e.target.style.display = 'none';
              }}
              onError={(e) => {
                console.error('Win Hard video failed to load');
                e.target.style.display = 'none';
              }}
            >
              <source src={getAssetPath('UI/Win-Hard.mp4')} type="video/mp4" />
            </video>
          )}

          {/* Bot character next to success popup */}
          <div className="bot-character bot-appear">
            <img
              src={getAssetPath('UI/bot.png')}
              alt="Bot Character"
              className="bot-image"
            />
          </div>

          <div className="win-modal">
            <div className="win-title">{t('puzzleComplete')}</div>
            <div className="win-stats">
              <div className="win-stat">
                <div className="win-stat-value">{formatTime(time)}</div>
                <div className="win-stat-label">{t('timeRemaining')}</div>
              </div>
              <div className="win-stat">
                <div className="win-stat-value">{moves}</div>
                <div className="win-stat-label">{t('moves')}</div>
              </div>
            </div>
            {isNewPB && <div className="pb-indicator">🏆 {t('newPersonalBest')}</div>}
            <button className="win-button" onClick={onComplete}>{t('continue')}</button>
          </div>
        </>
      )}

      {timeExpired && (
        <div className="time-expired-modal">
          <div className="time-expired-emoji">⏰</div>
          <div className="time-expired-title">{t('timesUp')}</div>
          <p className="time-expired-text">{t('timesUpMessage')}</p>
          <div className="time-expired-actions">
            <button className="restart-button" onClick={handleRestartPuzzle}>
              🔄 {t('restartPuzzle')}
            </button>
            <button className="back-button-modal" onClick={onComplete}>
              ← {t('backToMap')}
            </button>
          </div>
        </div>
      )}

      {moveLimitExceeded && (
        <div className="move-limit-modal">
          <div className="move-limit-icon-container">
            <img
              src={getAssetPath('UI/head-limitreach.png')}
              alt="Move Limit Reached"
              className="move-limit-icon"
            />
          </div>
          <div className="move-limit-title">Move Limit Reached!</div>
          <p className="move-limit-text">You've used all {moveLimit} moves. Try again!</p>
          <div className="move-limit-actions">
            <button className="move-limit-restart-button" onClick={handleRestartPuzzle}>
              🔄 {t('restartPuzzle')}
            </button>
            <button className="move-limit-back-button" onClick={onComplete}>
              ← {t('backToMap')}
            </button>
          </div>
        </div>
      )}

      {showTutorial && (
        <div className="tutorial-overlay" onClick={handleCloseTutorial}>
          <div className="tutorial-modal" onClick={e => e.stopPropagation()}>
            <div className="tutorial-header">
              <h2 className="tutorial-title">🎮 {t('howToPlay')}</h2>
              <button className="close-button" onClick={handleCloseTutorial}>×</button>
            </div>
            <div className="tutorial-content">
              <div className="tutorial-section">
                <div className="tutorial-icon">🔄</div>
                <h3>{t('rotateSwap')}</h3>
                <p>{t('rotateSwapDesc')}</p>
              </div>
              <div className="tutorial-section">
                <div className="tutorial-icon">🎯</div>
                <h3>{t('completeBeforeTime')}</h3>
                <p>{t('completeBeforeTimeDesc')}</p>
              </div>
              <div className="tutorial-section">
                <div className="tutorial-icon">💡</div>
                <h3>{t('useHints')}</h3>
                <p>{t('useHintsDesc')}</p>
              </div>
            </div>
            <button className="tutorial-start-button" onClick={handleCloseTutorial}>
              {t('letsPlay')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default GameView;
