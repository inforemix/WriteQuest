# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Version: 1.1**

Write Quest is a React-based Chinese character learning puzzle game featuring map-based progression with two difficulty modes:
- **Basic Mode** (Easy: 2×2 grid): 20 fundamental Chinese characters (木 水 火 山 雨 日 土 月 人 天 大 女 田 心 男 石 光 兄 父 妹)
- **Advanced Mode** (Hard: 3×3 grid): 20 complex Chinese characters (海 春 夏 秋 冬 學 善 美 愛 危 風 星 快 毒 島 電 燒 寫 飛 慢)

The game uses Canvas API for image slicing, WebGL shaders for confetti effects, and localStorage for data persistence. Each puzzle features a Chinese character with its English translation, making it an educational tool for learning Chinese characters through visual puzzles.

## Development Commands

### Start Development Server
```bash
npm run dev
```
Starts Vite dev server on `http://localhost:3000` with auto-reload enabled.

### Build for Production
```bash
npm run build
```
Outputs optimized production build to `dist/` directory with sourcemaps.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally to verify before deployment.

### Lint Code
```bash
npm run lint
```
Runs ESLint on all `.js` and `.jsx` files in `src/`. Max warnings is set to 0.

## Architecture

### Application State Flow

The app uses a single-direction state flow managed in `App.jsx`:

1. **App.jsx** - Root component managing global state:
   - `screen`: Controls view navigation ('home', 'map', 'game')
   - `isAdmin`: Toggles admin mode for stage creation/deletion
   - `selectedMode`: Current difficulty ('easy' for Basic, 'hard' for Advanced)
   - `stages`: Array of all stages with Chinese characters, persisted to localStorage
   - `currentStage`: Currently playing Chinese character puzzle

2. **Component Hierarchy**:
   ```
   App
   ├─ HomePage (Basic/Advanced mode selection, admin toggle)
   ├─ MapView (character stage list, stage selection, progress tracking)
   └─ GameView (puzzle gameplay with Chinese characters, timer, moves, confetti)
   ```

### Data Persistence Strategy

All game data is stored in browser localStorage:

- **Stages**: `localStorage.getItem('stages')` - JSON array of stage objects
- **Personal Bests**: `pb-{mode}-{stageId}` - Best completion time per stage
- **Completed Stages**: `completed-{stageId}` - Boolean completion status
- **Tutorial**: `hasSeenTutorial` - One-time tutorial display flag

Stage objects have this structure:
```javascript
{
  id: number,                    // Unique ID (1001-1020 for Basic, 2001-2020 for Advanced)
  name: string,                  // Display name with Chinese and English (e.g., '木 (Wood)')
  chinese: string,               // Chinese character (e.g., '木')
  english: string,               // English translation (e.g., 'Wood')
  image: string,                 // Asset path to character puzzle image
  mode: 'easy' | 'hard',        // 'easy' for Basic, 'hard' for Advanced
  difficulty: 1 | 2 | 3          // Difficulty level within the mode
}
```

### Puzzle Mechanics (GameView.jsx)

The puzzle system works as follows:

1. **Image Slicing**: Canvas API splits uploaded image into grid pieces (2×2 or 3×3)
2. **Piece State**: Each piece tracks:
   - `originalIndex`: Where it started
   - `currentIndex`: Current position in grid
   - `rotation`: Rotation angle (0, 90, 180, 270)
   - `displayRotation`: Visual rotation (for animation)
3. **Scrambling**: Randomizes rotations and positions (hard mode only for positions)
4. **Win Condition**: All pieces must have `rotation === 0` and `currentIndex === originalIndex`
5. **Interactions**:
   - Click piece → Rotate 90° clockwise with particle effects
   - Drag & drop (both modes) → Swap two pieces

### Visual Effects

- **Particle System** (GameView.jsx:237-261): Creates 8 particles on rotation using CSS custom properties for animation
- **WebGL Confetti** (GameView.jsx:263-338): Fragment shader-based falling confetti using noise functions
- **Drag Feedback** (MapView.jsx): Visual indicators during drag-and-drop reordering (admin mode)
- **CSS Animations**: Cloud movement (HomePage), hover effects, transitions

### Admin Mode Features

When `isAdmin === true`:
- MapView shows "+ Add Stage" button
- Stages become draggable for reordering
- Delete buttons appear on each stage
- UploadModal allows creating stages with "Apply to Both" option (creates easy + hard variants)

## Common Tasks

### Adding a New Component

1. Create file in `src/components/`
2. Create matching CSS file in `src/styles/`
3. Import CSS at top of component: `import '../styles/ComponentName.css'`
4. Import and use in parent component (typically App.jsx)

### Modifying Puzzle Logic

Key functions in GameView.jsx:
- `initializePuzzle()` (line 45): Image slicing setup
- `scramblePuzzle()` (line 95): Initial randomization
- `handleRotate()` (line 134): Rotation + particle effects
- `checkWin()` (line 214): Victory condition
- `handleDragStart/Drop()` (line 158-188): Drag-and-drop piece swapping

### Changing Game Difficulty

Grid size is determined by `stage.mode`:
- **Basic Mode** (Easy): `gridSize = 2` (4 pieces) - 20 fundamental Chinese characters
- **Advanced Mode** (Hard): `gridSize = 3` (9 pieces) - 20 complex Chinese characters

Both modes support drag-and-drop piece swapping for enhanced gameplay.

### Character Sets (v0.5)

The game features 40 Chinese characters total:

**Basic Mode (20 characters):**
木 水 火 山 雨 日 土 月 人 天 大 女 田 心 男 石 光 兄 父 妹

**Advanced Mode (20 characters):**
海 春 夏 秋 冬 學 善 美 愛 危 風 星 快 毒 島 電 燒 寫 飛 慢

Each character has:
- A puzzle image in `/public/puzzles/easy/` or `/public/puzzles/hard/`
- Chinese character display
- English translation
- Difficulty level (1-3) within its mode

### localStorage Management

All localStorage operations should:
1. Use consistent key patterns (see Data Persistence Strategy above)
2. Stringify objects before saving: `JSON.stringify(data)`
3. Parse when reading: `JSON.parse(saved)`
4. Handle null/undefined gracefully

## Configuration Files

- **vite.config.js**: Dev server runs on port 3000, auto-opens browser, builds to `dist/`
- **.eslintrc.cjs**: React 18.2, prop-types disabled, react-refresh warnings enabled
- **package.json**: Uses ES modules (`"type": "module"`), React 18.2 dependencies

## File Size Considerations

This project was refactored from a single 2500-line HTML file. See `AVOIDING-MAX-LENGTH.md` for detailed strategies on:
- Keeping components under 300 lines
- Splitting large files
- Working effectively with Claude on modular codebases

When adding features, prefer creating new component files over expanding existing ones beyond ~400 lines.

## Image Handling

Images are stored as base64 data URLs in localStorage. When creating new stages:
1. User uploads image via UploadModal
2. FileReader converts to base64
3. Base64 stored in stage object
4. GameView converts base64 to Image, slices with Canvas API

This eliminates need for file hosting but limits total stages to localStorage quota (~5-10MB).

## Naming Conventions

- Components: PascalCase (HomePage.jsx)
- Styles: Match component name (HomePage.css)
- Functions: camelCase (handleModeSelect)
- Constants: UPPER_SNAKE_CASE if truly constant
- CSS classes: kebab-case (puzzle-piece)

## Version 0.5 Features

### Character-Based Learning System

Write Quest v0.5 introduces a comprehensive Chinese character learning system:

1. **Structured Progression**:
   - 20 Basic characters for beginners
   - 20 Advanced characters for intermediate learners
   - Each character includes visual puzzle and English translation

2. **Audio Support** (Planned):
   - Character pronunciation audio files in `/public/audio/`
   - MP3 format for each Chinese character
   - Playback on puzzle completion or hint button

3. **Enhanced Visual Experience**:
   - Scene fade animations (dark → ocean transitions)
   - Puzzle pieces disabled after successful completion
   - Mobile-optimized vertical layout
   - Confetti effects on puzzle solve

4. **Authentication** (Planned):
   - Guest mode for instant play
   - Google OAuth integration for progress tracking
   - Cloud save functionality for cross-device play

5. **Asset Organization**:
   - UI assets in `/public/UI/`
   - Character puzzles in `/public/puzzles/easy/` and `/public/puzzles/hard/`
   - Background music: `/public/WAqua-music.mp3`
   - Shop items in `/public/puzzles/shop/`

### Missing Assets

Some characters currently use placeholder images. The following puzzle images need to be added:

**Basic Mode (8 missing):**
- 大 (Big), 女 (Woman), 田 (Field), 心 (Heart), 男 (Man), 兄 (Elder Brother), 父 (Father), 妹 (Younger Sister)

**Advanced Mode (9 missing):**
- 學 (Study), 風 (Wind), 快 (Fast), 毒 (Poison), 電 (Electricity), 燒 (Burn), 寫 (Write), 飛 (Fly), 慢 (Slow)

When adding new character images, place them in:
- `/public/puzzles/easy/[english-name].jpg` for Basic characters
- `/public/puzzles/hard/[english-name].jpg` for Advanced characters
