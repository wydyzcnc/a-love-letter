<template>
    <div id="music-player">
        <!-- 顶部导航 -->
        <header class="player-header">
            <span class="header-icon"></span>
            <span class="header-title"></span>
            <span class="header-icon"></span>
        </header>

        <!-- 专辑封面与旋转动画 -->
        <div class="cover-wrapper">
            <div class="cover-spin" :class="{ playing: isPlaying }">
                <img :src="currentTrack.cover" alt="封面" class="cover-image" />
            </div>
        </div>

        <!-- 歌曲信息 -->
        <div class="song-info">
            <h2 class="song-name">{{ currentTrack.name }}</h2>
            <p class="song-artist">{{ currentTrack.artist }}</p>
        </div>

        <!-- 进度条 -->
        <div class="progress-wrapper">
            <span class="time current">{{ currentTimeFormatted }}</span>
            <div class="progress-bar" @click="seekProgress">
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
            </div>
            <span class="time duration">{{ durationFormatted }}</span>
        </div>

        <!-- 控制按钮 -->
        <div class="controls">
            <button class="ctrl-btn" @click="prevTrack">⏮</button>
            <button class="ctrl-btn play-btn" @click="togglePlay">
                {{ isPlaying ? '⏸' : '▶' }}
            </button>
            <button class="ctrl-btn" @click="nextTrack">⏭</button>
        </div>

        <!-- 底部播放列表（折叠） -->
        <div class="playlist-toggle" @click="showPlaylist = !showPlaylist">
            <span>{{ showPlaylist ? '✨ 收起歌单' : '🌸 展开歌单' }}</span>
        </div>
        <ul class="playlist" v-show="showPlaylist">
            <li v-for="(track, index) in tracks" :key="index" @click="selectTrack(index)"
                :class="{ active: index === currentTrackIndex }">
                <span>{{ track.name }}</span>
                <span>{{ track.artist }}</span>
            </li>
        </ul>
    </div>
</template>
  
<script>
export default {
    name: 'MusicPlayer',
    data() {
        return {
            tracks: [
                {
                    name: '‌爱的就是你',
                    artist: '布布',
                    cover: '/static/pic/home/aidejiushini.jpg',
                    url: '/static/mp3/home/aidejiushini.mp3'
                },
                {
                    name: '‌半壶纱 ',
                    artist: '一二',
                    cover: '/static/pic/home/banhusha.jpg',
                    url: '/static/mp3/home/banhusha.mp3'
                },
                {
                    name: '‌宝贝',
                    artist: '布布',
                    cover: '/static/pic/home/baobei.jpg',
                    url: '/static/mp3/home/baobei.mp3'
                },
                {
                    name: '‌不想上班',
                    artist: '一二',
                    cover: '/static/pic/home/buxiangsahngban.jpg',
                    url: '/static/mp3/home/buxiangsahngban.mp3'
                },
                {
                    name: '‌抽离',
                    artist: '一二',
                    cover: '/static/pic/home/chouli.jpg',
                    url: '/static/mp3/home/chouli.mp3'
                },
                {
                    name: '‌传奇',
                    artist: '一二',
                    cover: '/static/pic/home/chuanqi.jpg',
                    url: '/static/mp3/home/chuanqi.mp3'
                },
                {
                    name: '‌人间',
                    artist: '一二',
                    cover: '/static/pic/home/renjian.jpg',
                    url: '/static/mp3/home/renjian.mp3'
                },
                {
                    name: '‌大花轿',
                    artist: '布布',
                    cover: '/static/pic/home/dahuajiao.jpg',
                    url: '/static/mp3/home/dahuajiao.mp3'
                },
                {
                    name: '‌稻香',
                    artist: '布布',
                    cover: '/static/pic/home/daoxiang.jpg',
                    url: '/static/mp3/home/daoxiang.mp3'
                },
                {
                    name: '‌东秋忘咪',
                    artist: '一二',
                    cover: '/static/pic/home/dongqiuwangmi.jpg',
                    url: '/static/mp3/home/dongqiuwangmi.mp3'
                },
                {
                    name: '‌还有我',
                    artist: '布布',
                    cover: '/static/pic/home/haiyouwo.jpg',
                    url: '/static/mp3/home/haiyouwo.mp3'
                },
                {
                    name: '‌欧若拉',
                    artist: '一二',
                    cover: '/static/pic/home/ouruola.jpg',
                    url: '/static/mp3/home/ouruola.mp3'
                },
                {
                    name: '‌起风了',
                    artist: '布布',
                    cover: '/static/pic/home/qifengle.jpg',
                    url: '/static/mp3/home/qifengle.mp3'
                },
                {
                    name: '‌忍住',
                    artist: '一二',
                    cover: '/static/pic/home/renzhu.jpg',
                    url: '/static/mp3/home/renzhu.mp3'
                },
                {
                    name: '‌往后余生',
                    artist: '布布',
                    cover: '/static/pic/home/wanghouyusheng.jpg',
                    url: '/static/mp3/home/wanghouyusheng.mp3'
                },
                {
                    name: '‌西海情歌',
                    artist: '布布',
                    cover: '/static/pic/home/xihaiqingge.jpg',
                    url: '/static/mp3/home/xihaiqingge.mp3'
                },
                {
                    name: '‌纸短情长',
                    artist: '布布',
                    cover: '/static/pic/home/zhiduanqingchang.jpg',
                    url: '/static/mp3/home/zhiduanqingchang.mp3'
                },
                {
                    name: '‌最爱',
                    artist: '一二',
                    cover: '/static/pic/home/zuiai.jpg',
                    url: '/static/mp3/home/zuiai.mp3'
                },
                {
                    name: '‌做我老婆好不好',
                    artist: '布布',
                    cover: '/static/pic/home/zwlphbh.jpg',
                    url: '/static/mp3/home/zwlphbh.mp3'
                },
                {
                    name: '‌you will be next billionaire',
                    artist: '一二爱听的歌曲',
                    cover: '/static/pic/home/moneycome.jpg',
                    url: '/static/mp3/home/moneycome.mp3'
                }
            ],
            currentTrackIndex: 0,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            showPlaylist: true,
            audio: null
        };
    },
    computed: {
        currentTrack() {
            return this.tracks[this.currentTrackIndex] || this.tracks[0];
        },
        currentTimeFormatted() {
            return this.formatTime(this.currentTime);
        },
        durationFormatted() {
            return this.formatTime(this.duration);
        },
        progressPercent() {
            if (!this.duration) return 0;
            return (this.currentTime / this.duration) * 100;
        }
    },
    watch: {
        currentTrackIndex(newIndex) {
            this.loadTrack(newIndex);
        }
    },
    mounted() {
        this.$store.commit('UPDATE_PAGE_TITLE', '一二布布歌曲');

        this.audio = new Audio();
        this.audio.preload = 'metadata';
        this.loadTrack(this.currentTrackIndex);

        this.audio.addEventListener('timeupdate', this.updateTime);
        this.audio.addEventListener('loadedmetadata', this.setDuration);
        this.audio.addEventListener('ended', this.nextTrack);
    },
    beforeDestroy() {
        if (this.audio) {
            this.audio.removeEventListener('timeupdate', this.updateTime);
            this.audio.removeEventListener('loadedmetadata', this.setDuration);
            this.audio.removeEventListener('ended', this.nextTrack);
            this.audio.pause();
            this.audio.src = '';
        }
    },
    methods: {
        loadTrack(index) {
            if (!this.audio) return;
            const track = this.tracks[index];
            if (!track) return;
            this.audio.pause();
            this.isPlaying = false;
            this.audio.src = track.url;
            this.audio.load();
            this.currentTime = 0;
            this.duration = 0;
            // 自动播放（需用户手势触发，点击切换时由点击事件触发）
            this.audio.play().then(() => {
                this.isPlaying = true;
            }).catch(() => {
                this.isPlaying = false;
            });
        },
        togglePlay() {
            if (!this.audio) return;
            if (this.audio.paused) {
                this.audio.play().then(() => {
                    this.isPlaying = true;
                }).catch(() => {
                    this.isPlaying = false;
                });
            } else {
                this.audio.pause();
                this.isPlaying = false;
            }
        },
        prevTrack() {
            const newIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
            this.currentTrackIndex = newIndex;
        },
        nextTrack() {
            const newIndex = (this.currentTrackIndex + 1) % this.tracks.length;
            this.currentTrackIndex = newIndex;
        },
        selectTrack(index) {
            if (index === this.currentTrackIndex) {
                this.togglePlay();
                return;
            }
            this.currentTrackIndex = index;
        },
        seekProgress(event) {
            if (!this.audio || !this.duration) return;
            const bar = event.currentTarget;
            const rect = bar.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const percent = Math.min(1, Math.max(0, x / rect.width));
            this.audio.currentTime = percent * this.duration;
        },
        updateTime() {
            if (this.audio) {
                this.currentTime = this.audio.currentTime;
                this.duration = this.audio.duration || this.duration;
            }
        },
        setDuration() {
            if (this.audio) {
                this.duration = this.audio.duration;
            }
        },
        formatTime(time) {
            if (!time || isNaN(time)) return '0:00';
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        },
    }
};
</script>
  
<style scoped>
/* 全局重置 & 浪漫明亮风格 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    user-select: none;
}

body {
    font-family: 'Segoe UI', 'PingFang SC', Roboto, 'Helvetica Neue', sans-serif;
    background: #fce4ec;
    /* 柔和粉底 */
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    padding: 12px;
}

#music-player {
    max-width: 420px;
    width: 100%;
    height: 100vh;
    max-height: 780px;
    background: linear-gradient(145deg, #fff5f7, #ffe8ee);
    color: #4a2c3a;
    border-radius: 40px;
    padding: 24px 20px 28px;
    box-shadow: 0 20px 50px rgba(200, 120, 140, 0.25), 0 6px 18px rgba(255, 200, 210, 0.3);
    backdrop-filter: blur(2px);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow-y: auto;
    border: 1px solid rgba(255, 220, 230, 0.5);
    margin: 10px;
}

/* 顶部导航 - 浪漫色调 */
.player-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2px 14px 2px;
    font-size: 22px;
    font-weight: 300;
    color: #6b4c5a;
}

.header-icon {
    font-size: 30px;
    cursor: pointer;
    padding: 4px 10px;
    transition: 0.2s;
    color: #b27a8a;
}

.header-icon:active {
    opacity: 0.5;
    transform: scale(0.88);
}

.header-title {
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 1px;
    color: #a05f7a;
    background: rgba(255, 220, 230, 0.5);
    padding: 4px 18px;
    border-radius: 40px;
    backdrop-filter: blur(4px);
}

/* 封面 - 柔光效果 */
.cover-wrapper {
    width: 200px;
    height: 200px;
    margin: 6px 0 18px;
    border-radius: 50%;
    box-shadow: 0 12px 40px rgba(200, 120, 150, 0.35), 0 0 0 6px rgba(255, 220, 230, 0.4);
    background: #fce4ec;
    flex-shrink: 0;
}

.cover-spin {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    animation: spin 14s linear infinite;
    animation-play-state: paused;
    overflow: hidden;
    box-shadow: inset 0 0 20px rgba(255, 180, 200, 0.2);
}

.cover-spin.playing {
    animation-play-state: running;
}

.cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* 歌曲信息 - 温柔文字 */
.song-info {
    text-align: center;
    margin: 4px 0 14px;
    width: 100%;
}

.song-name {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    color: #4a2c3a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 80%;
    display: inline-block;
    text-shadow: 0 1px 4px rgba(255, 200, 210, 0.3);
}

.song-artist {
    font-size: 16px;
    color: #946f7e;
    font-weight: 300;
    letter-spacing: 0.3px;
}

/* 进度条 - 柔和配色 */
.progress-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 8px 0 16px;
}

.time {
    font-size: 14px;
    color: #946f7e;
    min-width: 40px;
    font-variant-numeric: tabular-nums;
    font-weight: 400;
}

.progress-bar {
    flex: 1;
    height: 5px;
    background: #f0d6de;
    border-radius: 20px;
    position: relative;
    cursor: pointer;
    touch-action: none;
    box-shadow: inset 0 1px 3px rgba(150, 100, 120, 0.1);
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f5a3b0, #e8849a);
    border-radius: 20px;
    width: 0%;
    transition: width 0.08s;
    box-shadow: 0 0 12px rgba(232, 132, 154, 0.3);
}

.progress-thumb {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 18px;
    height: 18px;
    background: radial-gradient(circle, #ffb3c6, #e8849a);
    border-radius: 50%;
    box-shadow: 0 0 16px rgba(232, 132, 154, 0.45);
    transition: left 0.08s;
    pointer-events: none;
    border: 2px solid rgba(255, 255, 255, 0.6);
}

/* 控制按钮 - 浪漫风格 */
.controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
    margin: 12px 0 18px;
}

.ctrl-btn {
    background: rgba(255, 220, 230, 0.5);
    border: none;
    color: #6b4c5a;
    font-size: 28px;
    cursor: pointer;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.15s;
    backdrop-filter: blur(4px);
    box-shadow: 0 4px 12px rgba(200, 120, 150, 0.15);
}

.ctrl-btn:active {
    transform: scale(0.85);
    background: rgba(255, 200, 210, 0.7);
}

.play-btn {
    font-size: 38px;
    background: linear-gradient(135deg, #f5a3b0, #e8849a);
    color: #fff;
    box-shadow: 0 8px 24px rgba(232, 132, 154, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.play-btn:active {
    background: linear-gradient(135deg, #e8849a, #d46f85);
    transform: scale(0.85);
}

/* 播放列表 - 浪漫折叠 */
.playlist-toggle {
    width: 100%;
    text-align: center;
    padding: 12px 0 8px;
    color: #b27a8a;
    font-size: 16px;
    cursor: pointer;
    border-top: 1px solid rgba(200, 150, 165, 0.25);
    margin-top: 4px;
    letter-spacing: 0.5px;
    font-weight: 400;
}

.playlist-toggle:active {
    opacity: 0.5;
}

.playlist {
    width: 100%;
    list-style: none;
    padding: 10px 0 4px;
    margin: 0;
    max-height: 200px;
    overflow-y: auto;
    border-top: 1px solid rgba(200, 150, 165, 0.2);
}

.playlist li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-radius: 30px;
    margin-bottom: 6px;
    background: rgba(255, 235, 240, 0.5);
    transition: 0.2s;
    cursor: pointer;
    font-size: 15px;
    color: #4a2c3a;
    backdrop-filter: blur(2px);
}

.playlist li:active {
    background: rgba(255, 200, 210, 0.5);
    transform: scale(0.97);
}

.playlist li.active {
    background: rgba(232, 132, 154, 0.25);
    color: #b85a7a;
    font-weight: 500;
    box-shadow: inset 0 0 0 1px rgba(232, 132, 154, 0.2);
}

.playlist li span:first-child {
    max-width: 70%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.playlist li span:last-child {
    color: #946f7e;
    font-size: 13px;
}

/* 滚动条美化 - 柔和 */
#music-player::-webkit-scrollbar {
    width: 4px;
}

#music-player::-webkit-scrollbar-track {
    background: rgba(255, 220, 230, 0.2);
    border-radius: 20px;
}

#music-player::-webkit-scrollbar-thumb {
    background: #e8849a;
    border-radius: 20px;
}

/* 小屏适配 */
@media (max-width: 440px) {
    .cover-wrapper {
        width: 160px;
        height: 160px;
    }

    .ctrl-btn {
        width: 52px;
        height: 52px;
        font-size: 24px;
    }

    .play-btn {
        font-size: 32px;
    }

    .song-name {
        font-size: 20px;
    }

    #music-player {
        padding: 18px 14px 22px;
        max-height: 700px;
    }
}
</style>