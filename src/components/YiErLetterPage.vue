<template>
    <div class="love-letter-container" @click="handleUserInteraction" @touchstart="handleUserInteraction">
        <!-- 背景音乐 -->
        <audio ref="bgMusic" preload="auto" :loop="false">
            <source :src="resultData.musicUrl" type="audio/mpeg">
            您的浏览器不支持音频播放。
        </audio>

        <!-- 粉色背景装饰 -->
        <div class="bg-decorations">
            <span class="heart" v-for="n in 15" :key="n" :style="getRandomStyle()">❤️</span>
        </div>

        <!-- 主内容卡片 -->
        <div class="letter-card">
            <div class="envelope-icon">💌</div>
            <h1 class="title">{{ resultData.letterTitle }}</h1>
            <div class="content">
                <p class="greeting">布布：</p>
                <div class="message">
                    <p v-for="(line, index) in poemLines" :key="index" class="poem-line"
                        :style="{ animationDelay: index * 0.3 + 's' }">
                        {{ line }}
                    </p>
                </div>
                <p class="closing">—— 永远爱你的一二</p>
                <p class="date">{{ resultData.date }}</p>
            </div>
            <div class="music-control" @click.stop="toggleMusic">
                <span v-if="isPlaying">⏸️ 暂停音频</span>
                <span v-else-if="isLoading">⏳ 加载中...</span>
                <span v-else-if="hasError">🔇 点击播放</span>
                <span v-else>▶️ 播放音频</span>
            </div>
        </div>

        <!-- 浮动小元素 -->
        <div class="floating-icons">
            <span>🌸</span>
            <span>✨</span>
            <span>🦋</span>
            <span>🌷</span>
        </div>
    </div>
</template>
  
<script>
export default {
    name: 'LoveLetter',
    data() {
        return {
            // 音频相关
            isPlaying: false,
            isLoading: false,
            hasError: false,
            userInteracted: false,
            isComponentMounted: false,

            // 内容相关
            resultData: {},
            poemLines: ''
        }
    },
    mounted() {
        this.resultData = this.$route.query; // 赋值
        this.isComponentMounted = true;

        // 设置页面标题
        this.$store.commit('UPDATE_PAGE_TITLE', this.resultData.title);

        // 解析信件内容
        this.poemLines = this.parsePoemLines(this.resultData.poemLines);

        // 初始化音频
        if (this.resultData.musicUrl) {
            this.$nextTick(this.initAudio);
        }
    },
    methods: {
        // ========== 工具方法 ==========
        parsePoemLines(data) {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            return data.split('，').filter(line => line.trim());
        },

        // ========== 音频方法 ==========
        initAudio() {
            const audio = this.$refs.bgMusic;
            if (!audio) return;

            audio.volume = 0.8;
            audio.preload = 'auto';

            // 移除旧监听，避免重复
            ['canplaythrough', 'ended', 'error'].forEach(event => {
                audio.removeEventListener(event, this[`on${event.charAt(0).toUpperCase() + event.slice(1)}`]);
            });

            // 添加新监听
            audio.addEventListener('canplaythrough', this.onCanPlay);
            audio.addEventListener('ended', this.onMusicEnd);
            audio.addEventListener('error', this.onAudioError);

            audio.load();
            if (this.resultData.musicUrl) this.tryPlay();
        },

        async tryPlay() {
            const audio = this.$refs.bgMusic;
            if (!audio || !this.resultData.musicUrl || this.isPlaying) return;

            this.isLoading = true;
            this.hasError = false;

            try {
                audio.currentTime = 0;
                await audio.play();
                this.isPlaying = true;
                this.isLoading = false;
            } catch (err) {
                this.isPlaying = false;
                this.isLoading = false;
                this.hasError = err.name !== 'NotAllowedError' && err.name !== 'NotSupportedError';
                console.warn('⚠️ 音乐播放失败:', err.message);
            }
        },

        toggleMusic() {
            const audio = this.$refs.bgMusic;
            if (!audio) return;

            if (this.isPlaying) {
                audio.pause();
                this.isPlaying = false;
            } else {
                this.tryPlay();
            }
        },

        // 音频事件回调
        onCanPlay() {
            this.isLoading = false;
            if (this.userInteracted && !this.isPlaying && !this.hasError) {
                this.tryPlay();
            }
        },
        onMusicEnd() {
            this.isPlaying = false;
        },
        onAudioError() {
            this.isLoading = false;
            this.hasError = true;
            this.isPlaying = false;
        },

        // ========== 用户交互 ==========
        handleUserInteraction() {
            if (!this.userInteracted) {
                this.userInteracted = true;
                if (!this.isPlaying && !this.hasError) {
                    this.tryPlay();
                }
            }
        },

        // ========== 样式生成 ==========
        getRandomStyle() {
            const size = Math.floor(Math.random() * 20) + 10;
            const duration = Math.random() * 10 + 10;
            return {
                fontSize: size + 'px',
                left: Math.floor(Math.random() * 100) + '%',
                top: Math.floor(Math.random() * 100) + '%',
                animationDuration: duration + 's',
                animationDelay: Math.random() * 5 + 's',
                opacity: Math.random() * 0.3 + 0.2
            };
        },

        getPetalStyle() {
            const size = Math.random() * 20 + 15;
            return {
                width: size + 'px',
                height: size + 'px',
                left: Math.random() * 95 + '%',
                animationDelay: Math.random() * 10 + 's',
                animationDuration: (Math.random() * 8 + 6) + 's',
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: Math.random() * 0.3 + 0.5,
            };
        }
    },
    beforeDestroy() {
        this.isComponentMounted = false;
        const audio = this.$refs.bgMusic;
        if (audio) {
            ['canplaythrough', 'ended', 'error'].forEach(event => {
                audio.removeEventListener(event, this[`on${event.charAt(0).toUpperCase() + event.slice(1)}`]);
            });
            audio.pause();
            audio.src = '';
            audio.load();
        }
    }
}
</script>
  
<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* ========== 容器 ========== */
.love-letter-container {
    height: 87vh;
    width: 100%;
    background: linear-gradient(145deg, #ffe6f0 0%, #ffd9e6 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    position: relative;
    overflow: hidden;
    font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ========== 动态图片1：花瓣 ========== */
.dynamic-image.petals-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
}

.petal {
    position: absolute;
    top: -30px;
    animation: petalFall linear infinite;
    user-select: none;
    filter: drop-shadow(0 4px 8px rgba(255, 150, 180, 0.3));
    will-change: transform;
}

@keyframes petalFall {
    0% {
        transform: translateX(0) rotate(0deg) scale(1);
        opacity: 0.7;
    }

    25% {
        transform: translateX(30px) rotate(90deg) scale(1.1);
        opacity: 0.9;
    }

    50% {
        transform: translateX(-20px) rotate(180deg) scale(0.9);
        opacity: 0.8;
    }

    75% {
        transform: translateX(40px) rotate(270deg) scale(1.05);
        opacity: 0.6;
    }

    100% {
        transform: translateX(10px) rotate(360deg) scale(0.8);
        opacity: 0;
        top: calc(100% + 30px);
    }
}

/* ========== 动态图片2：爱心光晕 ========== */
.dynamic-image.heart-glow-container {
    position: absolute;
    width: 200px;
    height: 200px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 0;
    opacity: 0.3;
}

.heart-glow {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    animation: heartPulse 3s ease-in-out infinite;
    filter: drop-shadow(0 0 30px rgba(255, 50, 100, 0.5));
    will-change: transform;
}

@keyframes heartPulse {

    0%,
    100% {
        transform: scale(1) rotate(0deg);
        opacity: 0.3;
    }

    33% {
        transform: scale(1.3) rotate(5deg);
        opacity: 0.5;
    }

    66% {
        transform: scale(0.8) rotate(-5deg);
        opacity: 0.2;
    }
}

.glow-ring {
    position: absolute;
    width: 150%;
    height: 150%;
    top: -25%;
    left: -25%;
    border-radius: 50%;
    border: 3px solid rgba(255, 100, 150, 0.2);
    animation: ringPulse 4s ease-in-out infinite;
    pointer-events: none;
}

.glow-ring.ring-2 {
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    animation-delay: 1.5s;
    border-color: rgba(255, 150, 200, 0.15);
}

@keyframes ringPulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.3;
    }

    50% {
        transform: scale(1.2);
        opacity: 0.8;
    }
}

/* ========== 背景装饰 ========== */
.bg-decorations {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 1;
}

.heart {
    position: absolute;
    display: inline-block;
    animation: floatHeart linear infinite;
    user-select: none;
    text-shadow: 0 0 10px rgba(255, 100, 150, 0.3);
}

@keyframes floatHeart {
    0% {
        transform: translateY(0) rotate(0deg) scale(1);
        opacity: 0.2;
    }

    50% {
        transform: translateY(-80px) rotate(15deg) scale(1.2);
        opacity: 0.5;
    }

    100% {
        transform: translateY(-160px) rotate(-10deg) scale(0.9);
        opacity: 0.1;
    }
}

/* ========== 主卡片 ========== */
.letter-card {
    position: relative;
    z-index: 10;
    background: rgba(255, 245, 248, 0.92);
    backdrop-filter: blur(6px);
    border-radius: 60px 60px 40px 40px;
    padding: 30px 24px 40px;
    max-width: 420px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(255, 80, 120, 0.25),
        0 0 0 2px rgba(255, 255, 255, 0.6) inset,
        0 0 0 4px rgba(255, 180, 200, 0.3) inset;
    text-align: center;
    border: 1px solid rgba(255, 220, 230, 0.5);
    animation: cardAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cardAppear {
    0% {
        opacity: 0;
        transform: scale(0.8) translateY(30px);
    }

    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.envelope-icon {
    font-size: 48px;
    display: block;
    animation: bounceIcon 2s ease-in-out infinite;
}

@keyframes bounceIcon {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-8px);
    }
}

.title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 16px;
    letter-spacing: 2px;
    background: linear-gradient(135deg, #f0939e, #d43f6b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.content {
    background: rgba(255, 240, 245, 0.5);
    border-radius: 36px;
    padding: 20px 18px;
    border: 1px solid rgba(255, 200, 215, 0.4);
}

.greeting {
    font-size: 18px;
    font-weight: 600;
    color: #b34b6b;
    margin-bottom: 12px;
    text-align: left;
    padding-left: 6px;
}

.message {
    text-align: left;
}

.poem-line {
    font-size: 16px;
    line-height: 1.8;
    color: #5a3d44;
    padding: 2px 0;
    opacity: 0;
    animation: fadeInUp 0.6s forwards;
}

@keyframes fadeInUp {
    0% {
        opacity: 0;
        transform: translateY(12px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.closing {
    text-align: right;
    font-size: 16px;
    font-weight: 500;
    color: #b34b6b;
    margin-top: 16px;
    padding-right: 6px;
    font-style: italic;
}

.date {
    text-align: right;
    font-size: 13px;
    color: #b58a96;
    margin-top: 4px;
    padding-right: 6px;
    letter-spacing: 1px;
}

/* ========== 音乐控制 ========== */
.music-control {
    display: inline-block;
    margin-top: 14px;
    padding: 10px 24px;
    background: linear-gradient(135deg, #ffb3c6, #ff8fab);
    border-radius: 30px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    border: none;
    box-shadow: 0 4px 15px rgba(255, 80, 120, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
    min-width: 140px;
}

.music-control:hover {
    transform: scale(1.03);
    box-shadow: 0 6px 25px rgba(255, 80, 120, 0.4);
}

.music-control:active {
    transform: scale(0.95);
}

/* ========== 浮动图标 ========== */
.floating-icons {
    position: absolute;
    z-index: 5;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
}

.floating-icons span {
    position: absolute;
    font-size: 28px;
    animation: floatIcon 8s ease-in-out infinite;
    opacity: 0.6;
}

.floating-icons span:nth-child(1) {
    top: 10%;
    left: 8%;
    animation-delay: 0s;
}

.floating-icons span:nth-child(2) {
    top: 15%;
    right: 10%;
    animation-delay: 1.5s;
    font-size: 22px;
}

.floating-icons span:nth-child(3) {
    bottom: 20%;
    left: 12%;
    animation-delay: 3s;
    font-size: 32px;
}

.floating-icons span:nth-child(4) {
    bottom: 25%;
    right: 8%;
    animation-delay: 4.5s;
    font-size: 26px;
}

@keyframes floatIcon {

    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    50% {
        transform: translateY(-30px) rotate(8deg);
    }
}

/* ========== 响应式 ========== */
@media (max-width: 480px) {
    .letter-card {
        padding: 24px 18px 32px;
        border-radius: 40px 40px 30px 30px;
    }

    .title {
        font-size: 22px;
    }

    .poem-line {
        font-size: 15px;
        line-height: 1.7;
    }

    .greeting {
        font-size: 16px;
    }

    .envelope-icon {
        font-size: 40px;
    }

    .music-control {
        font-size: 14px;
        padding: 8px 20px;
        min-width: 120px;
    }

    .floating-icons span {
        font-size: 20px !important;
    }

    .dynamic-image.heart-glow-container {
        width: 120px;
        height: 120px;
    }

    .petal {
        width: 15px !important;
        height: 15px !important;
    }
}

@media (max-width: 380px) {
    .poem-line {
        font-size: 14px;
    }

    .title {
        font-size: 20px;
    }

    .content {
        padding: 16px 12px;
    }

    .music-control {
        font-size: 13px;
        padding: 6px 16px;
        min-width: 100px;
    }
}
</style>