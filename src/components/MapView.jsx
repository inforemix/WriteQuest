import { useState } from 'react';
import UploadModal from './UploadModal';
import '../styles/MapView.css';

function MapView({ mode, stages, isAdmin, onBack, onPlayStage, onDeleteStage, onStagesUpdate }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [draggedStageId, setDraggedStageId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);

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

  return (
    <div className="map-view">
      <div className="map-header">
        <button className="back-button" onClick={onBack}>
          <img src="/UI/back.png" alt="Back" className="back-icon" />
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
              <div className="progress-label">Progress</div>
              <div className="progress-numbers">
                {completedCount} / {totalStages} Stages
              </div>
            </div>
          </div>
        )}
        <div className="mode-title">
          {mode === 'easy' ? '🌟 Easy Mode' : '🔥 Hard Mode'}
        </div>
      </div>

      {isAdmin && (
        <button className="floating-add-button" onClick={handleAddStage}>
          + Add Stage
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

            {/* Desktop: Continuous background path */}
            <path
              className="path-background desktop-path"
              d={(() => {
                if (filteredStages.length < 2) return '';

                let pathData = '';
                filteredStages.forEach((stage, index) => {
                  const row = Math.floor(index / 3);
                  const col = index % 3;
                  const isReverseRow = row % 2 === 1;
                  const currentGridCol = isReverseRow ? (2 - col) : col;
                  const x = currentGridCol * 33.33 + 16.67;
                  const y = row * 160 + 80;

                  if (index === 0) {
                    pathData = `M ${x}% ${y}px`;
                  } else {
                    const prevRow = Math.floor((index - 1) / 3);
                    const prevCol = (index - 1) % 3;
                    const isPrevReverseRow = prevRow % 2 === 1;
                    const prevGridCol = isPrevReverseRow ? (2 - prevCol) : prevCol;
                    const prevX = prevGridCol * 33.33 + 16.67;
                    const prevY = prevRow * 160 + 80;

                    if (row !== prevRow) {
                      // Curved transition between rows
                      const midY = (prevY + y) / 2;
                      pathData += ` C ${prevX}% ${midY}px, ${x}% ${midY}px, ${x}% ${y}px`;
                    } else {
                      // Straight line in same row
                      pathData += ` L ${x}% ${y}px`;
                    }
                  }
                });
                return pathData;
              })()}
              filter="url(#path-shadow)"
            />

            {/* Desktop: Individual path segments */}
            {filteredStages.map((stage, index) => {
              if (index === filteredStages.length - 1) return null;

              const row = Math.floor(index / 3);
              const col = index % 3;
              const nextRow = Math.floor((index + 1) / 3);
              const nextCol = (index + 1) % 3;

              const isReverseRow = row % 2 === 1;
              const isNextReverseRow = nextRow % 2 === 1;

              // Calculate actual grid positions (accounting for zigzag)
              const currentGridCol = isReverseRow ? (2 - col) : col;
              const nextGridCol = isNextReverseRow ? (2 - nextCol) : nextCol;

              // Position calculation (percentage for desktop, fixed for mobile)
              const startX = currentGridCol * 33.33 + 16.67;
              const startY = row * 160 + 80; // Adjust for row height

              const endX = nextGridCol * 33.33 + 16.67;
              const endY = nextRow * 160 + 80;

              // Check if transitioning to next row
              const isRowTransition = nextRow !== row;

              if (isRowTransition) {
                // Curved path for row transitions
                const midY = (startY + endY) / 2;
                const controlX1 = startX;
                const controlY1 = midY;
                const controlX2 = endX;
                const controlY2 = midY;

                return (
                  <path
                    key={`path-${index}`}
                    className="path-line desktop-path"
                    d={`M ${startX}% ${startY}px C ${controlX1}% ${controlY1}px, ${controlX2}% ${controlY2}px, ${endX}% ${endY}px`}
                    filter="url(#path-shadow)"
                  />
                );
              } else {
                // Straight line for same row
                return (
                  <line
                    key={`path-${index}`}
                    className="path-line desktop-path"
                    x1={`${startX}%`}
                    y1={`${startY}px`}
                    x2={`${endX}%`}
                    y2={`${endY}px`}
                    filter="url(#path-shadow)"
                  />
                );
              }
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
            <h3>No Stages Yet</h3>
            <p>{isAdmin ? 'Click "+ Add" to create one!' : 'Ask admin to add stages!'}</p>
          </div>
        ) : (
          filteredStages.map((stage, index) => {
            const completed = isStageCompleted(stage.id);
            const isDragging = draggedStageId === stage.id;
            const isDragOver = dragOverStageId === stage.id;

            // Stage is unlocked if it's the first stage OR previous stage is completed OR user is admin
            const isPreviousCompleted = index === 0 || isStageCompleted(filteredStages[index - 1].id);
            const isUnlocked = isAdmin || isPreviousCompleted;

            // Calculate zigzag order for desktop (3 columns)
            const row = Math.floor(index / 3);
            const col = index % 3;
            const isReverseRow = row % 2 === 1;
            const gridOrder = isReverseRow ? (row * 3) + (2 - col) : index;

            return (
              <div
                key={stage.id}
                className={`stage-node ${isAdmin ? 'draggable' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''} ${!isUnlocked ? 'locked' : ''}`}
                style={{ order: gridOrder }}
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
                    onClick={() => isUnlocked ? onPlayStage(stage) : null}
                  >
                    <img src={stage.image} alt={stage.name} className="stage-preview" />
                  </div>
                </div>

                <div className="stage-label">{index + 1}. {stage.name}</div>

                {isAdmin && (
                  <div className="admin-controls">
                    <button className="delete-button" onClick={() => onDeleteStage(stage.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showUploadModal && (
        <UploadModal
          defaultMode={mode}
          onClose={() => setShowUploadModal(false)}
          onSave={handleSaveStage}
        />
      )}
    </div>
  );
}

export default MapView;
