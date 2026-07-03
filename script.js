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

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

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

// ============== STAR CLASS ==============
class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width - canvas.width / 2;
        this.y = Math.random() * canvas.height - canvas.height / 2;
        this.z = Math.random() * canvas.width;
        this.originalZ = this.z;
        this.radius = Math.random() * 2 + 0.5;
        this.hue = Math.random() * 60 + 180;
        this.brightness = Math.random() * 0.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
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

    draw(ctx, centerX, centerY, fov, theme) {
        const scale = fov / this.z;
        const x2d = centerX + this.x * scale;
        const y2d = centerY + this.y * scale;
        const radius = Math.max(this.radius * scale, 0.5);

        const twinkleFactor = Math.cos(this.twinklePhase) * 0.3 + 0.7;
        const brightness = this.brightness * twinkleFactor;

        let hue = this.hue;
        if (theme === 'rainbow') {
            hue = (this.hue + Date.now() * 0.02) % 360;
        }

        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, radius * 3);
        gradient.addColorStop(0, `hsla(${hue}, 100%, ${brightness * 100}%, ${brightness * 0.6})`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, ${brightness * 100}%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x2d, y2d, radius * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsl(${hue}, 100%, ${brightness * 100}%)`;
        ctx.beginPath();
        ctx.arc(x2d, y2d, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============== NEBULA CLASS ==============
class Nebula {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.drift = Math.random() * 0.5;
        this.time = 0;
    }

    update() {
        this.time += 0.01;
        this.opacity = Math.sin(this.time) * 0.2 + 0.15;
    }

    draw(ctx, centerX, centerY) {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        
        gradient.addColorStop(0, `rgba(${this.color}, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(${this.color}, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${this.color}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============== BLACK HOLE CLASS ==============
class BlackHole {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.rotation = 0;
    }

    update() {
        this.rotation += 0.02;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 100, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 200, 0, 0.1)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 150, 0, 0.5)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + i * 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    gravitationalForce(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const strength = 1000 / (distance * distance + 1);
        return { x: (dx / distance) * strength, y: (dy / distance) * strength };
    }
}

// ============== ASTEROID CLASS ==============
class Asteroid {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 10 + 5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    update(speed) {
        this.z -= speed;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx, centerX, centerY, fov) {
        if (this.z <= 0) return;

        const scale = fov / this.z;
        const x2d = centerX + this.x * scale;
        const y2d = centerY + this.y * scale;
        const size = this.size * scale;

        ctx.save();
        ctx.translate(x2d, y2d);
        ctx.rotate(this.rotation);

        ctx.fillStyle = 'rgba(150, 120, 100, 0.7)';
        ctx.fillRect(-size / 2, -size / 2, size, size);

        ctx.strokeStyle = 'rgba(200, 180, 160, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-size / 2, -size / 2, size, size);

        ctx.restore();
    }
}

// ============== AURORA CLASS ==============
class Aurora {
    constructor(canvas) {
        this.canvas = canvas;
        this.waves = [];
        for (let i = 0; i < 5; i++) {
            this.waves.push({
                y: Math.random() * canvas.height,
                amplitude: 30,
                frequency: Math.random() * 0.02 + 0.01,
                phase: Math.random() * Math.PI * 2,
                hue: Math.random() * 60 + 180
            });
        }
    }

    update() {
        this.waves.forEach(wave => {
            wave.phase += wave.frequency;
        });
    }

    draw(ctx) {
        ctx.globalAlpha = 0.15;
        this.waves.forEach(wave => {
            const gradient = ctx.createLinearGradient(0, wave.y - 100, 0, wave.y + 100);
            gradient.addColorStop(0, `hsla(${wave.hue}, 100%, 50%, 0)`);
            gradient.addColorStop(0.5, `hsla(${wave.hue}, 100%, 50%, 0.8)`);
            gradient.addColorStop(1, `hsla(${wave.hue}, 100%, 50%, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            for (let x = 0; x < this.canvas.width; x += 10) {
                const y = wave.y + Math.sin((x * 0.01) + wave.phase) * wave.amplitude;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.lineTo(this.canvas.width, this.canvas.height);
            ctx.lineTo(0, this.canvas.height);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }
}

// ============== WARP TRAIL CLASS ==============
class WarpTrail {
    constructor(x, y, color, life = 30) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.radius = Math.random() * 3 + 2;
    }

    update() {
        this.life--;
    }

    draw(ctx) {
        const opacity = this.life / this.maxLife;
        ctx.fillStyle = `rgba(${this.color}, ${opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    isAlive() {
        return this.life > 0;
    }
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
        this.initializeStars();
        
        this.speed = 5;
        this.targetSpeed = 5;
        this.maxSpeed = 5;
        this.warpLevel = 0;
        this.isPaused = false;
        this.isScreensaverMode = false;
        this.inactivityTimer = 0;
        this.trails = [];
        this.distance = 0;
        this.orbitMode = false;
        
        this.fpsCounter = 0;
        this.lastFpsTime = Date.now();
        this.showFps = false;
        
        this.nebulas = [];
        this.blackHoles = [];
        this.asteroids = [];
        this.aurora = null;
        
        this.initializeEnvironment();
        
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height / 2;
        this.targetMouseX = this.canvas.width / 2;
        this.targetMouseY = this.canvas.height / 2;
        
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

    initializeStars() {
        this.stars = [];
        const starCount = Math.floor((this.canvas.width * this.canvas.height) / (3000 / (this.settings.starMultiplier / 50)));
        for (let i = 0; i < starCount; i++) {
            this.stars.push(new Star(this.canvas));
        }
    }

    initializeEnvironment() {
        if (this.settings.enableNebula) {
            this.nebulas = [];
            for (let i = 0; i < 5; i++) {
                const colors = ['100, 150, 255', '200, 50, 200', '0, 255, 150', '255, 100, 100'];
                this.nebulas.push(new Nebula(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height,
                    Math.random() * 200 + 100,
                    colors[Math.floor(Math.random() * colors.length)]
                ));
            }
        }

        if (this.settings.enableBlackHole) {
            this.blackHoles = [];
            for (let i = 0; i < 2; i++) {
                this.blackHoles.push(new BlackHole(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height
                ));
            }
        }

        if (this.settings.enableAsteroids) {
            this.asteroids = [];
            for (let i = 0; i < 20; i++) {
                this.asteroids.push(new Asteroid(
                    (Math.random() - 0.5) * this.canvas.width,
                    (Math.random() - 0.5) * this.canvas.height,
                    Math.random() * this.canvas.width
                ));
            }
        }

        if (this.settings.enableAurora) {
            this.aurora = new Aurora(this.canvas);
        }
    }

    setupLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
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
            document.getElementById('loadingProgress').style.width = progress + '%';
            document.getElementById('loadingText').textContent = Math.floor(progress) + '%';
        }, 100);
    }

    setupEventListeners() {
        document.getElementById('warpButton').addEventListener('click', () => this.engageWarp());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        document.getElementById('resetButton').addEventListener('click', () => this.reset());
        document.getElementById('screensaverButton').addEventListener('click', () => this.toggleScreensaverMode());
        document.getElementById('settingsButton').addEventListener('click', () => this.openSettings());
        document.getElementById('fpsButton').addEventListener('click', () => this.toggleFpsCounter());
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());

        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.saveSettings();
        });

        document.getElementById('starCountInput').addEventListener('input', (e) => {
            this.settings.starMultiplier = parseInt(e.target.value);
            document.getElementById('starCountSlider').textContent = e.target.value;
            this.initializeStars();
            this.saveSettings();
        });

        document.getElementById('effectsIntensityInput').addEventListener('input', (e) => {
            this.settings.effectsIntensity = parseInt(e.target.value);
            document.getElementById('effectsIntensity').textContent = e.target.value;
            this.saveSettings();
        });

        document.getElementById('enableNebula').addEventListener('change', (e) => {
            this.settings.enableNebula = e.target.checked;
            this.initializeEnvironment();
            this.saveSettings();
        });

        document.getElementById('enableBlackHole').addEventListener('change', (e) => {
            this.settings.enableBlackHole = e.target.checked;
            this.initializeEnvironment();
            this.saveSettings();
        });

        document.getElementById('enableAsteroids').addEventListener('change', (e) => {
            this.settings.enableAsteroids = e.target.checked;
            this.initializeEnvironment();
            this.saveSettings();
        });

        document.getElementById('enableAurora').addEventListener('change', (e) => {
            this.settings.enableAurora = e.target.checked;
            this.initializeEnvironment();
            this.saveSettings();
        });

        document.getElementById('soundEnabled').addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
            if (e.target.checked) {
                this.audio.enable();
            } else {
                this.audio.disable();
            }
            this.saveSettings();
        });

        document.getElementById('autoWarpDelay').addEventListener('input', (e) => {
            this.settings.autoWarpDelay = parseInt(e.target.value);
            document.getElementById('autoWarpTime').textContent = e.target.value;
            this.saveSettings();
        });

        document.addEventListener('keydown', (e) => {
            this.inactivityTimer = 0;
            
            if (e.key === 'w' || e.key === 'W') this.engageWarp();
            if (e.key === ' ') { this.togglePause(); e.preventDefault(); }
            if (e.key === 'r' || e.key === 'R') this.reset();
            if (e.key === 't' || e.key === 'T') this.nextTheme();
            if (e.key === 'o' || e.key === 'O') this.toggleOrbitMode();
            if (e.key === 's' || e.key === 'S') this.takeScreenshot();
            if (e.key === '\\') this.toggleScreensaverMode();
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
            
            const hue = (this.warpLevel * 30 + angle * 180 / Math.PI) % 360;
            this.trails.push(new WarpTrail(x, y, `0, 255, ${100 + this.warpLevel * 30}`, 40));
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseButton');
        pauseBtn.textContent = this.isPaused ? '▶ RESUME' : '⏸ PAUSE';
        pauseBtn.style.background = this.isPaused 
            ? 'linear-gradient(135deg, #00ff00, #00cc00)' 
            : 'linear-gradient(135deg, #ff6600, #ff3300)';
    }

    toggleScreensaverMode() {
        this.isScreensaverMode = !this.isScreensaverMode;
        const btn = document.getElementById('screensaverButton');
        btn.textContent = this.isScreensaverMode ? '🖥 MODE: ON' : '🖥 SCREENSAVER MODE';
        btn.style.background = this.isScreensaverMode 
            ? 'linear-gradient(135deg, #00ff00, #00cc00)' 
            : 'linear-gradient(135deg, #ff00ff, #ff0099)';
    }

    toggleFpsCounter() {
        this.showFps = !this.showFps;
        document.getElementById('fpsDisplay').style.display = this.showFps ? 'block' : 'none';
    }

    nextTheme() {
        const themes = ['cyan', 'purple', 'green', 'rainbow', 'red'];
        const currentIndex = themes.indexOf(this.settings.theme);
        this.settings.theme = themes[(currentIndex + 1) % themes.length];
        document.getElementById('themeSelect').value = this.settings.theme;
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
        notif.classList.remove('hidden');
        setTimeout(() => notif.classList.add('hidden'), 2000);
    }

    openSettings() {
        document.getElementById('settingsPanel').classList.remove('hidden');
        document.getElementById('themeSelect').value = this.settings.theme;
        document.getElementById('starCountInput').value = this.settings.starMultiplier;
        document.getElementById('effectsIntensityInput').value = this.settings.effectsIntensity;
        document.getElementById('enableNebula').checked = this.settings.enableNebula;
        document.getElementById('enableBlackHole').checked = this.settings.enableBlackHole;
        document.getElementById('enableAsteroids').checked = this.settings.enableAsteroids;
        document.getElementById('enableAurora').checked = this.settings.enableAurora;
        document.getElementById('soundEnabled').checked = this.settings.soundEnabled;
        document.getElementById('autoWarpDelay').value = this.settings.autoWarpDelay;
    }

    closeSettings() {
        document.getElementById('settingsPanel').classList.add('hidden');
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
        
        document.getElementById('pauseButton').textContent = '⏸ PAUSE';
        document.getElementById('pauseButton').style.background = 'linear-gradient(135deg, #ff6600, #ff3300)';
        
        this.initializeStars();
        this.initializeEnvironment();
    }

    updateStats() {
        document.getElementById('speedValue').textContent = this.speed.toFixed(1) + 'x';
        document.getElementById('starCount').textContent = this.stars.length;
        document.getElementById('warpLevel').textContent = this.warpLevel;
        document.getElementById('distance').textContent = (this.distance / 1000).toFixed(1) + ' ly';
        document.getElementById('maxSpeed').textContent = this.maxSpeed.toFixed(1) + 'x';
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

            this.asteroids.forEach(asteroid => {
                asteroid.update(this.speed);
                if (asteroid.z <= 0) {
                    asteroid.z = this.canvas.width;
                }
            });

            this.blackHoles.forEach(bh => bh.update());
            this.nebulas.forEach(nebula => nebula.update());
            if (this.aurora) this.aurora.update();

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
            document.getElementById('fpsValue').textContent = this.fpsCounter;
            this.fpsCounter = 0;
            this.lastFpsTime = now;
        }

        this.updateStats();
    }

    draw() {
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(0, 0, 50, 0.1)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 20, 40, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const fov = 300;

        if (this.orbitMode) {
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(Date.now() * 0.0001);
            this.ctx.translate(-centerX, -centerY);
        }

        this.nebulas.forEach(nebula => nebula.draw(this.ctx, centerX, centerY));
        if (this.aurora) this.aurora.draw(this.ctx);
        this.trails.forEach(trail => trail.draw(this.ctx));
        this.stars.forEach(star => star.draw(this.ctx, centerX, centerY, fov, this.settings.theme));
        this.asteroids.forEach(asteroid => asteroid.draw(this.ctx, centerX, centerY, fov));
        this.blackHoles.forEach(bh => bh.draw(this.ctx));

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