# File Organization

## Public Assets Structure

### /public/UI/ - User Interface Assets
- `title.png` - Game title logo
- `Light Wood-easy.png` - Easy mode button
- `Light Wood-hard.png` - Hard mode button
- `setting.png` - Settings icon
- `Home-graphic.jpg` - Desktop home background

### /public/puzzles/ - Puzzle Images
- `Fire.jpg`
- `ground.jpg`
- `human.jpg`
- `moon.jpg`
- `mountain.jpg`
- `rain.jpg`
- `sky.jpg`
- `sun.jpg`
- `water.jpg`
- `wood.jpg`

## Updated File References

### src/components/HomePage.jsx
- `/UI/title.png` - Main title
- `/UI/Light Wood-easy.png` - Easy button
- `/UI/Light Wood-hard.png` - Hard button
- `/UI/setting.png` - Settings button

### src/styles/HomePage.css
- `/UI/Home-graphic.jpg` - Desktop background (1024px+)
- `/UI/mobile-graphic.jpg` - Mobile/Tablet background (max 1023px)

## User-Uploaded Puzzles
Puzzle images can be uploaded through the admin interface and are stored as base64 data URLs in localStorage.
