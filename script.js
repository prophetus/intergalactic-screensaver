class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width - canvas.width / 2;
        this.y = Math.random() * canvas.height - canvas.height / 2;
        this.z = Math.random() * canvas.width;
        this.originalZ = this.z;
        this.radius = Math.random() * 2 + 0.5;
        this.hue = Math.random() * 60 + 180; // Cyan to blue range
        this.brightness = Math.random() * 0.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
    }

    update(speed) {
        this.z -= speed;
        this.twinklePhase += this.twinkleSpeed;

        // Regenerate star when it reaches the camera
        if (this.z <= 0) {
            this.z = this.originalZ;
            this.x = Math.random() * this.canvas.width - this.canvas.width / 2;
            this.y = Math.random() * this.canvas.height - this.canvas.height / 2;
        }
    }

    draw(ctx, centerX, centerY, fov) {
        // Perspective projection
        const scale = fov / this.z;
        const x2d = centerX + this.x * scale;
        const y2d = centerY + this.y * scale;
        const radius = Math.max(this.radius * scale, 0.5);

        // Twinkle effect
        const twinkleFactor = Math.cos(this.twinklePhase) * 0.3 + 0.7;
        const brightness = this.brightness * twinkleFactor;

        // Draw glow
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, radius * 3);
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, ${brightness * 100}%, ${brightness * 0.6})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 100%, ${brightness * 100}%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x2d, y2d, radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw star core
        ctx.fillStyle = `hsl(${this.hue}, 100%, ${brightness * 100}%)`;
        ctx.beginPath();
        ctx.arc(x2d, y2d, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

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

class IntergalacticScreensaver {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.setupCanvas();
        this.initializeStars();
        
        this.speed = 5;
        this.targetSpeed = 5;
        this.maxSpeed = 50;
        this.warpLevel = 0;
        this.isPaused = false;
        this.trails = [];
        
        this.setupEventListeners();
        this.animate();
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
        const starCount = Math.floor((this.canvas.width * this.canvas.height) / 3000);
        for (let i = 0; i < starCount; i++) {
            this.stars.push(new Star(this.canvas));
        }
    }

    setupEventListeners() {
        document.getElementById('warpButton').addEventListener('click', () => this.engageWarp());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        document.getElementById('resetButton').addEventListener('click', () => this.reset());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'w' || e.key === 'W') this.engageWarp();
            if (e.key === ' ') this.togglePause();
            if (e.key === 'r' || e.key === 'R') this.reset();
        });
    }

    engageWarp() {
        if (this.warpLevel < 5) {
            this.warpLevel++;
            this.targetSpeed = 5 + (this.warpLevel * 9);
            this.createWarpEffect();
        }
    }

    createWarpEffect() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.max(this.canvas.width, this.canvas.height) / 2;
        
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
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

    reset() {
        this.speed = 5;
        this.targetSpeed = 5;
        this.warpLevel = 0;
        this.isPaused = false;
        this.trails = [];
        
        document.getElementById('pauseButton').textContent = '⏸ PAUSE';
        document.getElementById('pauseButton').style.background = 'linear-gradient(135deg, #ff6600, #ff3300)';
        
        this.initializeStars();
    }

    updateStats() {
        document.getElementById('speedValue').textContent = this.speed.toFixed(1) + 'x';
        document.getElementById('starCount').textContent = this.stars.length;
        document.getElementById('warpLevel').textContent = this.warpLevel;
    }

    update() {
        if (!this.isPaused) {
            // Smoothly interpolate speed
            this.speed += (this.targetSpeed - this.speed) * 0.05;

            // Gradually decrease warp level if at max
            if (this.warpLevel > 0 && Math.random() < 0.02) {
                this.warpLevel = Math.max(0, this.warpLevel - 0.5);
                this.targetSpeed = 5 + (Math.max(0, this.warpLevel) * 9);
            }

            // Update stars
            this.stars.forEach(star => star.update(this.speed));

            // Update trails
            this.trails = this.trails.filter(trail => {
                trail.update();
                return trail.isAlive();
            });

            // Create trail effect when at high speed
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

        this.updateStats();
    }

    draw() {
        // Draw starfield background
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add gradient overlay
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(0, 0, 50, 0.1)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 20, 40, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const fov = 300;

        // Draw trails
        this.trails.forEach(trail => trail.draw(this.ctx));

        // Draw stars
        this.stars.forEach(star => star.draw(this.ctx, centerX, centerY, fov));

        // Draw warp tunnel effect when warping
        if (this.warpLevel > 0) {
            this.drawWarpTunnel();
        }

        // Draw crosshair
        this.drawCrosshair();
    }

    drawWarpTunnel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 5; i++) {
            const size = (100 * (5 - i)) * (1 + this.warpLevel * 0.5);
            const opacity = 0.15 - (i * 0.03);
            
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
        
        // Horizontal line
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 30, centerY);
        this.ctx.lineTo(centerX + 30, centerY);
        this.ctx.stroke();
        
        // Vertical line
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 30);
        this.ctx.lineTo(centerX, centerY + 30);
        this.ctx.stroke();
        
        // Center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IntergalacticScreensaver();
});