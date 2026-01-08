import '../styles/StoryPage.css';
import { getAssetPath } from '../utils/assets';
import { soundManager } from '../utils/sounds';

function StoryPage({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleBackClick = () => {
    soundManager.playClick();
    onClose();
  };

  const handleSignUpClick = () => {
    soundManager.playClick();
    window.open('https://forms.gle/your-signup-form', '_blank');
  };

  // Extract video ID from YouTube URL
  const videoUrl = "https://youtu.be/JYpicNsur7s";
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const videoId = getYouTubeId(videoUrl);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="story-page">
      <div className="story-content">
        {/* Back Button */}
        <button className="story-back-btn" onClick={handleBackClick}>
          <img src={getAssetPath('UI/back.png')} alt="Back" className="story-back-icon" />
        </button>

        {/* YouTube Video */}
        <div className="story-video-container">
          <iframe
            src={embedUrl}
            title="Write Quest - Rewrite the Light | Music Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>

        {/* Logo and Story Section */}
        <div className="story-main-section">
          {/* Robot Mascot */}
          <img
            src={getAssetPath('UI/bot.png')}
            alt="Robot Mascot"
            className="story-mascot story-mascot-left"
          />

          <div className="story-center-content">
            {/* WriteQuest Logo */}
            <img
              src={getAssetPath('UI/title.png')}
              alt="Write Quest"
              className="story-logo"
            />

            {/* Story Text */}
            <p className="story-text">
              Once a living paradise, the island is now buried in smog,
              waste, and silence. Rivers clog, forests suffocate, and
              the sky no longer remembers its glow. When all seems
              lost, two young dragon siblings return from the
              stars—Zhongzhong (中中) and Wenwen (文文). Armed
              with wit, courage, and the power of puzzles, they set
              out to heal a broken world piece by piece. In Write
              Quest, every solved symbol restores life, and every
              choice brings the island one step closer to rebirth.
            </p>

            {/* Sign Up Button */}
            <button className="story-signup-btn" onClick={handleSignUpClick}>
              Sign up for update
            </button>
          </div>

          {/* Dragon Mascot */}
          <img
            src={getAssetPath('UI/dragon.png')}
            alt="Dragon Mascot"
            className="story-mascot story-mascot-right"
          />
        </div>

        {/* Bottom Illustration */}
        <div className="story-bottom-illustration">
          <img
            src={getAssetPath('UI/story-bottom.png')}
            alt="Island Scene"
            className="story-bottom-image"
          />
        </div>
      </div>
    </div>
  );
}

export default StoryPage;
