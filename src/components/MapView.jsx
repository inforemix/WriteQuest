import { useState, useEffect } from 'react';
import UploadModal from './UploadModal';
import { getAssetPath } from '../utils/assets';
import { useLanguage } from '../contexts/LanguageContext';
import { getPronunciation } from '../utils/cantoneseAudio';
import '../styles/MapView.css';

function MapView({ mode, stages, isAdmin, onBack, onPlayStage, onDeleteStage, onStagesUpdate, onModeChange }) {
  const { t } = useLanguage();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [draggedStageId, setDraggedStageId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [dronePosition, setDronePosition] = useState({ x: 50, y: 35 }); // Position as percentages (y: 35% is ~250px higher than center)
  const [isDraggingDrone, setIsDraggingDrone] = useState(false);
  const [droneDragOffset, setDroneDragOffset] = useState({ x: 0, y: 0 });
  const [hasBeenDragged, setHasBeenDragged] = useState(() => {
    return localStorage.getItem('droneHasBeenDragged') === 'true';
  });

  // Check if on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Set sky background CSS variable
    const skyBgUrl = getAssetPath('UI/sky-bg.jpg');
    document.documentElement.style.setProperty('--sky-bg', `url(${skyBgUrl})`);

    // Check if user has seen the tutorial (first-time experience)
    const hasSeenTutorial = localStorage.getItem('hasSeenMapTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('hasSeenMapTutorial', 'true');
    }

    // Restore scroll position after returning from puzzle
    const savedScrollPos = localStorage.getItem(`mapScrollPos-${mode}`);
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      setTimeout(() => {
        if (savedScrollPos) {
          // Restore saved position
          mapContainer.scrollLeft = parseInt(savedScrollPos);
        } else {
          // First time - start at the beginning (left)
          mapContainer.scrollLeft = 0;
        }
      }, 100);
    }
  }, [mode]);

  const filteredStages = stages.filter(s => s.mode === mode);

  // Calculate progress
  const completedCount = filteredStages.filter(stage => {
    const completedKey = `completed-${stage.id}`;
    return localStorage.getItem(completedKey) === 'true';
  }).length;

  const totalStages = filteredStages.length;
  const progressPercent = totalStages > 0 ? (completedCount / totalStages) * 100 : 0;

  const isStageCompleted = (stageId) => {
    const completedKey = `completed-${stageId}`;
    return localStorage.getItem(completedKey) === 'true';
  };

  // Save scroll position before switching modes
  const handleModeToggle = () => {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      localStorage.setItem(`mapScrollPos-${mode}`, mapContainer.scrollLeft.toString());
    }
    onModeChange(mode === 'easy' ? 'hard' : 'easy');
  };

  const handleAddStage = () => {
    setShowUploadModal(true);
  };

  const handleSaveStage = (stageData) => {
    const newStages = [...stages];

    if (stageData.applyToBoth) {
      // Create both Easy and Hard stages
      const easyStage = {
        id: Date.now(),
        name: stageData.name,
        image: stageData.image,
        mode: 'easy',
        difficulty: stageData.difficulty || 3
      };

      const hardStage = {
        id: Date.now() + 1,
        name: stageData.name,
        image: stageData.image,
        mode: 'hard',
        difficulty: stageData.difficulty || 3
      };

      newStages.push(easyStage, hardStage);
    } else {
      // Create single stage
      const newStage = {
        id: Date.now(),
        name: stageData.name,
        image: stageData.image,
        mode: stageData.mode,
        difficulty: stageData.difficulty || 3
      };
      newStages.push(newStage);
    }

    onStagesUpdate(newStages);
    setShowUploadModal(false);
  };

  const handleDragStart = (e, stageId) => {
    if (!isAdmin) return;
    setDraggedStageId(stageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    if (!isAdmin) return;
    e.preventDefault();
    setDragOverStageId(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStageId(null);
  };

  const handleDrop = (e, targetStageId) => {
    if (!isAdmin || !draggedStageId) return;
    e.preventDefault();

    if (draggedStageId === targetStageId) {
      setDraggedStageId(null);
      setDragOverStageId(null);
      return;
    }

    const newStages = [...stages];
    const draggedIndex = newStages.findIndex(s => s.id === draggedStageId);
    const targetIndex = newStages.findIndex(s => s.id === targetStageId);

    const [draggedStage] = newStages.splice(draggedIndex, 1);
    newStages.splice(targetIndex, 0, draggedStage);

    onStagesUpdate(newStages);
    setDraggedStageId(null);
    setDragOverStageId(null);
  };

  const handleDragEnd = () => {
    setDraggedStageId(null);
    setDragOverStageId(null);
  };

  // Drone drag handlers
  const handleDroneMouseDown = (e) => {
    e.preventDefault();
    setIsDraggingDrone(true);

    // Hide speech bubble after first drag
    if (!hasBeenDragged) {
      setHasBeenDragged(true);
      localStorage.setItem('droneHasBeenDragged', 'true');
    }

    // Use map-view (whole screen) for positioning
    const container = document.querySelector('.map-view');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + (dronePosition.x / 100) * rect.width);
    const offsetY = e.clientY - (rect.top + (dronePosition.y / 100) * rect.height);

    setDroneDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDroneMouseMove = (e) => {
    if (!isDraggingDrone) return;

    // Use map-view (whole screen) instead of map-container
    const container = document.querySelector('.map-view');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left - droneDragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - droneDragOffset.y) / rect.height) * 100;

    // Constrain to viewport bounds
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));

    setDronePosition({ x: constrainedX, y: constrainedY });
  };

  const handleDroneMouseUp = () => {
    setIsDraggingDrone(false);
  };

  useEffect(() => {
    if (isDraggingDrone) {
      window.addEventListener('mousemove', handleDroneMouseMove);
      window.addEventListener('mouseup', handleDroneMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleDroneMouseMove);
        window.removeEventListener('mouseup', handleDroneMouseUp);
      };
    }
  }, [isDraggingDrone, droneDragOffset]);

  // Handle mouse wheel, touch swipe, and drag for horizontal scrolling
  useEffect(() => {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;

    let isScrolling = false;
    let scrollVelocity = 0;
    let animationFrame = null;

    // Touch and drag state
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const smoothScroll = () => {
      if (Math.abs(scrollVelocity) > 0.5) {
        mapContainer.scrollLeft += scrollVelocity;
        scrollVelocity *= 0.85; // Momentum decay
        animationFrame = requestAnimationFrame(smoothScroll);
      } else {
        isScrolling = false;
        scrollVelocity = 0;
      }
    };

    // Mouse wheel handler
    const handleWheel = (e) => {
      // Only apply horizontal scroll on desktop
      if (window.innerWidth > 768) {
        e.preventDefault();

        // Amplify scroll speed for more responsive feel
        const scrollMultiplier = 2.5;
        scrollVelocity = e.deltaY * scrollMultiplier;

        if (!isScrolling) {
          isScrolling = true;
          animationFrame = requestAnimationFrame(smoothScroll);
        }
      }
    };

    // Mouse drag handlers
    const handleMouseDown = (e) => {
      // Only on desktop
      if (window.innerWidth > 768) {
        isDragging = true;
        mapContainer.style.cursor = 'grabbing';
        startX = e.pageX - mapContainer.offsetLeft;
        scrollLeft = mapContainer.scrollLeft;
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - mapContainer.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      mapContainer.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      isDragging = false;
      mapContainer.style.cursor = 'grab';
    };

    const handleMouseLeave = () => {
      isDragging = false;
      mapContainer.style.cursor = 'grab';
    };

    // Touch swipe handlers
    let touchStartX = 0;
    let touchScrollLeft = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = mapContainer.scrollLeft;
    };

    const handleTouchMove = (e) => {
      const x = e.touches[0].pageX;
      const walk = (touchStartX - x) * 1.5; // Scroll speed multiplier
      mapContainer.scrollLeft = touchScrollLeft + walk;
    };

    // Add event listeners
    mapContainer.addEventListener('wheel', handleWheel, { passive: false });
    mapContainer.addEventListener('mousedown', handleMouseDown);
    mapContainer.addEventListener('mousemove', handleMouseMove);
    mapContainer.addEventListener('mouseup', handleMouseUp);
    mapContainer.addEventListener('mouseleave', handleMouseLeave);
    mapContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    mapContainer.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Set cursor style
    if (window.innerWidth > 768) {
      mapContainer.style.cursor = 'grab';
    }

    return () => {
      mapContainer.removeEventListener('wheel', handleWheel);
      mapContainer.removeEventListener('mousedown', handleMouseDown);
      mapContainer.removeEventListener('mousemove', handleMouseMove);
      mapContainer.removeEventListener('mouseup', handleMouseUp);
      mapContainer.removeEventListener('mouseleave', handleMouseLeave);
      mapContainer.removeEventListener('touchstart', handleTouchStart);
      mapContainer.removeEventListener('touchmove', handleTouchMove);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div className="map-view">
      <div className="map-header">
        <button className="back-button" onClick={onBack}>
          <img src={getAssetPath('UI/back.png')} alt="Back" className="back-icon" />
        </button>
        {totalStages > 0 && (
          <div className="progress-unified">
            <div className="progress-circle">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="6"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - progressPercent / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 30 30)"
                />
                <text
                  x="30"
                  y="35"
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="700"
                  fill="#10b981"
                >
                  {Math.round(progressPercent)}%
                </text>
              </svg>
            </div>
            <div className="progress-info">
              <div className="progress-label">{mode === 'easy' ? t('easy') : t('hard')}</div>
              <div className="progress-numbers">
                {completedCount} / {totalStages} {t('stages')}
              </div>
            </div>
          </div>
        )}
        <img
          src={getAssetPath(
            isMobile
              ? (mode === 'easy' ? 'UI/mobile-hard.png' : 'UI/mobile-easy.png')
              : (mode === 'easy' ? 'UI/Light Wood-hard.png' : 'UI/Light Wood-easy.png')
          )}
          alt={mode === 'easy' ? t('switchToHard') : t('switchToEasy')}
          className="mode-toggle-button"
          onClick={handleModeToggle}
        />
      </div>

      {isAdmin && (
        <button className="floating-add-button" onClick={handleAddStage}>
          {t('addStage')}
        </button>
      )}

      <div className="map-container">
        {/* SVG Path Lines */}
        {filteredStages.length > 1 && (
          <svg className="map-path-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="path-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
              </filter>
            </defs>

            {/* Desktop: Zigzag curved line connecting stages */}
            {filteredStages.map((stage, index) => {
              if (index === filteredStages.length - 1) return null;

              const baseX = 60; // Starting X position
              const spacing = (80 + 120); // gap + circle width
              const zigzagAmplitude = 15; // Percentage for up/down movement

              // Current stage position
              const isEven = index % 2 === 0;
              const currentY = isEven ? (50 - zigzagAmplitude) : (50 + zigzagAmplitude);
              const currentX = baseX + (index * spacing);

              // Next stage position
              const isNextEven = (index + 1) % 2 === 0;
              const nextY = isNextEven ? (50 - zigzagAmplitude) : (50 + zigzagAmplitude);
              const nextX = baseX + ((index + 1) * spacing);

              // Control point for curved line
              const midX = (currentX + nextX) / 2;

              return (
                <path
                  key={`path-${index}`}
                  className="path-line desktop-path"
                  d={`M ${currentX} ${currentY}% Q ${midX} ${(currentY + nextY) / 2}% ${nextX} ${nextY}%`}
                  filter="url(#path-shadow)"
                />
              );
            })}

            {/* Mobile: Continuous background path */}
            <path
              className="path-background mobile-path"
              d={(() => {
                if (filteredStages.length < 2) return '';

                let pathData = '';
                filteredStages.forEach((stage, index) => {
                  const y = index * 160 + 80;

                  if (index === 0) {
                    pathData = `M 50% ${y}px`;
                  } else {
                    pathData += ` L 50% ${y}px`;
                  }
                });
                return pathData;
              })()}
              filter="url(#path-shadow)"
            />

            {/* Mobile: Individual vertical line segments */}
            {filteredStages.map((stage, index) => {
              if (index === filteredStages.length - 1) return null;

              const startY = index * 160 + 80;
              const endY = (index + 1) * 160 + 80;

              return (
                <line
                  key={`mobile-path-${index}`}
                  className="path-line mobile-path"
                  x1="50%"
                  y1={`${startY}px`}
                  x2="50%"
                  y2={`${endY}px`}
                  filter="url(#path-shadow)"
                />
              );
            })}
          </svg>
        )}

        {filteredStages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗺️</div>
            <h3>{t('noStagesYet')}</h3>
            <p>{isAdmin ? t('noStagesAdmin') : t('noStagesUser')}</p>
          </div>
        ) : (
          filteredStages.map((stage, index) => {
            const completed = isStageCompleted(stage.id);
            const isDragging = draggedStageId === stage.id;
            const isDragOver = dragOverStageId === stage.id;

            // Stage is unlocked if it's the first stage OR previous stage is completed OR user is admin
            const isPreviousCompleted = index === 0 || isStageCompleted(filteredStages[index - 1].id);
            const isUnlocked = isAdmin || isPreviousCompleted;

            // Determine if this is the center/highlighted stage (middle of current visible set)
            const isCenterStage = index === Math.floor(filteredStages.length / 2);

            return (
              <div
                key={stage.id}
                className={`stage-node ${isAdmin ? 'draggable' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''} ${!isUnlocked ? 'locked' : ''} ${isCenterStage ? 'center-stage' : ''}`}
                draggable={isAdmin}
                onDragStart={(e) => handleDragStart(e, stage.id)}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
                onDragEnd={handleDragEnd}
              >
                <div style={{ position: 'relative' }}>
                  {completed && (
                    <div className="completed-checkmark">✓</div>
                  )}

                  {!isUnlocked && (
                    <div className="locked-overlay">
                      <div className="lock-icon">🔒</div>
                    </div>
                  )}

                  <div
                    className={`stage-circle ${completed ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`}
                    onClick={() => {
                      if (isUnlocked) {
                        // Save scroll position before navigating to puzzle
                        const mapContainer = document.querySelector('.map-container');
                        if (mapContainer) {
                          localStorage.setItem(`mapScrollPos-${mode}`, mapContainer.scrollLeft.toString());
                        }
                        onPlayStage(stage);
                      }
                    }}
                  >
                    <img src={stage.image} alt={stage.name} className="stage-preview" />
                  </div>
                </div>

                <div className="stage-label">{index + 1}. {stage.english}</div>

                {isAdmin && (
                  <div className="admin-controls">
                    <button className="delete-button" onClick={() => onDeleteStage(stage.id)}>
                      🗑️ {t('delete')}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Drone Animation - draggable anywhere on the page (desktop only) */}
        {filteredStages.length > 0 && !isMobile && (
          <div
            className={`drone-container active ${isDraggingDrone ? 'dragging' : ''}`}
            style={{
              left: `${dronePosition.x}%`,
              top: `${dronePosition.y}%`,
              transform: isDraggingDrone ? 'translate(-50%, -50%) scale(1.05)' : 'translate(-50%, -50%)',
              cursor: isDraggingDrone ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleDroneMouseDown}
          >
            <img
              src={getAssetPath('UI/drone.png')}
              alt="Drone"
              className="drone-image"
              onError={(e) => {
                // Hide drone if image doesn't exist yet
                e.target.style.display = 'none';
              }}
            />
            {!hasBeenDragged && (
              <div className="drone-speech-bubble">
                drag me to scroll
              </div>
            )}
          </div>
        )}
      </div>

      {showUploadModal && (
        <UploadModal
          defaultMode={mode}
          onClose={() => setShowUploadModal(false)}
          onSave={handleSaveStage}
        />
      )}

      {showTutorial && (
        <div className="tutorial-overlay" onClick={() => setShowTutorial(false)}>
          <div className="tutorial-modal" onClick={e => e.stopPropagation()}>
            <div className="tutorial-header">
              <h2 className="tutorial-title">🎮 {t('howToPlay')}</h2>
              <button className="close-button" onClick={() => setShowTutorial(false)}>×</button>
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
            <button className="tutorial-start-button" onClick={() => setShowTutorial(false)}>
              {t('letsPlay')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;
