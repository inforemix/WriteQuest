# 🎮 Puzzle Quest - Map Edition

A beautiful, interactive puzzle game built with React featuring map-based progression, multiple difficulty levels, and stunning visual effects.

![Puzzle Quest](https://img.shields.io/badge/React-18.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎯 Core Gameplay
- **Two Difficulty Modes**
  - **Easy Mode** (2×2 grid): Perfect for beginners
  - **Hard Mode** (3×3 grid): Advanced puzzle-solving with drag-and-drop

### 🗺️ Map-Based Progression
- Beautiful animated map interface
- Multiple stages per difficulty level
- Track your progress across different puzzle challenges

### 👨‍💼 Admin Mode
- Toggle between Player and Admin modes
- Create custom stages with your own images
- Delete stages with ease
- Apply stages to both difficulty levels simultaneously

### 🎨 Visual Effects
- Animated clouds on the home screen
- Particle effects on piece rotation
- WebGL-powered confetti celebration on puzzle completion
- Smooth transitions and animations throughout

### 📊 Game Features
- **Timer**: Track how long it takes to complete each puzzle
- **Move Counter**: See how efficiently you solve puzzles
- **Personal Best**: Automatically saves and displays your best time for each stage
- **Persistent Storage**: All stages and records saved in browser localStorage

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd write2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🛠️ Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check code quality

## 🚀 Deployment to GitHub Pages

This project is configured to automatically deploy to GitHub Pages when you push to the main branch.

### Setup Instructions:

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

2. **Push your code:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

3. **Wait for deployment:**
   - The GitHub Action will automatically build and deploy your app
   - You can monitor the progress in the **Actions** tab
   - Once complete, your app will be available at: `https://<your-username>.github.io/WriteAqua/`

### Manual Deployment:

You can also trigger a deployment manually:
- Go to the **Actions** tab in your repository
- Select the **Deploy to GitHub Pages** workflow
- Click **Run workflow**

### Configuration Notes:

- The app is configured with `base: '/WriteAqua/'` in `vite.config.js`
- If you rename the repository, update the `base` path accordingly
- The workflow is located at `.github/workflows/deploy.yml`

## 📁 Project Structure

```
write2/
├── src/
│   ├── components/
│   │   ├── HomePage.jsx      # Home screen with mode selection
│   │   ├── MapView.jsx        # Stage map display
│   │   ├── GameView.jsx       # Puzzle gameplay
│   │   └── UploadModal.jsx    # Stage creation modal
│   ├── styles/
│   │   ├── App.css            # Global styles
│   │   ├── HomePage.css       # Home page styles
│   │   ├── MapView.css        # Map view styles
│   │   ├── GameView.css       # Game view styles
│   │   └── Modal.css          # Modal styles
│   ├── App.jsx                # Main application component
│   └── main.jsx               # Application entry point
├── public/                    # Static assets
├── index.html                 # HTML entry point
├── vite.config.js            # Vite configuration
├── package.json              # Project dependencies
└── README.md                 # This file
```

## 🎮 How to Play

### Player Mode
1. **Select Difficulty**: Choose between Easy (2×2) or Hard (3×3) mode
2. **Choose a Stage**: Select a stage from the map
3. **Solve the Puzzle**:
   - **Easy Mode**: Click pieces to rotate them into the correct position
   - **Hard Mode**: Click to rotate AND drag pieces to swap positions
4. **Complete**: Match all pieces to their original positions with correct rotation
5. **Celebrate**: Enjoy the confetti animation and see your stats!

### Admin Mode
1. Click the **Admin Mode** button in the top-right corner
2. Navigate to a difficulty level
3. Click **+ Add Stage** to create a new puzzle
4. Upload an image and name your stage
5. Optionally, apply the stage to both difficulty levels
6. Click **Save Stage** to add it to the map

## 🔧 Technical Details

### Built With
- **React 18.2** - UI library
- **Vite 5.0** - Build tool and dev server
- **WebGL** - Confetti effects
- **Canvas API** - Image slicing for puzzle pieces
- **CSS3** - Animations and styling
- **localStorage** - Data persistence

### Key Features Implementation
- **Puzzle Logic**: Dynamic grid system with rotation and position tracking
- **Image Processing**: Canvas-based image slicing for puzzle pieces
- **State Management**: React hooks for game state
- **Drag and Drop**: Native HTML5 drag-and-drop API
- **Animations**: CSS keyframes and transitions
- **WebGL Shaders**: Custom fragment shader for confetti effect

## 🌟 Highlights

- **Production-Ready**: Optimized build with Vite
- **Modular Architecture**: Cleanly separated components
- **Responsive Design**: Works on various screen sizes
- **Performance**: Efficient rendering and state updates
- **User Experience**: Smooth animations and visual feedback
- **Accessibility**: Semantic HTML and keyboard support

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 🎯 Future Enhancements

- [ ] Add sound effects
- [ ] Implement difficulty ratings for stages
- [ ] Add hints system
- [ ] Multiplayer mode
- [ ] Leaderboards
- [ ] More visual themes
- [ ] Mobile app version

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Enjoy playing Puzzle Quest!** 🎉
