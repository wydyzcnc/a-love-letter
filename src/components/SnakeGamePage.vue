<template>
    <div class="snake-game">
        <div class="game-container">
            <div class="header">
                <div class="title">🐍 贪吃小蛇</div>
                <div class="score">⭐ {{ score }}</div>
            </div>

            <div class="canvas-wrapper">
                <canvas ref="gameCanvas" class="game-canvas" @touchstart="handleTouchStart"
                    @touchmove="handleTouchMove"></canvas>
            </div>

            <div class="actions">
                <button class="action-btn restart" @click="restartGame">🔄 重来</button>
                <button class="action-btn pause" @click="togglePause">{{ isPaused ? '▶️ 继续' : '⏸️ 暂停' }}</button>
            </div>
        </div>
    </div>
</template>
  
<script>
export default {
    name: 'SnakeGame',
    data() {
        return {
            canvasSize: 0,
            gridSize: 20,
            snake: [],
            food: { x: 10, y: 10 },
            direction: 'right',
            nextDirection: 'right',
            score: 0,
            gameOver: false,
            isPaused: false,
            gameInterval: null,
            speed: 130,
            isGameRunning: false,
            touchStartX: 0,
            touchStartY: 0,
            isSwiping: false,
        };
    },
    mounted() {
        this.$store.commit('UPDATE_PAGE_TITLE', '贪吃小蛇游戏');
        this.$nextTick(() => {
            this.updateCanvasSize();
        });
        window.addEventListener('resize', this.updateCanvasSize);
        this.initGame();
        this.startGame();
        window.addEventListener('keydown', this.handleKeyPress);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.updateCanvasSize);
        window.removeEventListener('keydown', this.handleKeyPress);
        this.stopGame();
    },
    methods: {
        updateCanvasSize() {
            const wrapper = this.$el.querySelector('.canvas-wrapper');
            if (wrapper) {
                const rect = wrapper.getBoundingClientRect();
                const size = Math.floor(Math.min(rect.width, rect.height));
                this.canvasSize = size > 0 ? size : 300;
                if (this.canvasSize > 0) {
                    this.$nextTick(() => {
                        this.drawCanvas();
                    });
                }
            }
        },
        initGame() {
            const middle = Math.floor(this.gridSize / 2);
            this.snake = [
                { x: middle, y: middle },
                { x: middle - 1, y: middle },
                { x: middle - 2, y: middle },
            ];
            this.direction = 'right';
            this.nextDirection = 'right';
            this.score = 0;
            this.gameOver = false;
            this.isPaused = false;
            this.generateFood();
        },
        startGame() {
            if (this.gameInterval) {
                clearInterval(this.gameInterval);
            }
            this.isGameRunning = true;
            this.gameInterval = setInterval(() => {
                if (!this.isPaused && !this.gameOver) {
                    this.moveSnake();
                }
                this.drawCanvas();
            }, this.speed);
        },
        stopGame() {
            if (this.gameInterval) {
                clearInterval(this.gameInterval);
                this.gameInterval = null;
                this.isGameRunning = false;
            }
        },
        restartGame() {
            this.stopGame();
            this.initGame();
            this.startGame();
            this.drawCanvas();
        },
        togglePause() {
            if (this.gameOver) return;
            this.isPaused = !this.isPaused;
            this.drawCanvas();
        },
        generateFood() {
            const maxAttempts = 2000;
            for (let i = 0; i < maxAttempts; i++) {
                const x = Math.floor(Math.random() * this.gridSize);
                const y = Math.floor(Math.random() * this.gridSize);
                if (!this.snake.some(seg => seg.x === x && seg.y === y)) {
                    this.food = { x, y };
                    return;
                }
            }
            this.gameOver = true;
            this.isPaused = true;
        },
        moveSnake() {
            if (this.gameOver) return;

            const opposite = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };
            if (this.nextDirection && opposite[this.nextDirection] !== this.direction) {
                this.direction = this.nextDirection;
            }

            const head = { ...this.snake[0] };
            switch (this.direction) {
                case 'up': head.y--; break;
                case 'down': head.y++; break;
                case 'left': head.x--; break;
                case 'right': head.x++; break;
            }

            const isEating = head.x === this.food.x && head.y === this.food.y;

            let newSnake = [head, ...this.snake];
            if (!isEating) {
                newSnake.pop();
            }

            const headCollision = newSnake.slice(1).some(seg => seg.x === head.x && seg.y === head.y);
            const wallCollision = head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize;

            if (headCollision || wallCollision) {
                this.gameOver = true;
                this.isPaused = true;
                this.snake = newSnake;
                this.drawCanvas();
                return;
            }

            this.snake = newSnake;

            if (isEating) {
                this.score++;
                this.generateFood();
                if (this.score % 5 === 0 && this.speed > 50) {
                    this.speed = Math.max(50, this.speed - 8);
                    this.stopGame();
                    this.startGame();
                }
            }
        },
        changeDirection(dir) {
            if (this.gameOver || this.isPaused) return;
            const opposite = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };
            if (dir !== opposite[this.direction]) {
                this.nextDirection = dir;
            }
        },
        handleTouchStart(e) {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            this.isSwiping = false;
        },
        handleTouchMove(e) {
            e.preventDefault();
            if (!this.touchStartX || !this.touchStartY) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;

            const minSwipeDistance = 20;

            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
                return;
            }

            if (this.isSwiping) return;
            this.isSwiping = true;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    this.changeDirection('right');
                } else {
                    this.changeDirection('left');
                }
            } else {
                if (deltaY > 0) {
                    this.changeDirection('down');
                } else {
                    this.changeDirection('up');
                }
            }

            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            setTimeout(() => {
                this.isSwiping = false;
            }, 150);
        },
        handleKeyPress(e) {
            const keyMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };
            const dir = keyMap[e.key];
            if (dir) {
                e.preventDefault();
                this.changeDirection(dir);
            }
            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
                this.togglePause();
            }
        },
        drawCanvas() {
            const canvas = this.$refs.gameCanvas;
            if (!canvas || this.canvasSize === 0) return;

            canvas.width = this.canvasSize;
            canvas.height = this.canvasSize;

            const ctx = canvas.getContext('2d');
            const size = this.canvasSize / this.gridSize;
            const padding = Math.max(1.5, size * 0.08);

            ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);

            // 柔和的渐变背景
            const bgGradient = ctx.createLinearGradient(0, 0, this.canvasSize, this.canvasSize);
            bgGradient.addColorStop(0, '#f8f0f5');
            bgGradient.addColorStop(0.5, '#fceef4');
            bgGradient.addColorStop(1, '#f5e8ee');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

            // 网格背景
            const colors = ['rgba(255,240,245,0.4)', 'rgba(255,230,238,0.4)'];
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    ctx.fillStyle = colors[(i + j) % 2];
                    ctx.fillRect(i * size, j * size, size, size);
                }
            }

            // 绘制食物
            this.drawFood(ctx, size);

            // 绘制蛇
            this.drawSnake(ctx, size, padding);

            // 游戏结束时显示游戏结束信息（在画布上直接绘制）
            if (this.gameOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.font = `bold ${this.canvasSize * 0.12}px "Comic Sans MS", cursive, sans-serif`;
                ctx.fillText('😢', this.canvasSize / 2, this.canvasSize / 2 - this.canvasSize * 0.05);
                ctx.fillStyle = 'rgba(232, 67, 84, 0.9)';
                ctx.font = `bold ${this.canvasSize * 0.07}px "Comic Sans MS", cursive, sans-serif`;
                ctx.fillText('游戏结束', this.canvasSize / 2, this.canvasSize / 2 + this.canvasSize * 0.12);
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.font = `${this.canvasSize * 0.05}px "Comic Sans MS", cursive, sans-serif`;
                ctx.fillText(`得分: ${this.score}`, this.canvasSize / 2, this.canvasSize / 2 + this.canvasSize * 0.22);
            }

            // 暂停时显示暂停标识（在画布上直接绘制）
            if (this.isPaused && !this.gameOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.06)';
                ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.font = `bold ${this.canvasSize * 0.12}px "Comic Sans MS", cursive, sans-serif`;
                ctx.fillText('⏸️', this.canvasSize / 2, this.canvasSize / 2);
                ctx.fillStyle = 'rgba(180, 90, 120, 0.6)';
                ctx.font = `${this.canvasSize * 0.055}px "Comic Sans MS", cursive, sans-serif`;
                ctx.fillText('已暂停', this.canvasSize / 2, this.canvasSize / 2 + this.canvasSize * 0.13);
            }
        },
        drawFood(ctx, size) {
            const fx = this.food.x * size + size / 2;
            const fy = this.food.y * size + size / 2 - size * 0.03;
            const foodSize = size * 0.42;

            ctx.shadowColor = 'rgba(255, 80, 80, 0.3)';
            ctx.shadowBlur = size * 0.15;

            const glowGradient = ctx.createRadialGradient(fx, fy, 0, fx, fy, foodSize * 1.8);
            glowGradient.addColorStop(0, 'rgba(255,107,129,0.15)');
            glowGradient.addColorStop(1, 'rgba(255,107,129,0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(fx, fy, foodSize * 1.8, 0, Math.PI * 2);
            ctx.fill();

            const gradient = ctx.createRadialGradient(fx - foodSize * 0.2, fy - foodSize * 0.3, foodSize * 0.2, fx, fy, foodSize);
            gradient.addColorStop(0, '#ff6b81');
            gradient.addColorStop(0.7, '#e84354');
            gradient.addColorStop(1, '#c0392b');
            ctx.shadowBlur = size * 0.12;
            ctx.beginPath();
            ctx.ellipse(fx, fy, foodSize, foodSize * 1.1, 0, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.beginPath();
            ctx.ellipse(fx - foodSize * 0.3, fy - foodSize * 0.4, foodSize * 0.3, foodSize * 0.2, -0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#2ed573';
            ctx.lineWidth = Math.max(2, size * 0.06);
            ctx.shadowBlur = size * 0.05;
            ctx.beginPath();
            ctx.moveTo(fx, fy - foodSize * 0.9);
            ctx.quadraticCurveTo(fx + foodSize * 0.4, fy - foodSize * 1.4, fx + foodSize * 0.15, fy - foodSize * 1.6);
            ctx.stroke();

            ctx.fillStyle = '#2ed573';
            ctx.shadowBlur = size * 0.08;
            ctx.beginPath();
            ctx.ellipse(fx + foodSize * 0.3, fy - foodSize * 1.25, foodSize * 0.35, foodSize * 0.2, 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,200,200,0.3)';
            for (let i = 0; i < 4; i++) {
                const angle = i * 1.2 + 0.5;
                const sx = fx + Math.cos(angle) * foodSize * 0.3;
                const sy = fy + Math.sin(angle) * foodSize * 0.35;
                ctx.beginPath();
                ctx.arc(sx, sy, Math.max(1.5, size * 0.04), 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.shadowBlur = 0;
        },
        drawSnake(ctx, size, padding) {
            this.snake.forEach((seg, index) => {
                const x = seg.x * size + padding;
                const y = seg.y * size + padding;
                const w = size - padding * 2;
                const radius = Math.max(4, size * 0.12);

                const gradient = ctx.createRadialGradient(
                    x + w * 0.3, y + w * 0.3, w * 0.1,
                    x + w / 2, y + w / 2, w / 2 + padding
                );

                if (index === 0) {
                    gradient.addColorStop(0, '#ff8a9e');
                    gradient.addColorStop(0.6, '#e84354');
                    gradient.addColorStop(1, '#c0392b');
                } else {
                    const bright = 0.7 + (index / this.snake.length) * 0.3;
                    gradient.addColorStop(0, `rgba(255, 138, 158, ${bright})`);
                    gradient.addColorStop(0.6, `rgba(232, 67, 84, ${bright * 0.9})`);
                    gradient.addColorStop(1, `rgba(192, 57, 43, ${bright * 0.7})`);
                }

                ctx.shadowColor = 'rgba(232, 67, 84, 0.2)';
                ctx.shadowBlur = size * 0.08;
                ctx.fillStyle = gradient;

                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + w - radius, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
                ctx.lineTo(x + w, y + w - radius);
                ctx.quadraticCurveTo(x + w, y + w, x + w - radius, y + w);
                ctx.lineTo(x + radius, y + w);
                ctx.quadraticCurveTo(x, y + w, x, y + w - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.fill();

                if (index > 0 && index % 2 === 0) {
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = 'rgba(255,255,255,0.12)';
                    const dotSize = Math.max(2, size * 0.05);
                    ctx.beginPath();
                    ctx.arc(x + w * 0.3, y + w * 0.35, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x + w * 0.7, y + w * 0.65, dotSize * 0.7, 0, Math.PI * 2);
                    ctx.fill();
                }

                if (index === 0) {
                    ctx.shadowBlur = 0;
                    const eyeSize = Math.max(4, size * 0.08);
                    const pupilSize = Math.max(2.5, size * 0.055);

                    let eyeOffsets = [];
                    const offset = size * 0.12;
                    if (this.direction === 'right') {
                        eyeOffsets = [{ dx: offset, dy: -offset * 0.8 }, { dx: offset, dy: offset * 0.8 }];
                    } else if (this.direction === 'left') {
                        eyeOffsets = [{ dx: -offset, dy: -offset * 0.8 }, { dx: -offset, dy: offset * 0.8 }];
                    } else if (this.direction === 'up') {
                        eyeOffsets = [{ dx: -offset * 0.8, dy: -offset }, { dx: offset * 0.8, dy: -offset }];
                    } else {
                        eyeOffsets = [{ dx: -offset * 0.8, dy: offset }, { dx: offset * 0.8, dy: offset }];
                    }

                    ctx.fillStyle = 'white';
                    eyeOffsets.forEach(offset => {
                        ctx.beginPath();
                        ctx.arc(x + w / 2 + offset.dx, y + w / 2 + offset.dy, eyeSize, 0, Math.PI * 2);
                        ctx.fill();
                    });

                    ctx.fillStyle = '#2d3436';
                    eyeOffsets.forEach(offset => {
                        const pdx = this.direction === 'right' ? pupilSize * 0.5 : this.direction === 'left' ? -pupilSize * 0.5 : 0;
                        const pdy = this.direction === 'down' ? pupilSize * 0.5 : this.direction === 'up' ? -pupilSize * 0.5 : 0;
                        ctx.beginPath();
                        ctx.arc(x + w / 2 + offset.dx + pdx, y + w / 2 + offset.dy + pdy, pupilSize, 0, Math.PI * 2);
                        ctx.fill();
                    });

                    ctx.fillStyle = 'rgba(255,255,255,0.6)';
                    eyeOffsets.forEach(offset => {
                        const pdx = this.direction === 'right' ? pupilSize * 0.8 : this.direction === 'left' ? -pupilSize * 0.2 : pupilSize * 0.2;
                        const pdy = this.direction === 'down' ? pupilSize * 0.8 : this.direction === 'up' ? -pupilSize * 0.2 : pupilSize * 0.2;
                        ctx.beginPath();
                        ctx.arc(x + w / 2 + offset.dx + pdx - pupilSize * 0.2, y + w / 2 + offset.dy + pdy - pupilSize * 0.3, pupilSize * 0.4, 0, Math.PI * 2);
                        ctx.fill();
                    });

                    ctx.fillStyle = 'rgba(255, 150, 150, 0.35)';
                    const blushSize = Math.max(3, size * 0.06);
                    ctx.beginPath();
                    ctx.ellipse(x + w - size * 0.1, y + w / 2 - size * 0.12, blushSize, blushSize * 0.7, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.ellipse(x + w - size * 0.1, y + w / 2 + size * 0.12, blushSize, blushSize * 0.7, 0, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = '#c0392b';
                    ctx.lineWidth = Math.max(1.5, size * 0.04);
                    const smileSize = Math.max(3, size * 0.08);
                    ctx.beginPath();
                    if (this.direction === 'right' || this.direction === 'left') {
                        const mx = this.direction === 'right' ? x + w - size * 0.05 : x + size * 0.05;
                        ctx.arc(mx, y + w / 2, smileSize, 0.1, Math.PI - 0.1);
                    } else {
                        const my = this.direction === 'down' ? y + w - size * 0.05 : y + size * 0.05;
                        ctx.arc(x + w / 2, my, smileSize, 0.1, Math.PI - 0.1);
                    }
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
            });
        }
    },
    watch: {
        gameOver() {
            if (this.gameOver) {
                this.drawCanvas();
            }
        }
    }
};
</script>
  
<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html,
body {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.snake-game {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background: linear-gradient(145deg, #f5e6ec 0%, #ebd3de 50%, #e8d5d8 100%);
    font-family: 'Comic Sans MS', 'Chalkboard SE', 'Helvetica Neue', cursive, sans-serif;
    user-select: none;
    touch-action: none;
    overflow: hidden;
    padding: 0;
}

.game-container {
    background: rgba(255, 248, 250, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 0;
    padding: 12px 16px 16px;
    box-shadow: none;
    width: 100%;
    height: 100%;
    position: relative;
    border: none;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px 10px 4px;
    flex-shrink: 0;
}

.title {
    font-size: clamp(18px, 3.5vw, 24px);
    font-weight: bold;
    color: #b05a7a;
    text-shadow: 0 2px 4px rgba(180, 90, 120, 0.12);
    letter-spacing: 0.5px;
}

.score {
    font-size: clamp(16px, 3vw, 20px);
    color: #b05a7a;
    background: rgba(255, 255, 255, 0.5);
    padding: 4px 14px;
    border-radius: 24px;
    font-weight: bold;
    box-shadow: inset 0 1px 4px rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(4px);
}

.canvas-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(150, 100, 120, 0.08);
    flex: 1;
    position: relative;
    min-height: 0;
    width: 100%;
}

.game-canvas {
    display: block;
    background: #f8f0f5;
    border-radius: 20px;
    touch-action: none;
    cursor: pointer;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding-top: 10px;
    flex-shrink: 0;
}

.action-btn {
    flex: 1;
    max-width: 140px;
    padding: 8px 16px;
    border: none;
    border-radius: 28px;
    font-size: clamp(13px, 2.5vw, 16px);
    font-weight: bold;
    color: white;
    background: linear-gradient(145deg, #c97a9a, #b05a7a);
    box-shadow: 0 4px 16px rgba(180, 90, 120, 0.18);
    transition: all 0.2s ease;
    cursor: pointer;
    font-family: inherit;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    letter-spacing: 0.5px;
}

.action-btn:active {
    transform: scale(0.94);
    box-shadow: 0 2px 8px rgba(180, 90, 120, 0.1);
}

.action-btn.restart {
    background: linear-gradient(145deg, #8fb5d4, #6b8fa8);
    box-shadow: 0 4px 16px rgba(107, 143, 168, 0.18);
}

.action-btn.pause {
    background: linear-gradient(145deg, #d4a0b8, #b8829a);
    box-shadow: 0 4px 16px rgba(184, 130, 154, 0.18);
}

/* 小屏优化 */
@media (max-width: 420px) {
    .game-container {
        padding: 8px 10px 12px;
    }

    .header {
        padding: 0 2px 8px 2px;
    }

    .actions {
        gap: 10px;
        padding-top: 8px;
    }

    .action-btn {
        padding: 6px 12px;
        max-width: 110px;
        font-size: 12px;
    }
}

/* 横屏优化 */
@media (orientation: landscape) and (max-height: 500px) {
    .game-container {
        padding: 6px 12px 8px;
    }

    .header {
        padding: 0 2px 6px 2px;
    }

    .title {
        font-size: 16px;
    }

    .score {
        font-size: 14px;
        padding: 2px 10px;
    }

    .actions {
        padding-top: 6px;
    }

    .action-btn {
        padding: 4px 10px;
        font-size: 12px;
        max-width: 100px;
    }
}
</style>