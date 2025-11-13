import { useState, useRef } from 'react';
import '../styles/Modal.css';

function UploadModal({ defaultMode, onClose, onSave }) {
  const [stageName, setStageName] = useState('');
  const [selectedMode, setSelectedMode] = useState(defaultMode);
  const [image, setImage] = useState(null);
  const [applyToBoth, setApplyToBoth] = useState(false);
  const [difficulty, setDifficulty] = useState(3); // 1-5 star rating
  const fileInputRef = useRef();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!stageName || !image) {
      alert('Please fill in all fields');
      return;
    }

    onSave({
      name: stageName,
      image: image,
      mode: selectedMode,
      applyToBoth: applyToBoth,
      difficulty: difficulty
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Stage</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="form-group">
          <label className="form-label">Stage Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter stage name..."
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
          />
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="applyToBoth"
            className="checkbox-input"
            checked={applyToBoth}
            onChange={(e) => setApplyToBoth(e.target.checked)}
          />
          <label htmlFor="applyToBoth" className="checkbox-label">
            ✨ Apply to both Easy & Hard
          </label>
        </div>

        {!applyToBoth && (
          <div className="form-group">
            <label className="form-label">Mode</label>
            <select
              className="form-select"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
            >
              <option value="easy">Easy (2×2)</option>
              <option value="hard">Hard (3×3)</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Difficulty Rating</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= difficulty ? 'active' : ''}`}
                onClick={() => setDifficulty(star)}
              >
                ★
              </span>
            ))}
          </div>
          <div className="difficulty-label">
            {difficulty === 1 && 'Very Easy'}
            {difficulty === 2 && 'Easy'}
            {difficulty === 3 && 'Medium'}
            {difficulty === 4 && 'Hard'}
            {difficulty === 5 && 'Very Hard'}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Upload Image</label>
          <div className="file-input-wrapper">
            <div className="file-input-button" onClick={() => fileInputRef.current?.click()}>
              {image ? '✓ Image Selected' : '📁 Choose Image'}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="file-input"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          {image && <img src={image} alt="Preview" className="image-preview" />}
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="save-button" onClick={handleSave} disabled={!stageName || !image}>
            Save Stage
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
