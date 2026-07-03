// ============== AUDIO ENGINE ==============
class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
        this.init();
    }

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    enable() { this.enabled = true; }
    disable() { this.enabled = false; }

    playWarpSound() {
        if (!this.enabled || !this.audioContext) return;
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playClickSound() {
        if (!this.enabled || !this.audioContext) return;
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    }
}

// ============== REALISTIC STAR CLASS ==============
class RealisticStar {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width - canvas.width / 2;
        this.y = Math.random() * canvas.height - canvas.height / 2;
        this.z = Math.random() * canvas.width;
        this.originalZ = this.z;
        
        // Realistic star properties
        this.type = Math.random();
        if (this.type < 0.7) {
            // White/yellow stars (common)
            this.baseColor = { h: Math.random() * 60 + 30, s: 80, l: 70 };
            this.radius = Math.random() * 1.5 + 0.3;
            this.brightness = Math.random() * 0.6 + 0.4;
        } else if (this.type < 0.9) {
            // Blue/hot stars
            this.baseColor = { h: 200 + Math.random() * 40, s: 100, l: 60 };
            this.radius = Math.random() * 2 + 0.8;
            this.brightness = Math.random() * 0.5 + 0.5;
        } else {
            // Red/cool stars
            this.baseColor = { h: Math.random() * 30, s: 100, l: 50 };
            this.radius = Math.random() * 1.2 + 0.3;
            this.brightness = Math.random() * 0.4 + 0.3;
        }
        
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.scintillation = Math.random() * 0.02;
    }

    update(speed) {
        this.z -= speed;
        this.twinklePhase += this.twinkleSpeed;

        if (this.z <= 0) {
            this.z = this.originalZ;
            this.x = Math.random() * this.canvas.width - this.canvas.width / 2;
            this.y = Math.random() * this.canvas.height - this.canvas.height / 2;
        }
    }

    draw(ctx, centerX, centerY, fov) {
        const scale = fov / this.z;
        const x2d = centerX + this.x * scale;
        const y2d = centerY + this.y * scale;
        const radius = Math.max(this.radius * scale, 0.2);

        // Realistic twinkling
        const twinkleFactor = Math.cos(this.twinklePhase) * 0.3 + 0.7;
        const scintillation = Math.sin(this.twinklePhase * 0.5 + this.scintillation) * 0.1;
        const brightness = this.brightness * (twinkleFactor + scintillation);

        const { h, s, l } = this.baseColor;

        // Realistic star rendering with diffraction
        const glowGradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, radius * 4);
        glowGradient.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${brightness * 0.6})`);
        glowGradient.addColorStop(0.5, `hsla(${h}, ${s}%, ${l}%, ${brightness * 0.2})`);
        glowGradient.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x2d, y2d, radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Star core
        ctx.fillStyle = `hsl(${h}, ${s}%, ${Math.min(l + 15, 100)}%)`;
        ctx.beginPath();
        ctx.arc(x2d, y2d, radius, 0, Math.PI * 2);
        ctx.fill();

        // Star spike (diffraction)
        ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, ${brightness * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x2d - radius * 3, y2d);
        ctx.lineTo(x2d + radius * 3, y2d);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2d, y2d - radius * 3);
        ctx.lineTo(x2d, y2d + radius * 3);
        ctx.stroke();
    }
}

// ============== REALISTIC NEBULA ==============
class RealisticNebula {
    constructor(x, y, size, type = 'emission') {
        this.x = x;
        this.y = y;
        this.size = size;
        this.type = type;
        this.time = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.25 + 0.1;
        this.rotationSpeed = Math.random() * 0.001 + 0.0001;
        
        // Color based on type
        if (type === 'emission') {
            this.colors = [
                { r: 255, g: 100, b: 100 },  // Red emission
                { r: 255, g: 200, b: 100 }   // Orange
            ];
        } else if (type === 'reflection') {
            this.colors = [
                { r: 100, g: 150, b: 255 },  // Blue reflection
                { r: 120, g: 180, b: 255 }
            ];
        } else {
            this.colors = [
                { r: 150, g: 50, b: 100 },   // Dark nebula
                { r: 100, g: 30, b: 80 }
            ];
        }
    }

    update() {
        this.time += this.rotationSpeed;
        this.opacity = Math.sin(this.time) * 0.15 + 0.15;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Create multiple layers for realism
        for (let layer = 0; layer < 3; layer++) {
            const color = this.colors[layer % this.colors.length];
            const layerSize = this.size * (1 - layer * 0.2);
            const layerOpacity = 1 - (layer * 0.3);
            
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, layerSize
            );
            
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerOpacity * 0.8})`);
            gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${layerOpacity * 0.4})`);
            gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, layerSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// ============== DUST LANE ==============
class DustLane {
    constructor(canvas, angle) {
        this.canvas = canvas;
        this.angle = angle;
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.width = canvas.width * 0.6;
        this.height = 80;
        this.opacity = 0.3;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.angle);

        const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        gradient.addColorStop(0, 'rgba(20, 20, 30, 0)');
        gradient.addColorStop(0.3, 'rgba(20, 20, 30, 0.4)');
        gradient.addColorStop(0.5, 'rgba(10, 10, 20, 0.6)');
        gradient.addColorStop(0.7, 'rgba(20, 20, 30, 0.4)');
        gradient.addColorStop(1, 'rgba(20, 20, 30, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }
}

// ============== GALACTIC BULGE ==============
class GalacticBulge {
    constructor(canvas) {
        this.canvas = canvas;
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.time = 0;
    }

    update() {
        this.time += 0.002;
    }

    draw(ctx) {
        ctx.save();

        // Central bulge with realistic colors
        const bulgeGradient = ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 150
        );
        
        bulgeGradient.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
        bulgeGradient.addColorStop(0.3, 'rgba(255, 150, 80, 0.25)');
        bulgeGradient.addColorStop(0.6, 'rgba(200, 100, 50, 0.15)');
        bulgeGradient.addColorStop(1, 'rgba(100, 50, 20, 0)');

        ctx.fillStyle = bulgeGradient;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 150, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ============== GALACTIC ARM ==============
class GalacticArm {
    constructor(canvas, angle, color) {
        this.canvas = canvas;
        this.startAngle = angle;
        this.color = color;
        this.time = 0;
        this.starCount = 30;
        this.stars = [];
        this.regenerateStars();
    }

    regenerateStars() {
        this.stars = [];
        for (let i = 0; i < this.starCount; i++) {
            const distance = (Math.random() * 200 + 100);
            const angleOffset = Math.random() * 0.3;
            this.stars.push({
                distance,
                angleOffset,
                brightness: Math.random() * 0.5 + 0.3
            });
        }
    }

    draw(ctx, centerX, centerY) {
        ctx.save();

        // Draw arm structure
        const armGradient = ctx.createLinearGradient(
            centerX + Math.cos(this.startAngle) * 50,
            centerY + Math.sin(this.startAngle) * 50,
            centerX + Math.cos(this.startAngle) * 200,
            centerY + Math.sin(this.startAngle) * 200
        );

        const { r, g, b } = this.color;
        armGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.2)`);
        armGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.15)`);
        armGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        // Draw stars along arm
        this.stars.forEach(star => {
            const angle = this.startAngle + star.angleOffset;
            const x = centerX + Math.cos(angle) * star.distance;
            const y = centerY + Math.sin(angle) * star.distance;

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.brightness * 0.6})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

// ============== WARP TRAIL ==============
class WarpTrail {
    constructor(x, y, color, life = 30) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.radius = Math.random() * 3 + 2;
    }

    update() { this.life--; }

    draw(ctx) {
        const opacity = this.life / this.maxLife;
        ctx.fillStyle = `rgba(${this.color}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    isAlive() { return this.life > 0; }
}

// ============== MAIN SCREENSAVER CLASS ==============
class IntergalacticScreensaver {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.audio = new AudioEngine();
        
        this.settings = {
            theme: 'cyan',
            starMultiplier: 50,
            effectsIntensity: 50,
            enableNebula: true,
            enableBlackHole: true,
            enableAsteroids: true,
            enableAurora: true,
            soundEnabled: false,
            autoWarpDelay: 30
        };
        
        this.loadSettings();
        this.setupCanvas();
        
        // Galaxy elements
        this.stars = [];
        this.nebulas = [];
        this.dustLanes = [];
        this.galacticBulge = null;
        this.galacticArms = [];
        this.trails = [];
        
        this.speed = 5;
        this.targetSpeed = 5;
        this.maxSpeed = 5;
        this.warpLevel = 0;
        this.isPaused = false;
        this.isScreensaverMode = false;
        this.inactivityTimer = 0;
        this.distance = 0;
        this.orbitMode = false;
        
        this.fpsCounter = 0;
        this.lastFpsTime = Date.now();
        this.showFps = false;
        
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height / 2;
        this.targetMouseX = this.canvas.width / 2;
        this.targetMouseY = this.canvas.height / 2;
        
        this.initializeGalaxy();
        this.setupEventListeners();
        this.setupLoadingScreen();
        this.animate();
    }

    loadSettings() {
        const saved = localStorage.getItem('screensaverSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    saveSettings() {
        localStorage.setItem('screensaverSettings', JSON.stringify(this.settings));
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    initializeGalaxy() {
        // Create realistic stars
        const starCount = Math.floor((this.canvas.width * this.canvas.height) / (3000 / (this.settings.starMultiplier / 50)));
        this.stars = [];
        for (let i = 0; i < starCount; i++) {
            this.stars.push(new RealisticStar(this.canvas));
        }

        // Create nebulas
        this.nebulas = [];
        const nebulasCount = 8;
        for (let i = 0; i < nebulasCount; i++) {
            const types = ['emission', 'reflection', 'dark'];
            this.nebulas.push(new RealisticNebula(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                Math.random() * 150 + 80,
                types[Math.floor(Math.random() * types.length)]
            ));
        }

        // Create dust lanes
        this.dustLanes = [];
        for (let i = 0; i < 4; i++) {
            this.dustLanes.push(new DustLane(this.canvas, (Math.PI * 2 / 4) * i));
        }

        // Galactic bulge
        this.galacticBulge = new GalacticBulge(this.canvas);

        // Galactic arms
        this.galacticArms = [];
        const armColors = [
            { r: 200, g: 100, b: 255 },
            { r: 100, g: 200, b: 255 },
            { r: 255, g: 150, b: 100 },
            { r: 100, g: 255, b: 200 }
        ];
        
        for (let i = 0; i < 4; i++) {
            this.galacticArms.push(new GalacticArm(
                this.canvas,
                (Math.PI * 2 / 4) * i,
                armColors[i]
            ));
        }
    }

    setupLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                }, 500);
            }
            const progressBar = document.getElementById('loadingProgress');
            const progressText = document.getElementById('loadingText');
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressText) progressText.textContent = Math.floor(progress) + '%';
        }, 100);
    }

    setupEventListeners() {
        const warpBtn = document.getElementById('warpButton');
        const pauseBtn = document.getElementById('pauseButton');
        const resetBtn = document.getElementById('resetButton');
        const settingsBtn = document.getElementById('settingsButton');
        const screensaverBtn = document.getElementById('screensaverButton');
        const fpsBtn = document.getElementById('fpsButton');
        const closeSettings = document.getElementById('closeSettings');

        if (warpBtn) warpBtn.addEventListener('click', () => this.engageWarp());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.openSettings());
        if (screensaverBtn) screensaverBtn.addEventListener('click', () => this.toggleScreensaverMode());
        if (fpsBtn) fpsBtn.addEventListener('click', () => this.toggleFpsCounter());
        if (closeSettings) closeSettings.addEventListener('click', () => this.closeSettings());

        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.saveSettings();
            });
        }

        const starCountInput = document.getElementById('starCountInput');
        if (starCountInput) {
            starCountInput.addEventListener('input', (e) => {
                this.settings.starMultiplier = parseInt(e.target.value);
                const slider = document.getElementById('starCountSlider');
                if (slider) slider.textContent = e.target.value;
                this.initializeGalaxy();
                this.saveSettings();
            });
        }

        const effectsIntensityInput = document.getElementById('effectsIntensityInput');
        if (effectsIntensityInput) {
            effectsIntensityInput.addEventListener('input', (e) => {
                this.settings.effectsIntensity = parseInt(e.target.value);
                const intensity = document.getElementById('effectsIntensity');
                if (intensity) intensity.textContent = e.target.value;
                this.saveSettings();
            });
        }

        const enableNebula = document.getElementById('enableNebula');
        if (enableNebula) {
            enableNebula.addEventListener('change', (e) => {
                this.settings.enableNebula = e.target.checked;
                this.saveSettings();
            });
        }

        const soundEnabled = document.getElementById('soundEnabled');
        if (soundEnabled) {
            soundEnabled.addEventListener('change', (e) => {
                this.settings.soundEnabled = e.target.checked;
                if (e.target.checked) {
                    this.audio.enable();
                } else {
                    this.audio.disable();
                }
                this.saveSettings();
            });
        }

        document.addEventListener('keydown', (e) => {
            this.inactivityTimer = 0;
            
            if (e.key === 'w' || e.key === 'W') this.engageWarp();
            if (e.key === ' ') { this.togglePause(); e.preventDefault(); }
            if (e.key === 'r' || e.key === 'R') this.reset();
            if (e.key === 't' || e.key === 'T') this.nextTheme();
            if (e.key === 'o' || e.key === 'O') this.toggleOrbitMode();
            if (e.key === 's' || e.key === 'S') this.takeScreenshot();
        });

        document.addEventListener('mousemove', (e) => {
            this.inactivityTimer = 0;
            this.targetMouseX = e.clientX;
            this.targetMouseY = e.clientY;
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            for (let i = 0; i < 30; i++) {
                const angle = (Math.PI * 2 * i) / 30;
                this.trails.push(new WarpTrail(
                    x,
                    y,
                    `0, 255, 200`,
                    40 + Math.random() * 20
                ));
            }
            
            this.audio.playClickSound();
        });
    }

    engageWarp() {
        if (this.warpLevel < 5) {
            this.warpLevel++;
            this.targetSpeed = 5 + (this.warpLevel * 9);
            this.createWarpEffect();
            this.audio.playWarpSound();
        }
    }

    createWarpEffect() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2;
        
        const intensity = this.settings.effectsIntensity / 50;
        const count = Math.floor(20 * intensity);
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            this.trails.push(new WarpTrail(x, y, `0, 255, ${100 + this.warpLevel * 30}`, 40));
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseButton');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? '▶ RESUME' : '⏸ PAUSE';
            pauseBtn.style.background = this.isPaused 
                ? 'linear-gradient(135deg, #00ff00, #00cc00)' 
                : 'linear-gradient(135deg, #ff6600, #ff3300)';
        }
    }

    toggleScreensaverMode() {
        this.isScreensaverMode = !this.isScreensaverMode;
        const btn = document.getElementById('screensaverButton');
        if (btn) {
            btn.textContent = this.isScreensaverMode ? '🖥 MODE: ON' : '🖥 SCREENSAVER MODE';
            btn.style.background = this.isScreensaverMode 
                ? 'linear-gradient(135deg, #00ff00, #00cc00)' 
                : 'linear-gradient(135deg, #ff00ff, #ff0099)';
        }
    }

    toggleFpsCounter() {
        this.showFps = !this.showFps;
        const fps = document.getElementById('fpsDisplay');
        if (fps) fps.style.display = this.showFps ? 'block' : 'none';
    }

    nextTheme() {
        const themes = ['cyan', 'purple', 'green', 'rainbow', 'red'];
        const currentIndex = themes.indexOf(this.settings.theme);
        this.settings.theme = themes[(currentIndex + 1) % themes.length];
        const select = document.getElementById('themeSelect');
        if (select) select.value = this.settings.theme;
        this.saveSettings();
    }

    toggleOrbitMode() {
        this.orbitMode = !this.orbitMode;
        if (this.orbitMode) {
            this.targetSpeed = 5;
            this.warpLevel = 0;
        }
    }

    takeScreenshot() {
        const link = document.createElement('a');
        link.href = this.canvas.toDataURL('image/png');
        link.download = `screensaver_${Date.now()}.png`;
        link.click();
        
        const notif = document.getElementById('screenshotNotif');
        if (notif) {
            notif.classList.remove('hidden');
            setTimeout(() => notif.classList.add('hidden'), 2000);
        }
    }

    openSettings() {
        const panel = document.getElementById('settingsPanel');
        if (panel) panel.classList.remove('hidden');
    }

    closeSettings() {
        const panel = document.getElementById('settingsPanel');
        if (panel) panel.classList.add('hidden');
    }

    reset() {
        this.speed = 5;
        this.targetSpeed = 5;
        this.warpLevel = 0;
        this.isPaused = false;
        this.trails = [];
        this.distance = 0;
        this.orbitMode = false;
        this.inactivityTimer = 0;
        
        const pauseBtn = document.getElementById('pauseButton');
        if (pauseBtn) {
            pauseBtn.textContent = '⏸ PAUSE';
            pauseBtn.style.background = 'linear-gradient(135deg, #ff6600, #ff3300)';
        }
        
        this.initializeGalaxy();
    }

    updateStats() {
        const speedValue = document.getElementById('speedValue');
        if (speedValue) speedValue.textContent = this.speed.toFixed(1) + 'x';
        
        const starCount = document.getElementById('starCount');
        if (starCount) starCount.textContent = this.stars.length;
        
        const warpLevel = document.getElementById('warpLevel');
        if (warpLevel) warpLevel.textContent = this.warpLevel;
        
        const distance = document.getElementById('distance');
        if (distance) distance.textContent = (this.distance / 1000).toFixed(1) + ' ly';
        
        const maxSpeed = document.getElementById('maxSpeed');
        if (maxSpeed) maxSpeed.textContent = this.maxSpeed.toFixed(1) + 'x';
    }

    update() {
        if (this.isScreensaverMode) {
            this.inactivityTimer++;
            if (this.inactivityTimer > this.settings.autoWarpDelay * 60) {
                this.inactivityTimer = 0;
                if (this.warpLevel < 5) {
                    this.engageWarp();
                }
            }
        }

        if (!this.isPaused) {
            this.speed += (this.targetSpeed - this.speed) * 0.05;

            if (this.speed > this.maxSpeed) {
                this.maxSpeed = this.speed;
            }

            if (this.warpLevel > 0 && Math.random() < 0.02) {
                this.warpLevel = Math.max(0, this.warpLevel - 0.5);
                this.targetSpeed = 5 + (Math.max(0, this.warpLevel) * 9);
            }

            this.distance += this.speed;

            this.stars.forEach(star => star.update(this.speed));
            this.nebulas.forEach(nebula => nebula.update());
            this.galacticBulge.update();

            this.trails = this.trails.filter(trail => {
                trail.update();
                return trail.isAlive();
            });

            if (this.speed > 15) {
                const centerX = this.canvas.width / 2;
                const centerY = this.canvas.height / 2;
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 300 + 100;
                
                this.trails.push(new WarpTrail(
                    centerX + Math.cos(angle) * distance,
                    centerY + Math.sin(angle) * distance,
                    `${100 + this.warpLevel * 30}, 200, 255`,
                    20
                ));
            }
        }

        this.mouseX += (this.targetMouseX - this.mouseX) * 0.1;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.1;

        this.fpsCounter++;
        const now = Date.now();
        if (now - this.lastFpsTime >= 1000) {
            const fpsValue = document.getElementById('fpsValue');
            if (fpsValue) fpsValue.textContent = this.fpsCounter;
            this.fpsCounter = 0;
            this.lastFpsTime = now;
        }

        this.updateStats();
    }

    draw() {
        // Deep space background
        this.ctx.fillStyle = '#000005';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        if (this.orbitMode) {
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(Date.now() * 0.00005);
            this.ctx.translate(-centerX, -centerY);
        }

        // Draw galaxy structure
        this.galacticBulge.draw(this.ctx);
        this.galacticArms.forEach(arm => arm.draw(this.ctx, centerX, centerY));
        
        // Draw dust lanes
        this.dustLanes.forEach(lane => lane.draw(this.ctx));

        // Draw nebulas
        if (this.settings.enableNebula) {
            this.nebulas.forEach(nebula => nebula.draw(this.ctx));
        }

        // Draw stars
        this.stars.forEach(star => star.draw(this.ctx, centerX, centerY, 300));

        // Draw trails
        this.trails.forEach(trail => trail.draw(this.ctx));

        if (this.orbitMode) {
            this.ctx.restore();
        }

        if (this.warpLevel > 0) {
            this.drawWarpTunnel();
        }

        this.drawCrosshair();
        this.drawMouseEffect();
    }

    drawWarpTunnel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const intensity = this.settings.effectsIntensity / 50;
        for (let i = 0; i < 5; i++) {
            const size = (100 * (5 - i)) * (1 + this.warpLevel * 0.5);
            const opacity = (0.15 - (i * 0.03)) * intensity;
            
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.rect(
                centerX - size / 2,
                centerY - size / 2,
                size,
                size
            );
            this.ctx.stroke();
        }
    }

    drawCrosshair() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 30, centerY);
        this.ctx.lineTo(centerX + 30, centerY);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 30);
        this.ctx.lineTo(centerX, centerY + 30);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawMouseEffect() {
        const radius = 20;
        const gradient = this.ctx.createRadialGradient(
            this.mouseX, this.mouseY, 0,
            this.mouseX, this.mouseY, radius
        );
        
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new IntergalacticScreensaver();
});
