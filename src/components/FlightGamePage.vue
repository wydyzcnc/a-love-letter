<template>
    <div class="game-container">
        <div class="game-header">
            <div class="score-board">
                <span class="score-label">⭐ 飞行距离</span>
                <span class="score-value">{{ Math.floor(score) }}</span>
            </div>
            <div class="health-board">
                <span class="health-label">❤️ 生命</span>
                <span class="health-value">{{ health }}</span>
            </div>
        </div>

        <div class="game-canvas-wrapper">
            <canvas ref="gameCanvas" class="game-canvas" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
                @touchend="handleTouchEnd" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
                @mouseup="handleMouseUp" @mouseleave="handleMouseUp"></canvas>
        </div>

        <div class="game-controls">
            <button class="control-btn" @click="toggleGame" v-if="!gameOver">
                {{ isPlaying ? '⏸️ 暂停' : '▶️ 开始' }}
            </button>
            <button class="control-btn restart-btn" @click="resetGame" v-if="gameOver">
                🔄 再来一次
            </button>
        </div>

        <div class="game-footer">
            <span class="footer-text">🌸 轻轻触摸 · 快乐飞翔</span>
        </div>

        <!-- 游戏结束弹窗 -->
        <div class="game-over-overlay" v-if="gameOver">
            <div class="game-over-modal">
                <h2 class="game-over-title">🌈 飞行结束</h2>
                <p class="game-over-score">你的飞行距离：<strong>{{ Math.floor(score) }}</strong></p>
                <p class="game-over-message">{{ gameOverMessage }}</p>
                <button class="restart-btn modal-btn" @click="resetGame">🔄 重新起飞</button>
            </div>
        </div>
    </div>
</template>
  
<script>
export default {
    name: 'CuteFlightGame',
    data() {
        return {
            canvas: null,
            ctx: null,
            isPlaying: false,
            gameOver: false,
            gameOverMessage: '💖 再试一次吧！',
            score: 0,
            health: 5,
            maxHealth: 5,
            player: {
                x: 60,
                y: 0,
                radius: 16,
                color: '#FFB7C5',
                speed: 0,
                gravity: 0.3,
                lift: -7,
                targetY: 0,
                rotation: 0,
                wingAngle: 0,
            },
            obstacles: [],
            clouds: [],
            stars: [],
            particles: [],
            hearts: [],
            frameId: null,
            obstacleSpawnRate: 55,
            frameCount: 0,
            width: 0,
            height: 0,
            isTouching: false,
            touchY: 0,
            obstacleTypes: [
                { type: 'cloud', weight: 30, color: '#B5D8EB', size: 22 },
                { type: 'rainbow', weight: 15, color: '#FFB7C5', size: 18 },
                { type: 'balloon', weight: 20, color: '#FF8A9B', size: 16 },
                { type: 'flower', weight: 15, color: '#FFB07C', size: 14 },
                { type: 'heart', weight: 10, color: '#FF6B8A', size: 12 },
                { type: 'cookie', weight: 10, color: '#D4A574', size: 14 },
            ],
            collectibles: [
                { type: 'star', weight: 20, color: '#FFD93D', points: 5 },
                { type: 'candy', weight: 15, color: '#FF6B8A', points: 8 },
                { type: 'gem', weight: 10, color: '#7BC8F6', points: 10 },
            ],
        };
    },
    mounted() {
        this.$store.commit('UPDATE_PAGE_TITLE', '飞行游戏');

        this.initCanvas();
        this.initClouds();
        this.initStars();
        this.resetGame();
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
        this.stopGameLoop();
    },
    methods: {
        initCanvas() {
            this.canvas = this.$refs.gameCanvas;
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
        },
        resizeCanvas() {
            const container = this.canvas.parentElement;
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            this.width = rect.width || 360;
            this.height = rect.height || 500;
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
            this.ctx.scale(dpr, dpr);
            if (this.player) {
                this.player.y = this.height / 2;
                this.player.targetY = this.height / 2;
            }
        },
        handleResize() {
            this.resizeCanvas();
        },
        initClouds() {
            this.clouds = [];
            for (let i = 0; i < 8; i++) {
                this.clouds.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height * 0.85 + 15,
                    size: 25 + Math.random() * 45,
                    speed: 0.15 + Math.random() * 0.4,
                    opacity: 0.3 + Math.random() * 0.3,
                    layer: Math.floor(Math.random() * 3),
                });
            }
        },
        initStars() {
            this.stars = [];
            for (let i = 0; i < 20; i++) {
                this.stars.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    size: 1.5 + Math.random() * 3.5,
                    twinkle: Math.random() * Math.PI * 2,
                    speed: 0.015 + Math.random() * 0.025,
                });
            }
        },
        resetGame() {
            this.stopGameLoop();
            this.gameOver = false;
            this.gameOverMessage = '💖 再试一次吧！';
            this.score = 0;
            this.health = this.maxHealth;
            this.obstacles = [];
            this.particles = [];
            this.hearts = [];
            this.player.y = this.height / 2;
            this.player.targetY = this.height / 2;
            this.player.speed = 0;
            this.player.rotation = 0;
            this.player.wingAngle = 0;
            this.isPlaying = false;
            this.isTouching = false;
            this.frameCount = 0;
            this.obstacleSpawnRate = 55;
            this.draw();
        },
        startGame() {
            if (this.gameOver) return;
            if (!this.isPlaying) {
                this.isPlaying = true;
                this.gameLoop();
            }
        },
        toggleGame() {
            if (this.gameOver) return;
            if (this.isPlaying) {
                this.isPlaying = false;
                this.stopGameLoop();
            } else {
                this.startGame();
            }
        },
        stopGameLoop() {
            if (this.frameId) {
                cancelAnimationFrame(this.frameId);
                this.frameId = null;
            }
        },
        gameLoop() {
            if (!this.isPlaying || this.gameOver) {
                this.draw();
                return;
            }

            this.update();
            this.draw();
            this.frameId = requestAnimationFrame(this.gameLoop);
        },
        weightedRandom(items) {
            const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
            let random = Math.random() * totalWeight;
            for (const item of items) {
                random -= item.weight;
                if (random <= 0) return item;
            }
            return items[items.length - 1];
        },
        update() {
            if (this.gameOver || !this.isPlaying) return;

            this.frameCount++;

            if (this.isTouching) {
                this.player.speed += (this.player.lift - this.player.speed) * 0.15;
                this.player.rotation = Math.max(this.player.rotation - 0.03, -0.35);
            } else {
                this.player.speed += this.player.gravity;
                this.player.rotation = Math.min(this.player.rotation + 0.025, 0.6);
            }

            this.player.y += this.player.speed;
            this.player.wingAngle += 0.08;

            if (this.player.y < 20) {
                this.player.y = 20;
                this.player.speed = 0;
            }
            if (this.player.y > this.height - 20) {
                this.player.y = this.height - 20;
                this.player.speed = 0;
            }

            const spawnRate = Math.max(30, this.obstacleSpawnRate - Math.floor(this.score / 40));
            if (this.frameCount % spawnRate === 0 && this.obstacles.length < 15) {
                const isCollectible = Math.random() < 0.25;
                let item;
                if (isCollectible) {
                    item = this.weightedRandom(this.collectibles);
                    const yPos = 30 + Math.random() * (this.height - 60);
                    this.obstacles.push({
                        x: this.width + 30,
                        y: yPos,
                        size: Math.max(10, 14 + Math.random() * 6),
                        type: item.type,
                        category: 'collectible',
                        color: item.color,
                        points: item.points,
                        collected: false,
                        speed: 1.8 + Math.random() * 1.2,
                        rotation: 0,
                        pulse: 0,
                    });
                } else {
                    const typeData = this.weightedRandom(this.obstacleTypes);
                    const yPos = 30 + Math.random() * (this.height - 60);
                    this.obstacles.push({
                        x: this.width + 30,
                        y: yPos,
                        size: Math.max(10, typeData.size + (Math.random() - 0.5) * 6),
                        type: typeData.type,
                        category: 'obstacle',
                        color: typeData.color,
                        collected: false,
                        speed: 1.5 + Math.random() * 1.8,
                        rotation: 0,
                        pulse: Math.random() * Math.PI * 2,
                    });
                }
                this.obstacleSpawnRate = spawnRate;
            }

            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                const obs = this.obstacles[i];
                obs.x -= obs.speed;
                obs.pulse += 0.04;
                obs.rotation += 0.02;

                const dx = this.player.x - obs.x;
                const dy = this.player.y - obs.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const threshold = this.player.radius + obs.size * 0.6;

                if (dist < threshold && !obs.collected) {
                    if (obs.category === 'collectible') {
                        obs.collected = true;
                        this.score += obs.points || 5;
                        this.createParticles(obs.x, obs.y, obs.color, 12);
                        this.createHeartEffect(obs.x, obs.y);
                    } else {
                        obs.collected = true;
                        this.health--;
                        this.createParticles(obs.x, obs.y, '#FF6B8A', 20);
                        this.createShakeParticles(obs.x, obs.y);
                        if (this.health <= 0) {
                            this.health = 0;
                            this.endGame('😢 小飞侠需要休息了...');
                            return;
                        }
                    }
                }

                if (obs.x < -50 || obs.collected) {
                    this.obstacles.splice(i, 1);
                    if (!obs.collected && obs.category === 'obstacle') {
                        this.score += 0.8;
                    }
                }
            }

            this.clouds.forEach(cloud => {
                cloud.x -= cloud.speed * (0.5 + cloud.layer * 0.2);
                if (cloud.x + cloud.size < 0) {
                    cloud.x = this.width + cloud.size;
                    cloud.y = Math.random() * this.height * 0.85 + 15;
                }
            });

            this.stars.forEach(star => {
                star.twinkle += star.speed;
            });

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05;
                p.life -= 0.02;
                p.size *= 0.98;
                if (p.life <= 0 || p.size < 0.3) {
                    this.particles.splice(i, 1);
                }
            }

            for (let i = this.hearts.length - 1; i >= 0; i--) {
                const h = this.hearts[i];
                h.y -= 0.8;
                h.life -= 0.015;
                h.size *= 0.995;
                if (h.life <= 0) {
                    this.hearts.splice(i, 1);
                }
            }

            if (this.frameCount % 3 === 0) {
                this.score += 0.3;
            }
        },
        createParticles(x, y, color, count = 12) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 4;
                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1.5,
                    size: 3 + Math.random() * 7,
                    color: color,
                    life: 0.7 + Math.random() * 0.5,
                });
            }
        },
        createShakeParticles(x, y) {
            for (let i = 0; i < 8; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 5;
                this.particles.push({
                    x: x + (Math.random() - 0.5) * 20,
                    y: y + (Math.random() - 0.5) * 20,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 2,
                    size: 5 + Math.random() * 8,
                    color: '#FF6B8A',
                    life: 0.5 + Math.random() * 0.4,
                });
            }
        },
        createHeartEffect(x, y) {
            for (let i = 0; i < 5; i++) {
                this.hearts.push({
                    x: x + (Math.random() - 0.5) * 30,
                    y: y + (Math.random() - 0.5) * 20,
                    size: 6 + Math.random() * 10,
                    life: 1,
                    color: ['#FF6B8A', '#FF8A9B', '#FFB7C5', '#FFD93D'][Math.floor(Math.random() * 4)],
                });
            }
        },
        drawObstacle(ctx, obs) {
            // 确保size为正值
            const safeSize = Math.max(8, obs.size || 12);

            ctx.save();
            const { x, y, type, color, category } = obs;

            if (category === 'collectible') {
                ctx.shadowColor = color;
                ctx.shadowBlur = 20;
                const pulseSize = 1 + Math.sin(obs.pulse || 0) * 0.08;

                if (type === 'star') {
                    ctx.translate(x, y);
                    ctx.scale(pulseSize, pulseSize);
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                        const r = i % 2 === 0 ? safeSize : safeSize * 0.5;
                        const px = Math.cos(angle) * r;
                        const py = Math.sin(angle) * r;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#FFF';
                    ctx.beginPath();
                    ctx.arc(-safeSize * 0.15, -safeSize * 0.2, Math.max(1, safeSize * 0.15), 0, Math.PI * 2);
                    ctx.arc(safeSize * 0.15, -safeSize * 0.2, Math.max(1, safeSize * 0.12), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#333';
                    ctx.beginPath();
                    ctx.arc(-safeSize * 0.1, -safeSize * 0.15, Math.max(1, safeSize * 0.06), 0, Math.PI * 2);
                    ctx.arc(safeSize * 0.2, -safeSize * 0.15, Math.max(1, safeSize * 0.05), 0, Math.PI * 2);
                    ctx.fill();
                } else if (type === 'candy') {
                    ctx.translate(x, y);
                    ctx.rotate(obs.rotation || 0);
                    ctx.scale(pulseSize, pulseSize);
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, safeSize * 1.2, safeSize * 0.7, 0, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    for (let i = -1; i <= 1; i++) {
                        ctx.beginPath();
                        ctx.ellipse(i * safeSize * 0.5, 0, safeSize * 0.15, safeSize * 0.6, 0, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255,255,255,0.4)';
                        ctx.fill();
                    }
                    ctx.beginPath();
                    ctx.arc(-safeSize * 1.3, 0, Math.max(1, safeSize * 0.2), 0, Math.PI * 2);
                    ctx.arc(safeSize * 1.3, 0, Math.max(1, safeSize * 0.2), 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,0.5)';
                    ctx.fill();
                } else if (type === 'gem') {
                    ctx.translate(x, y);
                    ctx.rotate((obs.rotation || 0) * 0.5);
                    ctx.scale(pulseSize, pulseSize);
                    ctx.shadowBlur = 25;
                    ctx.beginPath();
                    ctx.moveTo(0, -safeSize);
                    ctx.lineTo(safeSize * 0.7, -safeSize * 0.3);
                    ctx.lineTo(safeSize * 0.5, safeSize * 0.5);
                    ctx.lineTo(0, safeSize * 0.8);
                    ctx.lineTo(-safeSize * 0.5, safeSize * 0.5);
                    ctx.lineTo(-safeSize * 0.7, -safeSize * 0.3);
                    ctx.closePath();
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.moveTo(-safeSize * 0.2, -safeSize * 0.7);
                    ctx.lineTo(0, -safeSize * 0.5);
                    ctx.lineTo(safeSize * 0.1, -safeSize * 0.3);
                    ctx.fillStyle = 'rgba(255,255,255,0.4)';
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
                ctx.restore();
                return;
            }

            ctx.shadowColor = 'rgba(180,200,220,0.2)';
            ctx.shadowBlur = 15;

            switch (type) {
                case 'cloud': {
                    const s = safeSize;
                    ctx.beginPath();
                    ctx.arc(x, y, s * 0.6, 0, Math.PI * 2);
                    ctx.arc(x - s * 0.5, y - s * 0.2, s * 0.45, 0, Math.PI * 2);
                    ctx.arc(x + s * 0.5, y - s * 0.2, s * 0.45, 0, Math.PI * 2);
                    ctx.arc(x - s * 0.2, y + s * 0.2, s * 0.35, 0, Math.PI * 2);
                    ctx.arc(x + s * 0.2, y + s * 0.2, s * 0.35, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#7BA3C7';
                    ctx.beginPath();
                    ctx.arc(x - s * 0.2, y - s * 0.1, Math.max(1, s * 0.08), 0, Math.PI * 2);
                    ctx.arc(x + s * 0.2, y - s * 0.1, Math.max(1, s * 0.07), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x, y + s * 0.05, Math.max(1, s * 0.12), 0, Math.PI);
                    ctx.strokeStyle = '#7BA3C7';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    break;
                }
                case 'rainbow': {
                    ctx.shadowBlur = 20;
                    const colors = ['#FF6B6B', '#FFB74D', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6'];
                    const arcSize = Math.max(10, safeSize * 1.2);
                    const steps = Math.min(6, Math.floor(arcSize / 4));
                    for (let i = 0; i < steps; i++) {
                        const radius = Math.max(2, arcSize - i * 4);
                        ctx.beginPath();
                        ctx.arc(x, y + arcSize * 0.3, radius, Math.PI * 0.8, Math.PI * 1.2);
                        ctx.strokeStyle = colors[i % colors.length];
                        ctx.lineWidth = Math.min(5, radius * 0.4);
                        ctx.stroke();
                    }
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.arc(x - arcSize + 5, y + arcSize * 0.3, 8, 0, Math.PI * 2);
                    ctx.arc(x - arcSize + 12, y + arcSize * 0.35, 6, 0, Math.PI * 2);
                    ctx.fillStyle = '#B5D8EB';
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x + arcSize - 5, y + arcSize * 0.3, 8, 0, Math.PI * 2);
                    ctx.arc(x + arcSize - 12, y + arcSize * 0.35, 6, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                }
                case 'balloon': {
                    const s = safeSize;
                    ctx.shadowBlur = 25;
                    ctx.beginPath();
                    ctx.ellipse(x, y - s * 0.3, s * 0.8, s, 0, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.ellipse(x - s * 0.25, y - s * 0.5, s * 0.15, s * 0.25, -0.3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,0.4)';
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(x, y + s * 0.7);
                    ctx.quadraticCurveTo(x + s * 0.2, y + s * 1.2, x + s * 0.1, y + s * 1.4);
                    ctx.strokeStyle = '#C9A8B4';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.fillStyle = '#FFF';
                    ctx.beginPath();
                    ctx.arc(x - s * 0.2, y - s * 0.3, Math.max(1, s * 0.12), 0, Math.PI * 2);
                    ctx.arc(x + s * 0.2, y - s * 0.3, Math.max(1, s * 0.1), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#333';
                    ctx.beginPath();
                    ctx.arc(x - s * 0.15, y - s * 0.25, Math.max(1, s * 0.05), 0, Math.PI * 2);
                    ctx.arc(x + s * 0.25, y - s * 0.25, Math.max(1, s * 0.04), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x, y, Math.max(1, s * 0.1), 0, Math.PI);
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    break;
                }
                case 'flower': {
                    const s = safeSize;
                    ctx.shadowBlur = 20;
                    const petalCount = 6;
                    const petalSize = Math.max(3, s * 0.4);
                    for (let i = 0; i < petalCount; i++) {
                        const angle = (i / petalCount) * Math.PI * 2 + (obs.rotation || 0);
                        const px = x + Math.cos(angle) * s * 0.7;
                        const py = y + Math.sin(angle) * s * 0.7;
                        ctx.beginPath();
                        ctx.ellipse(px, py, petalSize, petalSize, angle, 0, Math.PI * 2);
                        ctx.fillStyle = i % 2 === 0 ? color : '#FFD93D';
                        ctx.fill();
                    }
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.arc(x, y, Math.max(2, s * 0.3), 0, Math.PI * 2);
                    ctx.fillStyle = '#FFD93D';
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x - s * 0.08, y - s * 0.1, Math.max(1, s * 0.06), 0, Math.PI * 2);
                    ctx.arc(x + s * 0.08, y - s * 0.1, Math.max(1, s * 0.05), 0, Math.PI * 2);
                    ctx.fillStyle = '#333';
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x, y + s * 0.05, Math.max(1, s * 0.08), 0, Math.PI);
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    break;
                }
                case 'heart': {
                    const s = safeSize;
                    ctx.shadowBlur = 20;
                    ctx.translate(x, y);
                    ctx.rotate((obs.rotation || 0) * 0.3);
                    ctx.beginPath();
                    ctx.moveTo(0, s * 0.3);
                    ctx.bezierCurveTo(-s, -s * 0.5, -s * 0.6, -s * 0.8, 0, -s * 0.4);
                    ctx.bezierCurveTo(s * 0.6, -s * 0.8, s, -s * 0.5, 0, s * 0.3);
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#FFF';
                    ctx.beginPath();
                    ctx.arc(-s * 0.15, -s * 0.15, Math.max(1, s * 0.08), 0, Math.PI * 2);
                    ctx.arc(s * 0.15, -s * 0.15, Math.max(1, s * 0.07), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#333';
                    ctx.beginPath();
                    ctx.arc(-s * 0.1, -s * 0.1, Math.max(1, s * 0.04), 0, Math.PI * 2);
                    ctx.arc(s * 0.2, -s * 0.1, Math.max(1, s * 0.03), 0, Math.PI * 2);
                    ctx.fill();
                    break;
                }
                case 'cookie': {
                    const s = safeSize;
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.arc(x, y, s * 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    const chipColors = ['#5D4037', '#795548', '#4E342E'];
                    for (let i = 0; i < 5; i++) {
                        const angle = (i / 5) * Math.PI * 2 + (obs.rotation || 0);
                        const cx = x + Math.cos(angle) * s * 0.4;
                        const cy = y + Math.sin(angle) * s * 0.4;
                        ctx.beginPath();
                        ctx.arc(cx, cy, Math.max(1, s * 0.12), 0, Math.PI * 2);
                        ctx.fillStyle = chipColors[i % chipColors.length];
                        ctx.fill();
                    }
                    ctx.fillStyle = '#FFF';
                    ctx.beginPath();
                    ctx.arc(x - s * 0.15, y - s * 0.1, Math.max(1, s * 0.08), 0, Math.PI * 2);
                    ctx.arc(x + s * 0.15, y - s * 0.1, Math.max(1, s * 0.07), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#5D4037';
                    ctx.beginPath();
                    ctx.arc(x - s * 0.1, y - s * 0.05, Math.max(1, s * 0.04), 0, Math.PI * 2);
                    ctx.arc(x + s * 0.2, y - s * 0.05, Math.max(1, s * 0.03), 0, Math.PI * 2);
                    ctx.fill();
                    break;
                }
                default: {
                    ctx.beginPath();
                    ctx.arc(x, y, safeSize * 0.7, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
            }
            ctx.shadowBlur = 0;
            ctx.restore();
        },
        draw() {
            const ctx = this.ctx;
            const w = this.width;
            const h = this.height;

            const gradient = ctx.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0, '#FDEFF2');
            gradient.addColorStop(0.4, '#FFF5E6');
            gradient.addColorStop(0.7, '#F0FAF0');
            gradient.addColorStop(1, '#E8F5E9');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

            this.stars.forEach(star => {
                const alpha = 0.4 + Math.sin(star.twinkle) * 0.3;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.5})`;
                ctx.fill();
            });

            this.clouds.forEach(cloud => {
                ctx.beginPath();
                ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
                ctx.arc(cloud.x - cloud.size * 0.4, cloud.y - cloud.size * 0.2, cloud.size * 0.4, 0, Math.PI * 2);
                ctx.arc(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.2, cloud.size * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
                ctx.fill();
            });

            this.hearts.forEach(h => {
                ctx.save();
                ctx.globalAlpha = h.life;
                ctx.translate(h.x, h.y);
                const s = h.size;
                ctx.beginPath();
                ctx.moveTo(0, s * 0.3);
                ctx.bezierCurveTo(-s, -s * 0.5, -s * 0.6, -s * 0.8, 0, -s * 0.4);
                ctx.bezierCurveTo(s * 0.6, -s * 0.8, s, -s * 0.5, 0, s * 0.3);
                ctx.fillStyle = h.color;
                ctx.fill();
                ctx.restore();
            });

            this.obstacles.forEach(obs => {
                if (!obs.collected) {
                    this.drawObstacle(ctx, obs);
                }
            });

            this.particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            ctx.save();
            const p = this.player;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            const r = p.radius;

            ctx.shadowColor = 'rgba(255, 200, 200, 0.3)';
            ctx.shadowBlur = 30;

            const wingFlap = Math.sin(p.wingAngle) * 0.15 + 0.5;

            ctx.beginPath();
            ctx.moveTo(-r * 0.3, -r * 0.1);
            ctx.quadraticCurveTo(-r * 1.8, -r * (0.8 + wingFlap * 0.3), -r * 0.2, -r * 0.6);
            ctx.fillStyle = '#FF8A9B';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(-r * 0.3, r * 0.1);
            ctx.quadraticCurveTo(-r * 1.8, r * (0.8 + wingFlap * 0.3), -r * 0.2, r * 0.6);
            ctx.fillStyle = '#FF8A9B';
            ctx.fill();

            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 1.2, r * 0.9, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#FFB7C5';
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.ellipse(r * 0.2, 0, r * 0.4, r * 0.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(r * 0.4, -r * 0.2, r * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = '#FFF';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(r * 0.4, r * 0.2, r * 0.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(r * 0.5, -r * 0.2, r * 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(r * 0.5, r * 0.2, r * 0.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(r * 0.55, -r * 0.25, r * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(r * 0.55, r * 0.15, r * 0.04, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 150, 150, 0.3)';
            ctx.beginPath();
            ctx.arc(r * 0.7, -r * 0.5, r * 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(r * 0.7, r * 0.5, r * 0.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(r * 0.5, 0, r * 0.12, 0, Math.PI);
            ctx.strokeStyle = '#D4697A';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(-r * 0.1, -r * 0.9, r * 0.15, 0, Math.PI * 2);
            ctx.fillStyle = '#FFD93D';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(-r * 0.1, -r * 1.05, r * 0.08, 0, Math.PI * 2);
            ctx.fillStyle = '#FF6B6B';
            ctx.fill();

            ctx.restore();

            if (!this.isPlaying && !this.gameOver && this.frameCount < 10) {
                ctx.save();
                ctx.fillStyle = 'rgba(180, 120, 140, 0.5)';
                ctx.font = '18px "Segoe UI", "PingFang SC", cursive';
                ctx.textAlign = 'center';
                ctx.fillText('👆 触摸屏幕起飞', w / 2, h / 2 + 60);
                ctx.restore();
            }
        },
        endGame(message) {
            this.gameOver = true;
            this.isPlaying = false;
            this.gameOverMessage = message || '💖 再试一次吧！';
            this.stopGameLoop();
            this.draw();
        },
        handleTouchStart(e) {
            e.preventDefault();
            if (this.gameOver) return;
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.touchY = touch.clientY - rect.top;
            this.isTouching = true;
            if (!this.isPlaying) {
                this.startGame();
            }
        },
        handleTouchMove(e) {
            e.preventDefault();
            if (this.gameOver) return;
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.touchY = touch.clientY - rect.top;
            const targetY = Math.max(20, Math.min(this.height - 20, this.touchY));
            this.player.y += (targetY - this.player.y) * 0.15;
        },
        handleTouchEnd(e) {
            e.preventDefault();
            this.isTouching = false;
        },
        handleMouseDown(e) {
            if (this.gameOver) return;
            const rect = this.canvas.getBoundingClientRect();
            this.touchY = e.clientY - rect.top;
            this.isTouching = true;
            if (!this.isPlaying) {
                this.startGame();
            }
        },
        handleMouseMove(e) {
            if (!this.isTouching || this.gameOver) return;
            const rect = this.canvas.getBoundingClientRect();
            this.touchY = e.clientY - rect.top;
            const targetY = Math.max(20, Math.min(this.height - 20, this.touchY));
            this.player.y += (targetY - this.player.y) * 0.15;
        },
        handleMouseUp(e) {
            this.isTouching = false;
        },
    },
};
</script>
  
<style scoped>
.game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 86vh;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    padding: 12px 16px 20px;
    background: linear-gradient(145deg, #FFF5F7, #F8EEFF);
    border-radius: 36px;
    box-shadow: 0 8px 32px rgba(255, 150, 180, 0.20);
    font-family: 'Segoe UI', 'PingFang SC', 'Helvetica Neue', cursive, sans-serif;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    position: relative;
    overflow: hidden;
}

.game-header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 8px 4px 12px;
    z-index: 2;
}

.score-board,
.health-board {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(8px);
    padding: 8px 16px;
    border-radius: 30px;
    box-shadow: 0 2px 12px rgba(255, 200, 200, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.5);
}

.score-label,
.health-label {
    font-size: 14px;
    font-weight: 600;
    color: #B07A8A;
}

.score-value,
.health-value {
    font-size: 20px;
    font-weight: 700;
    color: #E8738A;
    min-width: 30px;
    text-align: center;
}

.game-canvas-wrapper {
    flex: 1;
    width: 100%;
    min-height: 280px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: inset 0 2px 12px rgba(180, 150, 200, 0.15),
        0 8px 24px rgba(255, 150, 180, 0.10);
    background: #FDF6F8;
    touch-action: none;
}

.game-canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
    cursor: pointer;
}

.game-controls {
    padding: 12px 0 4px;
    display: flex;
    justify-content: center;
    gap: 16px;
    z-index: 2;
}

.control-btn {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 200, 200, 0.4);
    padding: 12px 28px;
    border-radius: 40px;
    font-size: 18px;
    font-weight: 600;
    color: #B07A8A;
    box-shadow: 0 4px 12px rgba(255, 150, 180, 0.12);
    transition: all 0.2s ease;
    cursor: pointer;
    min-width: 120px;
    letter-spacing: 1px;
}

.control-btn:active {
    transform: scale(0.94);
    background: rgba(255, 220, 220, 0.9);
}

.restart-btn {
    background: #FFB7C5;
    color: #FFF;
    border-color: #FFA0B2;
}

.game-footer {
    padding: 6px 0 2px;
    font-size: 13px;
    color: #C9A8B4;
    letter-spacing: 2px;
    opacity: 0.7;
}

.game-over-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 240, 245, 0.7);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 36px;
    z-index: 10;
    animation: fadeIn 0.5s ease;
}

.game-over-modal {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    padding: 32px 28px;
    border-radius: 48px;
    text-align: center;
    max-width: 280px;
    width: 80%;
    box-shadow: 0 16px 48px rgba(255, 150, 180, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.6);
    animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.game-over-title {
    font-size: 28px;
    color: #E8738A;
    margin: 0 0 8px 0;
    font-weight: 700;
}

.game-over-score {
    font-size: 18px;
    color: #B07A8A;
    margin: 12px 0;
}

.game-over-score strong {
    color: #E8738A;
    font-size: 26px;
}

.game-over-message {
    font-size: 16px;
    color: #C9A8B4;
    margin: 8px 0 20px;
}

.modal-btn {
    background: #FFB7C5;
    color: #FFF;
    border: none;
    padding: 14px 32px;
    border-radius: 40px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(255, 150, 180, 0.25);
}

.modal-btn:active {
    transform: scale(0.94);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes bounceIn {
    0% {
        transform: scale(0.7);
        opacity: 0;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

@media (max-width: 420px) {
    .game-container {
        padding: 8px 10px 12px;
        border-radius: 24px;
    }

    .score-label,
    .health-label {
        font-size: 12px;
    }

    .score-value,
    .health-value {
        font-size: 18px;
    }

    .control-btn {
        font-size: 16px;
        padding: 10px 20px;
        min-width: 100px;
    }

    .game-over-title {
        font-size: 24px;
    }
}

@supports (padding: max(0px)) {
    .game-container {
        padding-left: max(16px, env(safe-area-inset-left));
        padding-right: max(16px, env(safe-area-inset-right));
        padding-bottom: max(20px, env(safe-area-inset-bottom));
    }
}
</style>