<template>
    <div class="love-letter">
        <!-- 背景音乐 -->
        <audio ref="bgAudio">
            <source :src="resultData.musicUrl" type="audio/mpeg">
            您的浏览器不支持音频播放。
        </audio>

        <!-- 音乐控制按钮 -->
        <button class="music-control" @click="toggleMusic" :class="{ playing: isPlaying }">
            <span v-if="isPlaying">⏸</span>
            <span v-else>▶</span>
        </button>

        <!-- 信纸装饰 -->
        <div class="letter-paper">
            <div class="seal"></div>
            <div class="content">
                <h1 class="title">{{ resultData.letterTitle }}</h1>
                <div class="body">
                    <p class="greeting">一二：</p>
                    <p v-for="(line, index) in poemLines" :key="index" class="poem-line"
                        :style="{ animationDelay: index * 0.3 + 's' }">
                        {{ line }}
                    </p>
                </div>
                <div class="signature">—— 永远爱你的布布</div>
                <div class="signa_date">{{ resultData.date }}</div>
            </div>
        </div>

        <!-- 装饰性飘落花瓣 -->
        <div v-for="n in 8" :key="n" class="petal" :style="petalStyle(n)"></div>
    </div>
</template>
  
<script>
export default {
    name: 'BuBuLetterPage',
    data() {
        return {
            isPlaying: false,
            petals: [],

            // 内容相关
            resultData: {},
            poemLines: ''
        };
    },
    mounted() {
        this.resultData = this.$route.query; // 赋值

        // 设置页面标题
        this.$store.commit('UPDATE_PAGE_TITLE', this.resultData.title);

        // 解析信件内容
        this.poemLines = this.parsePoemLines(this.resultData.poemLines);

        // 尝试自动播放
        const audio = this.$refs.bgAudio;
        if (!audio) {
            console.error('音频元素不存在');
            return;
        }
        audio.play().then(() => {
            this.isPlaying = true;
        }).catch(() => {
            // 若自动播放被拦截，点击页面任意位置触发播放
            const playAudio = () => {
                audio.play();
                this.isPlaying = true;
                document.removeEventListener('touchstart', playAudio);
                document.removeEventListener('click', playAudio);
            };
            document.addEventListener('touchstart', playAudio);
            document.addEventListener('click', playAudio);
        });
    },
    methods: {
        // ========== 工具方法 ==========
        parsePoemLines(data) {
            if (!data) return [];
            if (Array.isArray(data)) return data;
            return data.split('，').filter(line => line.trim());
        },

        toggleMusic() {
            const audio = this.$refs.bgAudio;
            if (this.isPlaying) {
                audio.pause();
                this.isPlaying = false;
            } else {
                audio.play();
                this.isPlaying = true;
            }
        },
        petalStyle(index) {
            const left = 5 + (index * 11) % 88;
            const delay = (index * 0.7) % 3.5;
            const size = 10 + (index % 4) * 5;
            const duration = 12 + (index % 3) * 4;
            return {
                left: left + '%',
                animationDelay: delay + 's',
                width: size + 'px',
                height: size + 'px',
                opacity: 0.4 + (index % 3) * 0.15,
                animationDuration: duration + 's'
            };
        }
    }
};
</script>
  
<style scoped>
/* 全局古风基调 - 明亮背景 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.love-letter {
    height: 86vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f2ebe1;
    /* 米白底 */
    background-image:
        radial-gradient(circle at 20% 30%, #faf3ea 0%, #e8ddd0 100%);
    padding: 16px;
    font-family: '华文楷体', 'KaiTi', '楷体', 'STKaiti', serif;
    position: relative;
    overflow: hidden;
}

/* 音乐控制按钮 */
.music-control {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 2px solid #b8a08a;
    background: rgba(248, 240, 230, 0.85);
    backdrop-filter: blur(6px);
    box-shadow: 0 4px 16px rgba(120, 80, 50, 0.2);
    font-size: 22px;
    color: #5a3f2b;
    cursor: pointer;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.music-control:hover {
    transform: scale(1.08);
    background: rgba(255, 248, 240, 0.95);
    box-shadow: 0 6px 24px rgba(120, 80, 50, 0.3);
}

.music-control:active {
    transform: scale(0.95);
}

.music-control.playing {
    border-color: #8b6b4a;
    background: rgba(245, 235, 220, 0.9);
}

/* 信纸卡片 - 明亮暖调 */
.letter-paper {
    max-width: 440px;
    width: 100%;
    background: #fcf7ef;
    background-image: linear-gradient(160deg, #fdf8f0 0%, #f5ede2 100%);
    border-radius: 24px 24px 32px 32px;
    padding: 32px 28px 40px;
    box-shadow:
        0 12px 40px rgba(100, 70, 40, 0.18),
        0 2px 0 0 #e8ddd0 inset,
        0 0 0 2px #f0e6d8 inset,
        0 0 0 4px #e6d9c8 inset;
    position: relative;
    transition: all 0.2s;
}

/* 火漆封印 - 暖红 */
.seal {
    width: 60px;
    height: 60px;
    background: #b54a3a;
    background: radial-gradient(circle at 35% 32%, #e0705a, #8f3a2a);
    border-radius: 50%;
    margin: -48px auto 16px;
    box-shadow:
        0 6px 20px rgba(140, 60, 40, 0.4),
        0 0 0 4px #e8d5bc,
        0 0 0 7px #d4b89a;
    position: relative;
    transition: all 0.3s;
}

.seal::after {
    content: "♡";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #faeedc;
    font-size: 30px;
    text-shadow: 0 2px 4px rgba(80, 30, 10, 0.3);
}

/* 内容排版 - 暖褐 */
.content {
    color: #3d2c1c;
    line-height: 1.9;
}

.title {
    text-align: center;
    font-size: 30px;
    font-weight: bold;
    letter-spacing: 10px;
    color: #4d3220;
    margin-bottom: 2px;
    text-shadow: 1px 1px 0 #e8dcc8;
}

.date {
    text-align: center;
    font-size: 14px;
    color: #8b6f54;
    letter-spacing: 6px;
    border-bottom: 1px dashed #cfbbaa;
    padding-bottom: 16px;
    margin-bottom: 22px;
}

.body p {
    text-indent: 2em;
    margin-bottom: 14px;
    font-size: 16.5px;
    letter-spacing: 0.8px;
    color: #3f2e1e;
}

.signature {
    text-align: right;
    margin-top: 28px;
    font-size: 15px;
    color: #6a4f3a;
    font-style: italic;
    border-top: 1px solid #dac8b8;
    padding-top: 18px;
    letter-spacing: 3px;
}

.signa_date {
    text-align: right;
    font-size: 12px;
    color: #6a4f3a;
    font-style: italic;
    letter-spacing: 3px;
}

/* 飘落花瓣 - 更柔和 */
.petal {
    position: fixed;
    top: -20px;
    border-radius: 50% 0 50% 50%;
    background: #f5d0c0;
    background: radial-gradient(circle at 30% 30%, #fce4d8, #eab8a0);
    box-shadow: 0 2px 12px rgba(180, 110, 80, 0.15);
    transform: rotate(45deg);
    animation: fall linear infinite;
    pointer-events: none;
    z-index: 5;
    opacity: 0.6;
}

@keyframes fall {
    0% {
        transform: translateY(-10vh) rotate(0deg) scale(0.6);
        opacity: 0.1;
    }

    15% {
        opacity: 0.8;
    }

    85% {
        opacity: 0.7;
    }

    100% {
        transform: translateY(110vh) rotate(720deg) scale(1.1);
        opacity: 0;
    }
}

/* 适配小屏手机 */
@media (max-width: 480px) {
    .letter-paper {
        padding: 24px 18px 32px;
    }

    .title {
        font-size: 26px;
        letter-spacing: 6px;
    }

    .body p {
        font-size: 15px;
    }

    .seal {
        width: 52px;
        height: 52px;
        margin-top: -42px;
    }

    .seal::after {
        font-size: 26px;
    }

    .music-control {
        width: 46px;
        height: 46px;
        font-size: 18px;
        top: 52px;
        right: 6px;
    }

    .greeting {
        font-size: 18px;
        font-weight: 600;
        color: #b34b6b;
        margin-bottom: 12px;
        text-align: left;
        padding-left: 6px;
    }

    .poem-line {
        font-size: 16px;
        line-height: 1.8;
        color: #5a3d44;
        padding: 2px 0;
        opacity: 0;
        animation: fadeInUp 0.6s forwards;
    }

}
</style>