# 🚀 Intergalactic Screensaver

An immersive, interactive screensaver that simulates flying through space with a fully functional warp drive system.

## Features

✨ **Dynamic Star Field** - Thousands of twinkling stars with realistic perspective projection
⚡ **Warp Drive System** - Accelerate through space with 5 warp levels
🎮 **Interactive Controls** - Buttons and keyboard shortcuts
📊 **Real-time Statistics** - Monitor speed, star count, and warp level
🌀 **Visual Effects** - Warp tunnel, trails, glow effects, and twinkling
🎨 **Cosmic Aesthetics** - Cyan and blue color scheme with procedural generation

## Controls

### Mouse/Touch
- **⚡ ENGAGE WARP DRIVE** - Increase warp level (max 5)
- **⏸ PAUSE** - Pause/resume animation
- **🔄 RESET** - Return to initial state

### Keyboard
- **W** - Engage warp drive
- **Space** - Pause/resume
- **R** - Reset

## How It Works

### Perspective Projection
Stars are positioned in 3D space and projected to 2D using perspective mathematics. As you move forward, closer stars move faster and appear larger.

### Warp System
- Each warp level increases speed by 9x base speed
- Visual effects intensify with each level
- Warp gradually decreases if not actively engaged
- Max warp level: 5 (50x base speed)

### Star Generation
- Stars are procedurally generated at runtime
- Each star has:
  - Position (x, y, z)
  - Size and brightness
  - Twinkling effect
  - Color (cyan to blue spectrum)
  - Glow halo

### Trail Effects
- Warp engagement creates radial trail effects
- High-speed travel leaves glowing particles
- Trails fade naturally over time

## Performance

- Optimized canvas rendering
- Responsive design (works on mobile)
- 60 FPS target with fallback for lower-end devices
- Efficient star regeneration system

## Browser Compatibility

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Any modern browser with HTML5 Canvas support

## Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Enjoy the cosmic journey!

## Optional: Deploy Online

1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Access via `https://yourusername.github.io/intergalactic-screensaver`

## Customization

Edit `script.js` to modify:
- `maxSpeed` - Maximum warp drive speed
- `starCount` calculation - Number of stars
- `warpLevel` maximum - How many warp levels available
- Colors and visual effects

## License

Free to use and modify for personal or commercial projects.

---

**Happy space traveling! 🌌**
