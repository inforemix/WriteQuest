# Missing Assets for v0.5

This document lists the assets that need to be added to complete the v0.5 features.

## UI Assets Needed (/public/UI/)

### Background Images
- **sky-bg.jpg** - Sky background for the map view
- **polluted-bg.jpg** - Dark/polluted ocean background for game view (before puzzle completion)
- **clean-bg.jpg** - Clean/bright background for game view (after puzzle completion)

### Drone Animation
- **drone.png** - Drone image that appears when hovering over map stages (transparent PNG recommended)

## Audio Files Needed (/public/audio/)

All audio files should be in MP3 format with clear Cantonese pronunciation.

### Basic Mode Characters (20 files)
1. `muk6.mp3` - 木 (Wood)
2. `seoi2.mp3` - 水 (Water)
3. `fo2.mp3` - 火 (Fire)
4. `saan1.mp3` - 山 (Mountain)
5. `jyu5.mp3` - 雨 (Rain)
6. `jat6.mp3` - 日 (Sun)
7. `tou2.mp3` - 土 (Ground)
8. `jyut6.mp3` - 月 (Moon)
9. `jan4.mp3` - 人 (Human)
10. `tin1.mp3` - 天 (Sky)
11. `daai6.mp3` - 大 (Big)
12. `neoi5.mp3` - 女 (Woman)
13. `tin4.mp3` - 田 (Field)
14. `sam1.mp3` - 心 (Heart)
15. `naam4.mp3` - 男 (Man)
16. `sek6.mp3` - 石 (Rock)
17. `gwong1.mp3` - 光 (Light)
18. `hing1.mp3` - 兄 (Elder Brother)
19. `fu6.mp3` - 父 (Father)
20. `mui6.mp3` - 妹 (Younger Sister)

### Advanced Mode Characters (20 files)
1. `hoi2.mp3` - 海 (Ocean)
2. `ceon1.mp3` - 春 (Spring)
3. `haa6.mp3` - 夏 (Summer)
4. `cau1.mp3` - 秋 (Autumn)
5. `dung1.mp3` - 冬 (Winter)
6. `hok6.mp3` - 學 (Study)
7. `sin6.mp3` - 善 (Kindness)
8. `mei5.mp3` - 美 (Beauty)
9. `oi3.mp3` - 愛 (Love)
10. `ngai4.mp3` - 危 (Danger)
11. `fung1.mp3` - 風 (Wind)
12. `sing1.mp3` - 星 (Star)
13. `faai3.mp3` - 快 (Fast)
14. `duk6.mp3` - 毒 (Poison)
15. `dou2.mp3` - 島 (Island)
16. `din6.mp3` - 電 (Electricity)
17. `siu1.mp3` - 燒 (Burn)
18. `se2.mp3` - 寫 (Write)
19. `fei1.mp3` - 飛 (Fly)
20. `maan6.mp3` - 慢 (Slow)

## Puzzle Images Still Needed

### Basic Mode (8 missing)
Add these to `/public/puzzles/easy/`:
- `big.jpg` - 大 (Big)
- `woman.jpg` - 女 (Woman)
- `field.jpg` - 田 (Field)
- `heart.jpg` - 心 (Heart)
- `man.jpg` - 男 (Man)
- `elder-brother.jpg` - 兄 (Elder Brother)
- `father.jpg` - 父 (Father)
- `younger-sister.jpg` - 妹 (Younger Sister)

### Advanced Mode (9 missing)
Add these to `/public/puzzles/hard/`:
- `study.jpg` - 學 (Study)
- `wind.jpg` - 風 (Wind)
- `fast.jpg` - 快 (Fast)
- `poison.jpg` - 毒 (Poison)
- `electricity.jpg` - 電 (Electricity)
- `burn.jpg` - 燒 (Burn)
- `write.jpg` - 寫 (Write)
- `fly.jpg` - 飛 (Fly)
- `slow.jpg` - 慢 (Slow)

## Audio Source
Audio files can be generated or downloaded from:
- **Recommended**: https://www.cantonesetools.org/en/cantonese-text-to-sound
- Search for each character and download the pronunciation audio
- Save as MP3 with the Jyutping filename (e.g., `muk6.mp3`)

## Implementation Status

### ✅ Completed
- Sky background CSS variable support
- Polluted/clean background transitions
- Drone hover animation CSS
- Cantonese audio utility with pronunciation data
- Audio player button in game view
- Vertical map layout for mobile

### ⏳ Pending Asset Upload
Once assets are uploaded to the appropriate directories, the features will work automatically:
- Map will use sky-bg.jpg if available
- Game will transition from polluted-bg.jpg to clean-bg.jpg on puzzle completion
- Drone will appear on stage hover if drone.png is available
- Audio will play when clicking the speaker button if MP3 files are available

## Notes
- All features have fallbacks if assets are missing
- The game will continue to work with default backgrounds and without audio
- Error handling is in place for missing assets
