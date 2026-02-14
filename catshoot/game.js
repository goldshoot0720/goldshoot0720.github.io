// ==========================================
// 喵布布的復仇 - Cat Revenge
// 一款精緻的HTML5射擊遊戲
// ==========================================

// 遊戲配置
const GAME_CONFIG = {
    width: 1200,
    height: 800,
    totalLevels: 37,
    playerSpeed: 300,
    playerHealth: 100,
    invincibleTime: 1000
};

// 精靈圖配置 (基於2400x1792的精靈圖)
// 三花貓主角 - 白色身體、黑色和橘色斑點
const SPRITE_CONFIG = {
    frameWidth: 250,
    frameHeight: 213,
    columns: 8,
    rows: 7,
    animations: {
        idle: { row: 0, frames: 8, speed: 8 },
        walk: { row: 1, frames: 8, speed: 10 },
        run: { row: 2, frames: 8, speed: 12 },
        jump: { row: 3, frames: 6, speed: 8 },
        attack: { row: 4, frames: 8, speed: 12 },
        hurt: { row: 5, frames: 6, speed: 8 },
        die: { row: 6, frames: 8, speed: 6 }
    }
};

// ==========================================
// 音頻管理器 - 程序化生成音效
// ==========================================
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.bgmOscillators = [];
        this.isPlayingBGM = false;
        this.bgmMuted = false;
        this.sfxMuted = false;
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.audioContext.destination);
            return true;
        } catch (e) {
            console.warn('Web Audio API 不支援:', e);
            return false;
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // 播放射擊音效
    playShootSound() {
        if (this.sfxMuted || !this.audioContext) return;
        this.resume();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // 播放爆炸音效
    playExplosionSound() {
        if (this.sfxMuted || !this.audioContext) return;
        this.resume();

        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.audioContext.createBufferSource();
        whiteNoise.buffer = buffer;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        filter.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.3);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        whiteNoise.start(this.audioContext.currentTime);
    }

    // 播放收集物品音效
    playCollectSound(type = 'fish') {
        if (this.sfxMuted || !this.audioContext) return;
        this.resume();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        const frequencies = type === 'heart' ? [523.25, 659.25, 783.99] : 
                           type === 'star' ? [880, 1100, 1320] : 
                           [440, 554.37, 659.25];

        oscillator.type = 'sine';
        
        let time = this.audioContext.currentTime;
        frequencies.forEach((freq, i) => {
            oscillator.frequency.setValueAtTime(freq, time + i * 0.05);
        });

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // 播放受傷音效
    playHurtSound() {
        if (this.sfxMuted || !this.audioContext) return;
        this.resume();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // 播放升級音效
    playPowerUpSound() {
        if (this.sfxMuted || !this.audioContext) return;
        this.resume();

        const frequencies = [440, 554.37, 659.25, 880, 1108.73];
        
        frequencies.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.type = 'triangle';
            oscillator.frequency.value = freq;

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + i * 0.05);
            gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + i * 0.05 + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.05 + 0.3);

            oscillator.start(this.audioContext.currentTime + i * 0.05);
            oscillator.stop(this.audioContext.currentTime + i * 0.05 + 0.3);
        });
    }

    // 播放BOSS警告音效
    playBossWarning() {
        if (this.sfxMuted || !this.audioContext) return;
        this.resume();

        for (let i = 0; i < 3; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime + i * 0.4);
            oscillator.frequency.linearRampToValueAtTime(55, this.audioContext.currentTime + i * 0.4 + 0.3);

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + i * 0.4);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.4 + 0.3);

            oscillator.start(this.audioContext.currentTime + i * 0.4);
            oscillator.stop(this.audioContext.currentTime + i * 0.4 + 0.3);
        }
    }

    // 播放勝利音效
    playVictorySound() {
        if (this.sfxMuted || !this.audioContext) return;
        this.resume();

        const melody = [
            { freq: 523.25, duration: 0.2 },
            { freq: 659.25, duration: 0.2 },
            { freq: 783.99, duration: 0.2 },
            { freq: 1046.50, duration: 0.4 },
            { freq: 783.99, duration: 0.2 },
            { freq: 1046.50, duration: 0.6 }
        ];

        let currentTime = this.audioContext.currentTime;
        
        melody.forEach((note) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.type = 'triangle';
            oscillator.frequency.value = note.freq;

            gainNode.gain.setValueAtTime(0.3, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);

            oscillator.start(currentTime);
            oscillator.stop(currentTime + note.duration);

            currentTime += note.duration;
        });
    }

    // 開始背景音樂
    startBGM() {
        if (this.bgmMuted || !this.audioContext || this.isPlayingBGM) return;
        this.resume();

        this.isPlayingBGM = true;
        this.playBGMSequence();
    }

    // BGM 序列
    playBGMSequence() {
        if (!this.isPlayingBGM) return;

        const melody = [
            { note: 440, duration: 0.4 }, { note: 0, duration: 0.1 },
            { note: 494, duration: 0.4 }, { note: 0, duration: 0.1 },
            { note: 523, duration: 0.4 }, { note: 0, duration: 0.1 },
            { note: 494, duration: 0.4 }, { note: 0, duration: 0.1 },
            { note: 440, duration: 0.4 }, { note: 0, duration: 0.1 },
            { note: 392, duration: 0.4 }, { note: 0, duration: 0.1 },
            { note: 440, duration: 0.8 }, { note: 0, duration: 0.2 }
        ];

        let currentTime = this.audioContext.currentTime;

        melody.forEach((m) => {
            if (m.note > 0) {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.masterGain);

                oscillator.type = 'sine';
                oscillator.frequency.value = m.note;

                gainNode.gain.setValueAtTime(0.1, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.05, currentTime + m.duration * 0.8);
                gainNode.gain.linearRampToValueAtTime(0, currentTime + m.duration);

                oscillator.start(currentTime);
                oscillator.stop(currentTime + m.duration);
            }
            currentTime += m.duration;
        });

        // 循環播放
        setTimeout(() => {
            if (this.isPlayingBGM) {
                this.playBGMSequence();
            }
        }, (currentTime - this.audioContext.currentTime) * 1000);
    }

    // 停止背景音樂
    stopBGM() {
        this.isPlayingBGM = false;
    }

    // 切換BGM靜音
    toggleBGMMute() {
        this.bgmMuted = !this.bgmMuted;
        if (this.bgmMuted) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.bgmMuted;
    }

    // 切換音效靜音
    toggleSFXMute() {
        this.sfxMuted = !this.sfxMuted;
        return this.sfxMuted;
    }
}

// 全局音頻管理器
const audioManager = new AudioManager();

// ==========================================
// 加載場景
// ==========================================
class LoadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadScene' });
    }

    preload() {
        // 創建加載進度條
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.querySelector('.loading-text');
        
        this.load.on('progress', (value) => {
            if (progressBar) progressBar.style.width = (value * 100) + '%';
        });

        this.load.on('fileprogress', (file) => {
            if (loadingText) loadingText.textContent = `🐱 正在載入: ${file.key}...`;
        });

        this.load.on('loaderror', (file) => {
            console.error('載入失敗:', file.key);
            if (loadingText) loadingText.textContent = `❌ 載入失敗: ${file.key}`;
        });

        // 加載精靈圖 (三花貓主角)
        this.load.spritesheet('catSprite', 'Gemini_Generated_Image_y3ookhy3ookhy3oo.png', {
            frameWidth: SPRITE_CONFIG.frameWidth,
            frameHeight: SPRITE_CONFIG.frameHeight
        });
    }

    create() {
        // 檢查精靈圖是否成功加載，如果沒有則創建備用精靈圖
        if (!this.textures.exists('catSprite')) {
            console.warn('精靈圖載入失敗，使用備用圖形');
            this.createFallbackCatTexture();
        }

        // 創建動態紋理 (在 create 階段確保場景已就緒)
        this.createDynamicTextures();
        
        // 創建動畫
        this.createAnimations();
        
        // 隱藏加載畫面
        const loading = document.getElementById('loading');
        if (loading) loading.classList.add('hidden');
        
        // 進入故事場景
        this.scene.start('StoryScene');
    }
    
    createFallbackCatTexture() {
        // 創建一個簡單的三花貓精靈圖作為備用
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        const frameWidth = SPRITE_CONFIG.frameWidth;
        const frameHeight = SPRITE_CONFIG.frameHeight;
        const columns = SPRITE_CONFIG.columns;
        const rows = SPRITE_CONFIG.rows;
        const scaleX = frameWidth / 300;
        const scaleY = frameHeight / 256;
        
        // 創建動畫 (簡化的貓咪圖形)
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const frame = row * columns + col;
                const offsetX = col * frameWidth;
                const offsetY = row * frameHeight;
            
                // 身體 (橢圓)
                graphics.fillStyle(0xffffff, 1);
                graphics.fillEllipse(offsetX + 75 * scaleX, offsetY + 80 * scaleY, 80 * scaleX, 50 * scaleY);
            
                // 頭 (圓形)
                graphics.fillCircle(offsetX + 75 * scaleX, offsetY + 50 * scaleY, 30 * scaleX);
            
                // 耳朵 (三角形)
                graphics.fillStyle(0xffaa88, 1);
                graphics.fillTriangle(offsetX + 55 * scaleX, offsetY + 30 * scaleY, offsetX + 65 * scaleX, offsetY + 10 * scaleY, offsetX + 70 * scaleX, offsetY + 35 * scaleY);
                graphics.fillTriangle(offsetX + 80 * scaleX, offsetY + 35 * scaleY, offsetX + 85 * scaleX, offsetY + 10 * scaleY, offsetX + 95 * scaleX, offsetY + 30 * scaleY);
            
                // 眼睛 (黑色小圓)
                graphics.fillStyle(0x000000, 1);
                graphics.fillCircle(offsetX + 65 * scaleX, offsetY + 45 * scaleY, 4 * scaleX);
                graphics.fillCircle(offsetX + 85 * scaleX, offsetY + 45 * scaleY, 4 * scaleX);
            
                // 鼻子 (粉色小圓)
                graphics.fillStyle(0xff8888, 1);
                graphics.fillCircle(offsetX + 75 * scaleX, offsetY + 55 * scaleY, 3 * scaleX);
            
                // 尾巴 (簡化為線條和圓形組合，不使用 quadraticCurveTo)
                const tailOffset = Math.sin(frame * 0.5) * 5 * scaleY;
                graphics.fillStyle(0xffffff, 1);
                // 用多個圓形組成尾巴
                graphics.fillCircle(offsetX + 110 * scaleX, offsetY + 80 * scaleY, 6 * scaleX);
                graphics.fillCircle(offsetX + 125 * scaleX, offsetY + 70 * scaleY + tailOffset, 5 * scaleX);
                graphics.fillCircle(offsetX + 138 * scaleX, offsetY + 55 * scaleY + tailOffset, 4 * scaleX);
            }
        }
        
        // 生成備用精靈圖
        graphics.generateTexture('catSprite', frameWidth * columns, frameHeight * rows);
    }

    createDynamicTextures() {
        // 玩家子彈紋理
        const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bulletGraphics.fillStyle(0xffaa00, 1);
        bulletGraphics.fillCircle(8, 8, 8);
        bulletGraphics.fillStyle(0xffff00, 0.8);
        bulletGraphics.fillCircle(8, 8, 5);
        bulletGraphics.generateTexture('bullet', 16, 16);

        // 強力子彈
        bulletGraphics.clear();
        bulletGraphics.fillStyle(0xff4400, 1);
        bulletGraphics.fillCircle(12, 12, 12);
        bulletGraphics.fillStyle(0xffaa00, 0.9);
        bulletGraphics.fillCircle(12, 12, 8);
        bulletGraphics.fillStyle(0xffffff, 1);
        bulletGraphics.fillCircle(12, 12, 4);
        bulletGraphics.generateTexture('powerBullet', 24, 24);

        // 敵人子彈
        bulletGraphics.clear();
        bulletGraphics.fillStyle(0x8800ff, 1);
        bulletGraphics.fillCircle(6, 6, 6);
        bulletGraphics.generateTexture('enemyBullet', 12, 12);

        // 小嘍囉敵人
        const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // 敵人類型1: 偷魚賊 (老鼠)
        enemyGraphics.fillStyle(0x888888, 1);
        enemyGraphics.fillEllipse(20, 25, 35, 25);
        enemyGraphics.fillStyle(0xff9999, 1);
        enemyGraphics.fillCircle(20, 15, 10);
        enemyGraphics.fillStyle(0x000000, 1);
        enemyGraphics.fillCircle(16, 12, 3);
        enemyGraphics.fillCircle(24, 12, 3);
        enemyGraphics.lineStyle(2, 0xff6666, 1);
        enemyGraphics.moveTo(15, 18);
        enemyGraphics.lineTo(25, 18);
        enemyGraphics.strokePath();
        // 耳朵
        enemyGraphics.fillStyle(0x888888, 1);
        enemyGraphics.fillTriangle(10, 8, 15, 0, 20, 8);
        enemyGraphics.fillTriangle(20, 8, 25, 0, 30, 8);
        // 尾巴 (簡化為圓形)
        enemyGraphics.fillStyle(0xff6666, 1);
        enemyGraphics.fillCircle(45, 15, 5);
        enemyGraphics.fillCircle(52, 12, 3);
        enemyGraphics.generateTexture('enemy_rat', 60, 50);

        // 敵人類型2: 打手 (惡犬)
        enemyGraphics.clear();
        enemyGraphics.fillStyle(0x8B4513, 1);
        enemyGraphics.fillEllipse(30, 35, 50, 40);
        enemyGraphics.fillStyle(0x654321, 1);
        enemyGraphics.fillCircle(30, 20, 18);
        enemyGraphics.fillStyle(0xff0000, 1);
        enemyGraphics.fillCircle(22, 15, 4);
        enemyGraphics.fillCircle(38, 15, 4);
        // 尖牙
        enemyGraphics.fillStyle(0xffffff, 1);
        enemyGraphics.fillTriangle(25, 28, 30, 38, 35, 28);
        enemyGraphics.fillStyle(0xff0000, 1);
        enemyGraphics.fillCircle(30, 30, 3);
        enemyGraphics.generateTexture('enemy_dog', 80, 70);

        // 敵人類型3: 飛行單位 (烏鴉)
        enemyGraphics.clear();
        enemyGraphics.fillStyle(0x333333, 1);
        enemyGraphics.fillEllipse(25, 20, 40, 25);
        enemyGraphics.fillCircle(40, 15, 12);
        enemyGraphics.fillStyle(0xffff00, 1);
        enemyGraphics.fillCircle(44, 12, 4);
        // 翅膀
        enemyGraphics.fillStyle(0x222222, 1);
        enemyGraphics.fillTriangle(10, 15, -10, 5, 10, 25);
        enemyGraphics.fillTriangle(40, 15, 60, 5, 40, 25);
        // 嘴巴
        enemyGraphics.fillStyle(0xffaa00, 1);
        enemyGraphics.fillTriangle(50, 15, 60, 18, 50, 21);
        enemyGraphics.generateTexture('enemy_bird', 80, 50);

        // 敵人類型4: 坦克型 (豬衛兵)
        enemyGraphics.clear();
        enemyGraphics.fillStyle(0xffaaaa, 1);
        enemyGraphics.fillEllipse(40, 40, 70, 60);
        enemyGraphics.fillStyle(0xff8888, 1);
        enemyGraphics.fillCircle(40, 25, 22);
        enemyGraphics.fillStyle(0x000000, 1);
        enemyGraphics.fillCircle(32, 22, 5);
        enemyGraphics.fillCircle(48, 22, 5);
        // 鼻子
        enemyGraphics.fillStyle(0xff6666, 1);
        enemyGraphics.fillEllipse(40, 32, 15, 10);
        enemyGraphics.fillStyle(0x442222, 1);
        enemyGraphics.fillCircle(36, 32, 2);
        enemyGraphics.fillCircle(44, 32, 2);
        // 盔甲
        enemyGraphics.lineStyle(4, 0x666666, 1);
        enemyGraphics.strokeEllipse(40, 40, 65, 55);
        enemyGraphics.generateTexture('enemy_pig', 100, 80);

        // BOSS 1: 偷魚首領 (狐狸)
        enemyGraphics.clear();
        enemyGraphics.fillStyle(0xff7722, 1);
        enemyGraphics.fillEllipse(60, 60, 100, 80);
        enemyGraphics.fillStyle(0xffaa66, 1);
        enemyGraphics.fillCircle(60, 35, 35);
        // 尖耳朵
        enemyGraphics.fillStyle(0xff7722, 1);
        enemyGraphics.fillTriangle(35, 15, 45, -15, 55, 15);
        enemyGraphics.fillTriangle(65, 15, 75, -15, 85, 15);
        // 狡猾的眼睛
        enemyGraphics.fillStyle(0xffff00, 1);
        enemyGraphics.fillEllipse(50, 30, 15, 10);
        enemyGraphics.fillEllipse(70, 30, 15, 10);
        enemyGraphics.fillStyle(0x000000, 1);
        enemyGraphics.fillCircle(52, 30, 4);
        enemyGraphics.fillCircle(68, 30, 4);
        // 大尾巴
        enemyGraphics.fillStyle(0xff7722, 1);
        enemyGraphics.fillEllipse(110, 50, 50, 30);
        enemyGraphics.fillStyle(0xffffff, 1);
        enemyGraphics.fillEllipse(125, 50, 25, 15);
        enemyGraphics.generateTexture('boss_fox', 160, 120);

        // BOSS 2: 護衛隊長 (狼人)
        enemyGraphics.clear();
        enemyGraphics.fillStyle(0x444444, 1);
        enemyGraphics.fillEllipse(70, 70, 120, 100);
        enemyGraphics.fillStyle(0x666666, 1);
        enemyGraphics.fillCircle(70, 40, 40);
        // 狼耳朵
        enemyGraphics.fillStyle(0x333333, 1);
        enemyGraphics.fillTriangle(40, 15, 55, -25, 70, 15);
        enemyGraphics.fillTriangle(70, 15, 85, -25, 100, 15);
        // 兇狠的眼睛
        enemyGraphics.fillStyle(0xff0000, 1);
        enemyGraphics.fillCircle(55, 35, 10);
        enemyGraphics.fillCircle(85, 35, 10);
        enemyGraphics.fillStyle(0xffff00, 1);
        enemyGraphics.fillCircle(55, 35, 5);
        enemyGraphics.fillCircle(85, 35, 5);
        // 獠牙
        enemyGraphics.fillStyle(0xffffff, 1);
        enemyGraphics.fillTriangle(55, 55, 60, 75, 65, 55);
        enemyGraphics.fillTriangle(75, 55, 80, 75, 85, 55);
        enemyGraphics.generateTexture('boss_wolf', 180, 140);

        // BOSS 3: 大將軍 (熊)
        enemyGraphics.clear();
        enemyGraphics.fillStyle(0x8B4513, 1);
        enemyGraphics.fillEllipse(80, 80, 150, 130);
        enemyGraphics.fillStyle(0xA0522D, 1);
        enemyGraphics.fillCircle(80, 45, 50);
        // 熊耳朵
        enemyGraphics.fillStyle(0x5D3A1A, 1);
        enemyGraphics.fillCircle(45, 15, 18);
        enemyGraphics.fillCircle(115, 15, 18);
        // 憤怒的眼睛
        enemyGraphics.lineStyle(4, 0x000000, 1);
        enemyGraphics.moveTo(55, 35);
        enemyGraphics.lineTo(75, 40);
        enemyGraphics.moveTo(105, 40);
        enemyGraphics.lineTo(85, 35);
        enemyGraphics.strokePath();
        enemyGraphics.fillStyle(0x000000, 1);
        enemyGraphics.fillCircle(65, 42, 8);
        enemyGraphics.fillCircle(95, 42, 8);
        // 大鼻子
        enemyGraphics.fillStyle(0x000000, 1);
        enemyGraphics.fillEllipse(80, 55, 20, 15);
        enemyGraphics.generateTexture('boss_bear', 220, 160);

        // BOSS 4: 最終BOSS (龍貓大王)
        enemyGraphics.clear();
        enemyGraphics.fillStyle(0x4a0080, 1);
        enemyGraphics.fillEllipse(100, 100, 200, 160);
        // 龍角
        enemyGraphics.fillStyle(0x800080, 1);
        enemyGraphics.fillTriangle(60, 40, 70, -20, 80, 40);
        enemyGraphics.fillTriangle(120, 40, 130, -20, 140, 40);
        // 魔法眼睛
        enemyGraphics.fillStyle(0x00ffff, 1);
        enemyGraphics.fillCircle(80, 70, 15);
        enemyGraphics.fillCircle(120, 70, 15);
        enemyGraphics.fillStyle(0xffffff, 1);
        enemyGraphics.fillCircle(82, 68, 6);
        enemyGraphics.fillCircle(122, 68, 6);
        // 魔法光環
        enemyGraphics.lineStyle(3, 0xff00ff, 0.8);
        enemyGraphics.strokeCircle(100, 50, 40);
        enemyGraphics.lineStyle(2, 0x00ffff, 0.6);
        enemyGraphics.strokeCircle(100, 50, 50);
        // 翅膀
        enemyGraphics.fillStyle(0x660099, 1);
        enemyGraphics.fillEllipse(30, 80, 60, 80);
        enemyGraphics.fillEllipse(170, 80, 60, 80);
        enemyGraphics.generateTexture('boss_dragon', 280, 200);

        // 收集品: 魚 (簡化繪製)
        const itemGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        itemGraphics.fillStyle(0xffaa00, 1);
        // 魚身 (橢圓)
        itemGraphics.fillEllipse(18, 20, 25, 18);
        // 魚尾 (三角形)
        itemGraphics.fillTriangle(30, 15, 38, 20, 30, 25);
        // 魚眼
        itemGraphics.fillStyle(0xffffff, 1);
        itemGraphics.fillCircle(12, 18, 4);
        itemGraphics.fillStyle(0x000000, 1);
        itemGraphics.fillCircle(12, 18, 2);
        itemGraphics.generateTexture('fish', 40, 40);

        // 愛心 (回血) - 簡化為兩個圓形加三角形
        itemGraphics.clear();
        itemGraphics.fillStyle(0xff0066, 1);
        itemGraphics.fillCircle(10, 10, 8);
        itemGraphics.fillCircle(20, 10, 8);
        itemGraphics.fillTriangle(2, 12, 28, 12, 15, 28);
        itemGraphics.generateTexture('heart', 30, 30);

        // 星星 (能量)
        itemGraphics.clear();
        itemGraphics.fillStyle(0xffff00, 1);
        const cx = 15, cy = 15, spikes = 5, outerRadius = 12, innerRadius = 5;
        let rot = Math.PI / 2 * 3;
        let x = cx, y = cy;
        let step = Math.PI / spikes;
        itemGraphics.beginPath();
        itemGraphics.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            itemGraphics.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            itemGraphics.lineTo(x, y);
            rot += step;
        }
        itemGraphics.lineTo(cx, cy - outerRadius);
        itemGraphics.closePath();
        itemGraphics.fillPath();
        itemGraphics.generateTexture('star', 30, 30);

        // 粒子紋理
        const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // 火焰粒子
        particleGraphics.fillStyle(0xffaa00, 1);
        particleGraphics.fillCircle(4, 4, 4);
        particleGraphics.generateTexture('particle_fire', 8, 8);

        // 煙霧粒子
        particleGraphics.clear();
        particleGraphics.fillStyle(0x888888, 0.8);
        particleGraphics.fillCircle(6, 6, 6);
        particleGraphics.generateTexture('particle_smoke', 12, 12);

        // 閃光粒子
        particleGraphics.clear();
        particleGraphics.fillStyle(0xffffff, 1);
        particleGraphics.fillCircle(3, 3, 3);
        particleGraphics.generateTexture('particle_spark', 6, 6);

        // 爆炸效果
        particleGraphics.clear();
        particleGraphics.fillStyle(0xff4400, 1);
        particleGraphics.fillCircle(16, 16, 16);
        particleGraphics.fillStyle(0xffaa00, 0.8);
        particleGraphics.fillCircle(16, 16, 10);
        particleGraphics.fillStyle(0xffff00, 0.6);
        particleGraphics.fillCircle(16, 16, 5);
        particleGraphics.generateTexture('explosion', 32, 32);
    }

    createAnimations() {
        // 從精靈圖創建動畫 (三花貓)
        const anims = this.anims;
        
        // 獲取精靈圖的幀數
        const texture = this.textures.get('catSprite');
        const frameCount = texture.frameTotal;
        const framesPerRow = SPRITE_CONFIG.columns;
        
        // 輔助函數：安全獲取幀
        const getFrames = (indices) => {
            return indices
                .filter(i => i < frameCount)
                .map(i => ({ key: 'catSprite', frame: i }));
        };
        const getRowFrames = (row, count) => {
            return getFrames(Array.from({ length: count }, (_, i) => row * framesPerRow + i));
        };
        
        // 待機動畫
        anims.create({
            key: 'cat_idle',
            frames: getRowFrames(SPRITE_CONFIG.animations.idle.row, SPRITE_CONFIG.animations.idle.frames),
            frameRate: SPRITE_CONFIG.animations.idle.speed,
            repeat: -1
        });

        // 行走動畫
        anims.create({
            key: 'cat_walk',
            frames: getRowFrames(SPRITE_CONFIG.animations.walk.row, SPRITE_CONFIG.animations.walk.frames),
            frameRate: SPRITE_CONFIG.animations.walk.speed,
            repeat: -1
        });

        // 奔跑動畫
        anims.create({
            key: 'cat_run',
            frames: getRowFrames(SPRITE_CONFIG.animations.run.row, SPRITE_CONFIG.animations.run.frames),
            frameRate: SPRITE_CONFIG.animations.run.speed,
            repeat: -1
        });

        // 跳躍動畫
        anims.create({
            key: 'cat_jump',
            frames: getRowFrames(SPRITE_CONFIG.animations.jump.row, SPRITE_CONFIG.animations.jump.frames),
            frameRate: SPRITE_CONFIG.animations.jump.speed,
            repeat: 0
        });

        // 攻擊動畫
        anims.create({
            key: 'cat_attack',
            frames: getRowFrames(SPRITE_CONFIG.animations.attack.row, SPRITE_CONFIG.animations.attack.frames),
            frameRate: SPRITE_CONFIG.animations.attack.speed,
            repeat: 0
        });

        // 受傷動畫
        anims.create({
            key: 'cat_hurt',
            frames: getRowFrames(SPRITE_CONFIG.animations.hurt.row, SPRITE_CONFIG.animations.hurt.frames),
            frameRate: SPRITE_CONFIG.animations.hurt.speed,
            repeat: 0
        });

        // 死亡動畫
        anims.create({
            key: 'cat_die',
            frames: getRowFrames(SPRITE_CONFIG.animations.die.row, SPRITE_CONFIG.animations.die.frames),
            frameRate: SPRITE_CONFIG.animations.die.speed,
            repeat: 0
        });
    }
}


// ==========================================
// 故事場景 - 開場劇情
// ==========================================
class StoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoryScene' });
    }

    create() {
        // 背景
        this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x1a1a2e).setOrigin(0);
        
        // 添加星空效果
        this.createStarfield();

        // 故事文字
        const storyTexts = [
            "很久很久以前...",
            "在一片祥和的貓咪村莊裡，",
            "住著一隻名叫「喵布布」的可愛三花貓。",
            "",
            "喵布布最愛的就是媽媽做的鮮魚大餐。",
            "每天最幸福的時刻，就是享用那美味的魚...",
            "",
            "然而，命運的齒輪開始轉動——",
            "",
            "一個風雨交加的夜晚，",
            "邪惡的「大Boss」帶領手下闖入村莊，",
            "偷走了所有貓咪的魚！",
            "",
            "當喵布布醒來時，",
            "只發現空蕩蕩的餐盤和一張挑戰書...",
            "",
            "「想要回你的魚？",
            "  就來我的黑暗城堡吧！",
            "  哈哈哈——」",
            "",
            "憤怒的喵布布握緊了拳頭，",
            "眼中燃起了復仇的火焰！",
            "",
            "「把我的魚...還給我！！！」"
        ];

        // 顯示故事
        this.storyContainer = this.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height);
        
        this.textObjects = [];
        storyTexts.forEach((text, index) => {
            const style = text === "" ? { fontSize: '20px' } : {
                fontSize: '24px',
                fontFamily: 'Microsoft JhengHei',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            };
            
            const txt = this.add.text(0, index * 40, text, style).setOrigin(0.5);
            txt.setAlpha(0);
            this.storyContainer.add(txt);
            this.textObjects.push(txt);
        });

        // 故事動畫
        this.currentLine = 0;
        this.showNextLine();

        // 點擊跳過
        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // 跳過提示
        this.add.text(GAME_CONFIG.width - 20, GAME_CONFIG.height - 30, '點擊跳過', {
            fontSize: '16px',
            fontFamily: 'Microsoft JhengHei',
            color: '#888888'
        }).setOrigin(1, 0.5);
    }

    createStarfield() {
        const graphics = this.add.graphics();
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, GAME_CONFIG.width);
            const y = Phaser.Math.Between(0, GAME_CONFIG.height);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.3, 1);
            graphics.fillStyle(0xffffff, alpha);
            graphics.fillCircle(x, y, size);
        }
    }

    showNextLine() {
        if (this.currentLine >= this.textObjects.length) {
            // 故事結束，延遲後進入菜單
            this.time.delayedCall(2000, () => {
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('MenuScene');
                });
            });
            return;
        }

        const txt = this.textObjects[this.currentLine];
        
        // 特殊處理標題
        if (txt.text === "「把我的魚...還給我！！！」") {
            txt.setStyle({
                fontSize: '36px',
                fontFamily: 'Microsoft JhengHei',
                color: '#ff4400',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            });
            
            // 震動效果
            this.cameras.main.shake(500, 0.01);
        }

        this.tweens.add({
            targets: txt,
            alpha: 1,
            y: txt.y - 10,
            duration: 500,
            ease: 'Power2'
        });

        this.currentLine++;
        
        // 滾動容器
        if (this.currentLine > 10) {
            this.tweens.add({
                targets: this.storyContainer,
                y: this.storyContainer.y - 40,
                duration: 500,
                ease: 'Power2'
            });
        }

        this.time.delayedCall(txt.text === "" ? 200 : 1500, () => {
            this.showNextLine();
        });
    }
}


// ==========================================
// 菜單場景
// ==========================================
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // 背景漸層
        const bg = this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x0f3460).setOrigin(0);
        
        // 動態背景效果
        this.createAnimatedBackground();

        // 標題
        const titleGroup = this.add.container(GAME_CONFIG.width / 2, 150);
        
        const mainTitle = this.add.text(0, 0, '喵布布的復仇', {
            fontSize: '72px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ffa500',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { blur: 20, color: '#ff6600', fill: true }
        }).setOrigin(0.5);

        const subTitle = this.add.text(0, 80, 'Cat Revenge', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            letterSpacing: 8
        }).setOrigin(0.5);

        titleGroup.add([mainTitle, subTitle]);

        // 標題動畫
        this.tweens.add({
            targets: titleGroup,
            y: 160,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 玩家預覽 (三花貓)
        const playerPreview = this.add.sprite(GAME_CONFIG.width / 2 - 200, 350, 'catSprite', 0);
        playerPreview.setScale(0.6);
        playerPreview.play('cat_idle');

        // 魚的圖標
        const fish = this.add.image(GAME_CONFIG.width / 2 + 200, 350, 'fish');
        fish.setScale(2);
        this.tweens.add({
            targets: fish,
            y: 340,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 箭頭動畫
        const arrow = this.add.text(GAME_CONFIG.width / 2, 350, '→', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.tweens.add({
            targets: arrow,
            x: GAME_CONFIG.width / 2 + 30,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // 按鈕
        this.createButton(GAME_CONFIG.width / 2, 500, '開始遊戲', () => {
            this.startGame();
        });

        this.createButton(GAME_CONFIG.width / 2, 580, '操作說明', () => {
            this.showInstructions();
        });

        this.createButton(GAME_CONFIG.width / 2, 660, '關卡選擇', () => {
            this.showLevelSelect();
        });

        // 版本信息
        this.add.text(GAME_CONFIG.width - 20, GAME_CONFIG.height - 20, 'v1.0 - 37關完整版', {
            fontSize: '14px',
            fontFamily: 'Microsoft JhengHei',
            color: '#666666'
        }).setOrigin(1, 0.5);

        // 播放背景音樂 (模擬)
        this.playAmbientSound();
    }

    createAnimatedBackground() {
        // 創建漂浮的粒子
        const particles = this.add.particles(0, 0, 'particle_spark', {
            x: { min: 0, max: GAME_CONFIG.width },
            y: { min: 0, max: GAME_CONFIG.height },
            lifespan: 3000,
            speedY: { min: -20, max: -50 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.6, end: 0 },
            quantity: 2,
            frequency: 100
        });
    }

    createButton(x, y, text, callback) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 280, 60, 0xffa500, 0.9);
        bg.setStrokeStyle(3, 0xff6600);
        
        const label = this.add.text(0, 0, text, {
            fontSize: '28px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5);

        container.add([bg, label]);
        container.setSize(280, 60);
        container.setInteractive({ useHandCursor: true });

        // 懸停效果
        container.on('pointerover', () => {
            bg.setFillStyle(0xffcc00, 1);
            container.setScale(1.05);
        });

        container.on('pointerout', () => {
            bg.setFillStyle(0xffa500, 0.9);
            container.setScale(1);
        });

        container.on('pointerdown', callback);

        return container;
    }

    startGame() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene', { level: 1 });
        });
    }

    showInstructions() {
        const overlay = this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.9).setOrigin(0);
        overlay.setInteractive();

        const container = this.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);

        const title = this.add.text(0, -200, '操作說明', {
            fontSize: '48px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ffa500'
        }).setOrigin(0.5);

        const instructions = [
            'WASD 或 方向鍵 - 移動喵布布',
            '',
            '滑鼠 - 瞄準',
            '左鍵 - 發射貓咪火球',
            '',
            '空白鍵 - 發動必殺技 (需能量滿)',
            '',
            '收集魚和星星來強化自己！',
            '擊敗所有敵人進入下一關！'
        ];

        const textLines = instructions.map((line, i) => {
            return this.add.text(0, -100 + i * 40, line, {
                fontSize: '24px',
                fontFamily: 'Microsoft JhengHei',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        });

        const closeText = this.add.text(0, 180, '點擊任意處關閉', {
            fontSize: '20px',
            fontFamily: 'Microsoft JhengHei',
            color: '#888888'
        }).setOrigin(0.5);

        container.add([title, ...textLines, closeText]);

        overlay.on('pointerdown', () => {
            overlay.destroy();
            container.destroy();
        });
    }

    showLevelSelect() {
        const overlay = this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.9).setOrigin(0);
        overlay.setInteractive();

        const container = this.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);

        const title = this.add.text(0, -280, '關卡選擇', {
            fontSize: '48px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ffa500'
        }).setOrigin(0.5);

        container.add(title);

        // 創建關卡按鈕網格
        const cols = 7;
        const rows = 6;
        const startX = -300;
        const startY = -150;
        const spacing = 100;

        for (let i = 0; i < GAME_CONFIG.totalLevels; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = startX + col * spacing;
            const y = startY + row * spacing;

            const levelBtn = this.createLevelButton(x, y, i + 1, () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('GameScene', { level: i + 1 });
                });
            });
            container.add(levelBtn);
        }

        const closeText = this.add.text(0, 280, '點擊任意空白處關閉', {
            fontSize: '20px',
            fontFamily: 'Microsoft JhengHei',
            color: '#888888'
        }).setOrigin(0.5);

        container.add(closeText);

        overlay.on('pointerdown', () => {
            overlay.destroy();
            container.destroy();
        });
    }

    createLevelButton(x, y, level, callback) {
        const container = this.add.container(x, y);
        
        const bg = this.add.circle(0, 0, 35, 0x333366);
        bg.setStrokeStyle(2, 0x6666ff);
        
        const label = this.add.text(0, 0, level.toString(), {
            fontSize: '24px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, label]);
        container.setSize(70, 70);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            bg.setFillStyle(0x6666ff);
            container.setScale(1.1);
        });

        container.on('pointerout', () => {
            bg.setFillStyle(0x333366);
            container.setScale(1);
        });

        container.on('pointerdown', callback);

        return container;
    }

    playAmbientSound() {
        // 這裡可以添加背景音樂
        // 為了簡化，我們暫時不實際播放音頻
    }
}


// ==========================================
// 遊戲主場景
// ==========================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.currentLevel = data.level || 1;
        this.playerHealth = GAME_CONFIG.playerHealth;
        this.playerMaxHealth = GAME_CONFIG.playerHealth;
        this.score = 0;
        this.energy = 0;
        this.maxEnergy = 100;
        this.powerLevel = 1;
        this.isGameOver = false;
        this.isPaused = false;
    }

    create() {
        // 初始化音頻
        audioManager.init();
        audioManager.startBGM();

        // 創建背景
        this.createBackground();

        // 創建玩家
        this.createPlayer();

        // 創建遊戲對象群組
        this.bullets = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.items = this.physics.add.group();
        this.particles = this.add.group();

        // 設置控制
        this.setupControls();

        // 創建UI
        this.createUI();

        // 開始關卡
        this.startLevel();

        // 設置碰撞
        this.setupCollisions();

        // 開始遊戲循環
        this.lastShotTime = 0;
        this.shotInterval = 200;
    }

    createBackground() {
        // 根據關卡選擇不同的背景
        const colors = [
            [0x1a1a3e, 0x2d2d5a], // 關卡 1-5: 夜晚
            [0x0d2b1d, 0x1a4a3a], // 關卡 6-10: 森林
            [0x3d1a1a, 0x5a2d2d], // 關卡 11-15: 火山
            [0x1a1a3e, 0x3a1a5a], // 關卡 16-20: 魔法
            [0x2d2d2d, 0x4a4a4a], // 關卡 21-25: 城堡
            [0x1a0d2d, 0x3a1a5a], // 關卡 26-30: 深淵
            [0x000000, 0x1a0d0d]  // 關卡 31-37: 最終
        ];
        
        const colorIndex = Math.min(Math.floor((this.currentLevel - 1) / 5), colors.length - 1);
        const [topColor, bottomColor] = colors[colorIndex];

        // 創建漸層背景
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(topColor, topColor, bottomColor, bottomColor, 1);
        graphics.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);

        // 添加背景裝飾
        this.createBackgroundDecorations(colorIndex);
    }

    createBackgroundDecorations(type) {
        const graphics = this.add.graphics();
        
        switch(type) {
            case 0: // 夜晚 - 星星
                for (let i = 0; i < 50; i++) {
                    const x = Phaser.Math.Between(0, GAME_CONFIG.width);
                    const y = Phaser.Math.Between(0, GAME_CONFIG.height / 2);
                    const alpha = Phaser.Math.FloatBetween(0.3, 1);
                    graphics.fillStyle(0xffffff, alpha);
                    graphics.fillCircle(x, y, Phaser.Math.Between(1, 2));
                }
                break;
            case 1: // 森林 - 樹木剪影
                for (let i = 0; i < 10; i++) {
                    const x = Phaser.Math.Between(0, GAME_CONFIG.width);
                    const h = Phaser.Math.Between(100, 200);
                    graphics.fillStyle(0x0a1a10, 0.5);
                    graphics.fillTriangle(x, GAME_CONFIG.height, x - 40, GAME_CONFIG.height - h, x + 40, GAME_CONFIG.height - h);
                }
                break;
            case 2: // 火山 - 岩漿
                graphics.fillStyle(0xff4400, 0.3);
                for (let i = 0; i < 5; i++) {
                    const x = Phaser.Math.Between(0, GAME_CONFIG.width);
                    graphics.fillCircle(x, GAME_CONFIG.height, Phaser.Math.Between(50, 100));
                }
                break;
        }
    }

    createPlayer() {
        // 創建三花貓主角
        this.player = this.physics.add.sprite(GAME_CONFIG.width / 2, GAME_CONFIG.height - 150, 'catSprite', 0);
        this.player.setCollideWorldBounds(true);
        // 幀尺寸調整，調整縮放比例
        this.player.setScale(0.5);
        this.player.play('cat_idle');

        // 玩家屬性
        this.player.invulnerable = false;
        this.player.speed = GAME_CONFIG.playerSpeed;
    }

    setupControls() {
        // 鍵盤控制
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            up2: Phaser.Input.Keyboard.KeyCodes.UP,
            down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right2: Phaser.Input.Keyboard.KeyCodes.RIGHT
        });

        // 滑鼠控制 (瞄準和射擊)
        this.input.on('pointermove', (pointer) => {
            if (!this.player || this.isGameOver) return;
            
            // 根據滑鼠位置翻轉角色
            if (pointer.x < this.player.x) {
                this.player.setFlipX(true);
            } else {
                this.player.setFlipX(false);
            }
        });

        this.input.on('pointerdown', (pointer) => {
            if (!this.isGameOver && pointer.leftButtonDown()) {
                this.fireBullet();
            }
        });
    }

    createUI() {
        // UI容器
        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setScrollFactor(0);
        this.uiContainer.setDepth(1000);

        // 關卡顯示
        this.levelText = this.add.text(20, 20, `關卡 ${this.currentLevel}`, {
            fontSize: '28px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ffa500',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.uiContainer.add(this.levelText);

        // 生命值條背景
        const hpBg = this.add.rectangle(150, 35, 204, 24, 0x000000, 0.8);
        hpBg.setOrigin(0, 0.5);
        this.uiContainer.add(hpBg);

        // 生命值條
        this.hpBar = this.add.rectangle(152, 35, 200, 20, 0xff0000, 1);
        this.hpBar.setOrigin(0, 0.5);
        this.uiContainer.add(this.hpBar);

        // 生命值文字
        this.hpText = this.add.text(250, 35, `${this.playerHealth}/${this.playerMaxHealth}`, {
            fontSize: '16px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.uiContainer.add(this.hpText);

        // 能量條背景
        const energyBg = this.add.rectangle(150, 65, 204, 24, 0x000000, 0.8);
        energyBg.setOrigin(0, 0.5);
        this.uiContainer.add(energyBg);

        // 能量條
        this.energyBar = this.add.rectangle(152, 65, 0, 20, 0x00aaff, 1);
        this.energyBar.setOrigin(0, 0.5);
        this.uiContainer.add(this.energyBar);

        // 能量文字
        this.energyText = this.add.text(250, 65, '必殺技', {
            fontSize: '16px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.uiContainer.add(this.energyText);

        // 分數顯示
        this.scoreText = this.add.text(GAME_CONFIG.width - 20, 35, `分數: ${this.score}`, {
            fontSize: '24px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0.5);
        this.uiContainer.add(this.scoreText);

        // 威力等級
        this.powerText = this.add.text(GAME_CONFIG.width - 20, 70, `威力 Lv.${this.powerLevel}`, {
            fontSize: '18px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ff6600'
        }).setOrigin(1, 0.5);
        this.uiContainer.add(this.powerText);

        // 暫停按鈕
        this.createPauseButton();
    }

    createPauseButton() {
        const btn = this.add.container(GAME_CONFIG.width / 2 - 180, 35);
        
        const bg = this.add.rectangle(0, 0, 80, 30, 0x333333, 0.9);
        bg.setStrokeStyle(2, 0x666666);
        
        const text = this.add.text(0, 0, '暫停', {
            fontSize: '18px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.add([bg, text]);
        btn.setSize(80, 30);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => bg.setFillStyle(0x555555));
        btn.on('pointerout', () => bg.setFillStyle(0x333333));
        btn.on('pointerdown', () => this.togglePause());

        this.uiContainer.add(btn);

        // 音效控制按鈕
        this.createAudioControls();
    }

    createAudioControls() {
        // BGM 按鈕
        const bgmBtn = this.add.container(GAME_CONFIG.width / 2 - 50, 35);
        const bgmBg = this.add.rectangle(0, 0, 60, 30, 0x333366, 0.9);
        bgmBg.setStrokeStyle(2, 0x6666ff);
        const bgmText = this.add.text(0, 0, '🎵', { fontSize: '18px' }).setOrigin(0.5);
        bgmBtn.add([bgmBg, bgmText]);
        bgmBtn.setSize(60, 30);
        bgmBtn.setInteractive({ useHandCursor: true });
        
        bgmBtn.on('pointerover', () => bgmBg.setFillStyle(0x555588));
        bgmBtn.on('pointerout', () => bgmBg.setFillStyle(0x333366));
        bgmBtn.on('pointerdown', () => {
            const muted = audioManager.toggleBGMMute();
            bgmText.setText(muted ? '🔇' : '🎵');
        });
        this.uiContainer.add(bgmBtn);

        // SFX 按鈕
        const sfxBtn = this.add.container(GAME_CONFIG.width / 2 + 20, 35);
        const sfxBg = this.add.rectangle(0, 0, 60, 30, 0x663333, 0.9);
        sfxBg.setStrokeStyle(2, 0xff6666);
        const sfxText = this.add.text(0, 0, '🔊', { fontSize: '18px' }).setOrigin(0.5);
        sfxBtn.add([sfxBg, sfxText]);
        sfxBtn.setSize(60, 30);
        sfxBtn.setInteractive({ useHandCursor: true });
        
        sfxBtn.on('pointerover', () => sfxBg.setFillStyle(0x885555));
        sfxBtn.on('pointerout', () => sfxBg.setFillStyle(0x663333));
        sfxBtn.on('pointerdown', () => {
            const muted = audioManager.toggleSFXMute();
            sfxText.setText(muted ? '🔇' : '🔊');
        });
        this.uiContainer.add(sfxBtn);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.physics.pause();
            this.showPauseMenu();
        } else {
            this.physics.resume();
            this.hidePauseMenu();
        }
    }

    showPauseMenu() {
        this.pauseOverlay = this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.7).setOrigin(0);
        this.pauseOverlay.setDepth(2000);

        this.pauseText = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 - 100, '遊戲暫停', {
            fontSize: '48px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.pauseText.setDepth(2001);

        // 繼續按鈕
        this.resumeBtn = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2, '繼續遊戲', {
            fontSize: '32px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffa500'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.resumeBtn.setDepth(2001);
        this.resumeBtn.on('pointerdown', () => this.togglePause());
        this.resumeBtn.on('pointerover', () => this.resumeBtn.setScale(1.1));
        this.resumeBtn.on('pointerout', () => this.resumeBtn.setScale(1));

        // 返回菜單按鈕
        this.menuBtn = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 80, '返回主選單', {
            fontSize: '32px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ff6666'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.menuBtn.setDepth(2001);
        this.menuBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        this.menuBtn.on('pointerover', () => this.menuBtn.setScale(1.1));
        this.menuBtn.on('pointerout', () => this.menuBtn.setScale(1));
    }

    hidePauseMenu() {
        if (this.pauseOverlay) this.pauseOverlay.destroy();
        if (this.pauseText) this.pauseText.destroy();
        if (this.resumeBtn) this.resumeBtn.destroy();
        if (this.menuBtn) this.menuBtn.destroy();
    }

    startLevel() {
        // 根據關卡配置敵人
        this.enemiesRemaining = this.getLevelEnemyCount();
        this.enemiesSpawned = 0;
        this.waveNumber = 0;
        this.maxWaves = this.getLevelWaveCount();

        // 顯示關卡開始提示
        this.showLevelStartMessage();

        // 開始生成敵人
        this.scheduleNextWave();

        // 隨機掉落能量星星
        this.energyDropTimer = this.time.addEvent({
            delay: Phaser.Math.Between(3000, 6000),
            callback: () => {
                if (this.isGameOver) return;
                this.spawnEnergyDrop();
                // 隨機下次掉落時間
                this.energyDropTimer.delay = Phaser.Math.Between(3000, 6000);
            },
            loop: true
        });
    }

    spawnEnergyDrop() {
        const x = Phaser.Math.Between(50, GAME_CONFIG.width - 50);
        const energyItem = this.items.create(x, -20, 'star');
        energyItem.setVelocityY(Phaser.Math.Between(80, 150));
        energyItem.itemType = 'energy';

        // 閃爍效果
        this.tweens.add({
            targets: energyItem,
            alpha: 0.5,
            duration: 300,
            yoyo: true,
            repeat: -1
        });
    }

    getLevelEnemyCount() {
        // 隨著關卡增加敵人數量
        return 5 + this.currentLevel * 3;
    }

    getLevelWaveCount() {
        return 2 + Math.floor(this.currentLevel / 3);
    }

    showLevelStartMessage() {
        const levelNames = [
            "初次出征", "鼠輩來襲", "黑夜危機", "森林迷蹤", "火山邊緣",
            "魔法禁地", "古老城堡", "深淵入口", "絕望之路", "龍貓之城",
            "迷霧重重", "烈焰試煉", "寒冰峽谷", "雷霆之怒", "暗影潛伏",
            "守衛阻擊", "突圍之戰", "逆風前行", "浴血奮戰", "黎明之前",
            "最後防線", "魔王親衛", "無盡深淵", "黑暗心臟", "王者對決",
            "真相大白", "最終決戰", "正義必勝", "還我魚來", "喵布布萬歲！"
        ];

        const levelName = levelNames[Math.min(this.currentLevel - 1, levelNames.length - 1)] || `第 ${this.currentLevel} 關`;

        const container = this.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);
        
        const bg = this.add.rectangle(0, 0, 500, 150, 0x000000, 0.8);
        bg.setStrokeStyle(3, 0xffa500);
        
        const levelNum = this.add.text(0, -30, `第 ${this.currentLevel} 關`, {
            fontSize: '36px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ffa500'
        }).setOrigin(0.5);

        const levelTitle = this.add.text(0, 20, levelName, {
            fontSize: '28px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, levelNum, levelTitle]);
        container.setDepth(3000);
        container.setAlpha(0);
        container.setScale(0.5);

        // 動畫
        this.tweens.add({
            targets: container,
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.out'
        });

        this.tweens.add({
            targets: container,
            alpha: 0,
            scale: 1.5,
            delay: 2000,
            duration: 500,
            onComplete: () => container.destroy()
        });
    }

    scheduleNextWave() {
        if (this.waveNumber >= this.maxWaves) return;

        const delay = 2000 + Math.random() * 3000;
        this.time.delayedCall(delay, () => {
            this.spawnWave();
        });
    }

    spawnWave() {
        if (this.isGameOver) return;

        this.waveNumber++;
        const enemiesInWave = Math.min(3 + Math.floor(this.currentLevel / 5), 8);

        for (let i = 0; i < enemiesInWave; i++) {
            this.time.delayedCall(i * 500, () => {
                this.spawnEnemy();
            });
        }

        if (this.waveNumber < this.maxWaves) {
            this.scheduleNextWave();
        }
    }

    spawnEnemy() {
        if (this.isGameOver) return;

        // 根據關卡選擇敵人類型
        const enemyTypes = this.getAvailableEnemyTypes();
        const enemyType = Phaser.Utils.Array.GetRandom(enemyTypes);

        // 生成位置
        const x = Phaser.Math.Between(50, GAME_CONFIG.width - 50);
        const y = -50;

        const enemy = this.enemies.create(x, y, enemyType);
        this.setupEnemy(enemy, enemyType);

        this.enemiesSpawned++;
    }

    getAvailableEnemyTypes() {
        const types = ['enemy_rat'];
        
        if (this.currentLevel >= 3) types.push('enemy_bird');
        if (this.currentLevel >= 6) types.push('enemy_dog');
        if (this.currentLevel >= 10) types.push('enemy_pig');
        
        return types;
    }

    setupEnemy(enemy, type) {
        enemy.setOrigin(0.5);
        
        switch(type) {
            case 'enemy_rat':
                enemy.health = 20 + this.currentLevel * 2;
                enemy.maxHealth = enemy.health;
                enemy.speed = 80 + Math.random() * 40;
                enemy.score = 100;
                enemy.setScale(1.2);
                break;
            case 'enemy_bird':
                enemy.health = 15 + this.currentLevel * 2;
                enemy.maxHealth = enemy.health;
                enemy.speed = 120 + Math.random() * 60;
                enemy.score = 150;
                enemy.setScale(1);
                enemy.isFlying = true;
                break;
            case 'enemy_dog':
                enemy.health = 40 + this.currentLevel * 3;
                enemy.maxHealth = enemy.health;
                enemy.speed = 100 + Math.random() * 30;
                enemy.score = 250;
                enemy.setScale(1.2);
                enemy.canShoot = true;
                enemy.shootInterval = 2000;
                enemy.lastShot = 0;
                break;
            case 'enemy_pig':
                enemy.health = 80 + this.currentLevel * 5;
                enemy.maxHealth = enemy.health;
                enemy.speed = 50 + Math.random() * 20;
                enemy.score = 500;
                enemy.setScale(1.3);
                enemy.isTank = true;
                break;
        }

        // 敵人行為
        enemy.movePattern = Math.floor(Math.random() * 3);
        enemy.initialX = enemy.x;
        enemy.timeOffset = Math.random() * Math.PI * 2;
    }

    setupCollisions() {
        // 玩家子彈擊中敵人
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            this.hitEnemy(enemy, bullet);
            bullet.destroy();
        });

        // 敵人子彈擊中玩家
        this.physics.add.overlap(this.player, this.enemyBullets, (player, bullet) => {
            if (!player.invulnerable) {
                this.hitPlayer(bullet.damage || 10);
                bullet.destroy();
                this.createExplosion(bullet.x, bullet.y, 0.5);
            }
        });

        // 玩家碰撞敵人
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            if (!player.invulnerable) {
                this.hitPlayer(20);
                this.hitEnemy(enemy, null, 50);
            }
        });

        // 收集物品
        this.physics.add.overlap(this.player, this.items, (player, item) => {
            this.collectItem(item);
        });
    }

    hitEnemy(enemy, bullet, damage) {
        const dmg = damage || (this.powerLevel * 10 + 10);
        enemy.health -= dmg;

        // 受傷閃爍
        this.tweens.add({
            targets: enemy,
            alpha: 0.5,
            duration: 50,
            yoyo: true,
            repeat: 2
        });

        // 傷害數字
        this.showDamageNumber(enemy.x, enemy.y, dmg);

        // 爆炸效果
        this.createExplosion(enemy.x, enemy.y, 0.3);

        if (enemy.health <= 0) {
            this.destroyEnemy(enemy);
        }
    }

    destroyEnemy(enemy) {
        // 大爆炸
        this.createExplosion(enemy.x, enemy.y, 1);

        // 播放爆炸音效
        audioManager.playExplosionSound();

        // 增加分數
        this.score += enemy.score;
        this.updateUI();

        // 掉落物品
        if (Math.random() < 0.3) {
            this.dropItem(enemy.x, enemy.y);
        }

        // 增加能量
        this.addEnergy(5);

        enemy.destroy();

        // 檢查關卡完成
        this.checkLevelComplete();
    }

    dropItem(x, y) {
        const rand = Math.random();
        let itemType = 'fish';
        
        if (rand < 0.1) itemType = 'heart';
        else if (rand < 0.2) itemType = 'star';

        const item = this.items.create(x, y, itemType);
        item.setVelocityY(50);
        item.itemType = itemType;
    }

    collectItem(item) {
        // 播放收集音效
        audioManager.playCollectSound(item.itemType);

        switch(item.itemType) {
            case 'fish':
                this.score += 50;
                this.addEnergy(10);
                this.showFloatingText(item.x, item.y, '+50', '#ffff00');
                break;
            case 'heart':
                this.healPlayer(20);
                this.showFloatingText(item.x, item.y, '+HP', '#ff0000');
                break;
            case 'star':
                this.powerLevel = Math.min(this.powerLevel + 1, 5);
                this.showFloatingText(item.x, item.y, 'POWER UP!', '#00ffff');
                this.powerText.setText(`威力 Lv.${this.powerLevel}`);
                // 播放升級音效
                audioManager.playPowerUpSound();
                break;
            case 'energy':
                this.addEnergy(25);
                this.showFloatingText(item.x, item.y, '能量 +25', '#00aaff');
                audioManager.playCollectSound('star');
                break;
        }

        item.destroy();
        this.updateUI();
    }

    showDamageNumber(x, y, damage) {
        const text = this.add.text(x, y, damage.toString(), {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 800,
            onComplete: () => text.destroy()
        });
    }

    showFloatingText(x, y, text, color) {
        const txt = this.add.text(x, y, text, {
            fontSize: '24px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: color,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: txt,
            y: y - 60,
            scale: 1.2,
            alpha: 0,
            duration: 1000,
            onComplete: () => txt.destroy()
        });
    }

    hitPlayer(damage) {
        this.playerHealth -= damage;
        this.player.invulnerable = true;

        // 播放受傷音效
        audioManager.playHurtSound();

        // 受傷動畫
        this.player.play('cat_hurt');

        // 閃爍效果
        this.tweens.add({
            targets: this.player,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.player.alpha = 1;
                this.player.invulnerable = false;
                this.player.play('cat_idle');
            }
        });

        // 螢幕震動
        this.cameras.main.shake(200, 0.01);

        // 創建爆炸
        this.createExplosion(this.player.x, this.player.y, 0.8);

        if (this.playerHealth <= 0) {
            this.gameOver();
        }

        this.updateUI();
    }

    healPlayer(amount) {
        this.playerHealth = Math.min(this.playerHealth + amount, this.playerMaxHealth);
        this.updateUI();
    }

    addEnergy(amount) {
        this.energy = Math.min(this.energy + amount, this.maxEnergy);
        this.updateUI();
    }

    updateUI() {
        // 更新生命值
        const hpPercent = this.playerHealth / this.playerMaxHealth;
        this.hpBar.width = 200 * hpPercent;
        this.hpBar.setFillStyle(hpPercent > 0.5 ? 0x00ff00 : hpPercent > 0.25 ? 0xffff00 : 0xff0000);
        this.hpText.setText(`${Math.ceil(this.playerHealth)}/${this.playerMaxHealth}`);

        // 更新能量
        const energyPercent = this.energy / this.maxEnergy;
        this.energyBar.width = 200 * energyPercent;
        this.energyBar.setFillStyle(energyPercent >= 1 ? 0xff00ff : 0x00aaff);

        // 更新分數
        this.scoreText.setText(`分數: ${this.score}`);
    }

    fireBullet() {
        const now = this.time.now;
        if (now - this.lastShotTime < this.shotInterval) return;
        this.lastShotTime = now;

        // 播放射擊音效
        audioManager.playShootSound();

        // 播放攻擊動畫
        this.player.play('cat_attack');
        this.time.delayedCall(300, () => {
            if (!this.isGameOver) this.player.play('cat_idle');
        });

        // 根據威力等級發射不同數量的子彈
        const bulletCount = Math.min(this.powerLevel, 5);
        const spreadAngle = 15;

        for (let i = 0; i < bulletCount; i++) {
            const angle = (i - (bulletCount - 1) / 2) * spreadAngle;
            this.createBullet(angle);
        }
    }

    createBullet(angleOffset = 0) {
        const bullet = this.bullets.create(this.player.x, this.player.y - 30, 'bullet');
        bullet.setScale(1 + this.powerLevel * 0.2);

        // 計算方向
        const pointer = this.input.activePointer;
        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            pointer.x, pointer.y
        ) + Phaser.Math.DegToRad(angleOffset);

        const speed = 600;
        bullet.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // 粒子尾跡
        this.createBulletTrail(bullet);
    }

    createBulletTrail(bullet) {
        const trail = this.time.addEvent({
            delay: 50,
            callback: () => {
                if (!bullet.active) {
                    trail.destroy();
                    return;
                }
                const spark = this.add.circle(bullet.x, bullet.y, 3, 0xffaa00, 0.6);
                this.tweens.add({
                    targets: spark,
                    scale: 0,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => spark.destroy()
                });
            },
            loop: true
        });
    }

    enemyShoot(enemy) {
        const now = this.time.now;
        if (now - enemy.lastShot < enemy.shootInterval) return;
        enemy.lastShot = now;

        const bullet = this.enemyBullets.create(enemy.x, enemy.y + 20, 'enemyBullet');
        
        // 瞄準玩家
        const angle = Phaser.Math.Angle.Between(
            enemy.x, enemy.y,
            this.player.x, this.player.y
        );

        const speed = 250;
        bullet.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        bullet.damage = 10;
    }

    createExplosion(x, y, scale = 1) {
        // 創建多個粒子
        const colors = [0xff4400, 0xffaa00, 0xffff00, 0xff6600];
        
        for (let i = 0; i < 10 * scale; i++) {
            const angle = (Math.PI * 2 * i) / (10 * scale);
            const speed = 100 + Math.random() * 150;
            const color = Phaser.Utils.Array.GetRandom(colors);
            
            const particle = this.add.circle(x, y, 5 * scale, color, 0.8);
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                scale: 0,
                alpha: 0,
                duration: 500 + Math.random() * 300,
                onComplete: () => particle.destroy()
            });
        }

        // 中心閃光
        const flash = this.add.circle(x, y, 20 * scale, 0xffffff, 1);
        this.tweens.add({
            targets: flash,
            scale: 2 * scale,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }

    checkLevelComplete() {
        // 檢查是否還有敵人
        if (this.enemies.countActive() === 0 && this.waveNumber >= this.maxWaves) {
            this.levelComplete();
        }
    }

    levelComplete() {
        // 停止物理
        this.physics.pause();

        // 播放勝利音效
        audioManager.playVictorySound();

        // 顯示勝利畫面
        const overlay = this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.7).setOrigin(0);
        overlay.setDepth(4000);

        const container = this.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);
        container.setDepth(4001);

        const victoryText = this.add.text(0, -50, '關卡完成！', {
            fontSize: '56px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const scoreText = this.add.text(0, 30, `本關分數: ${this.score}`, {
            fontSize: '28px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([victoryText, scoreText]);

        // 進入下一關或結束遊戲
        this.time.delayedCall(3000, () => {
            if (this.currentLevel >= GAME_CONFIG.totalLevels) {
                this.scene.start('VictoryScene', { score: this.score });
            } else {
                // 檢查是否是BOSS關卡
                if (this.currentLevel % 10 === 0) {
                    this.scene.start('BossScene', { 
                        level: this.currentLevel + 1,
                        score: this.score,
                        powerLevel: this.powerLevel
                    });
                } else {
                    this.scene.start('GameScene', { 
                        level: this.currentLevel + 1,
                        score: this.score,
                        powerLevel: this.powerLevel
                    });
                }
            }
        });
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause();

        // 停止背景音樂
        audioManager.stopBGM();

        // 播放死亡動畫
        this.player.play('cat_die');

        // 顯示遊戲結束畫面
        const overlay = this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.8).setOrigin(0);
        overlay.setDepth(5000);

        const container = this.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);
        container.setDepth(5001);

        const gameOverText = this.add.text(0, -80, '遊戲結束', {
            fontSize: '72px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        const levelText = this.add.text(0, 0, `關卡: ${this.currentLevel}`, {
            fontSize: '32px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffffff'
        }).setOrigin(0.5);

        const scoreText = this.add.text(0, 50, `最終分數: ${this.score}`, {
            fontSize: '32px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffff00'
        }).setOrigin(0.5);

        const restartText = this.add.text(0, 130, '點擊重新開始', {
            fontSize: '28px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffa500'
        }).setOrigin(0.5);

        container.add([gameOverText, levelText, scoreText, restartText]);

        // 閃爍動畫
        this.tweens.add({
            targets: restartText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // 點擊重新開始
        this.input.on('pointerdown', () => {
            this.scene.start('GameScene', { level: 1 });
        });
    }

    update(time, delta) {
        if (this.isGameOver || this.isPaused) return;

        // 玩家移動
        this.handlePlayerMovement(delta);

        // 必殺技
        if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
            this.useSpecialSkill();
        }

        // 更新敵人
        this.updateEnemies(time, delta);

        // 清理離開屏幕的對象
        this.cleanupObjects();
    }

    handlePlayerMovement(delta) {
        let vx = 0;
        let vy = 0;

        if (this.keys.left.isDown || this.keys.left2.isDown) vx = -1;
        if (this.keys.right.isDown || this.keys.right2.isDown) vx = 1;
        if (this.keys.up.isDown || this.keys.up2.isDown) vy = -1;
        if (this.keys.down.isDown || this.keys.down2.isDown) vy = 1;

        // 正規化
        if (vx !== 0 || vy !== 0) {
            const len = Math.sqrt(vx * vx + vy * vy);
            vx /= len;
            vy /= len;

            this.player.setVelocity(vx * this.player.speed, vy * this.player.speed);

            // 更新動畫
            if (Math.abs(vx) > 0.5) {
                this.player.setFlipX(vx < 0);
            }

            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'cat_run') {
                this.player.play('cat_run');
            }
        } else {
            this.player.setVelocity(0, 0);
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'cat_idle') {
                this.player.play('cat_idle');
            }
        }
    }

    updateEnemies(time, delta) {
        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;

            // 基本移動
            let vx = 0;
            let vy = enemy.speed * 0.5;

            // 不同移動模式
            switch(enemy.movePattern) {
                case 0: // 直線
                    break;
                case 1: // 左右擺動
                    vx = Math.sin(time / 500 + enemy.timeOffset) * 100;
                    break;
                case 2: // 追蹤玩家
                    const dx = this.player.x - enemy.x;
                    vx = Math.sign(dx) * 50;
                    break;
            }

            // 飛行單位：先飛進畫面，再上下擺動
            if (enemy.isFlying) {
                if (enemy.y < 150) {
                    vy = enemy.speed;
                } else {
                    vy = Math.sin(time / 800 + enemy.timeOffset) * 50;
                }
            }

            enemy.setVelocity(vx, vy);

            // 翻轉
            if (vx !== 0) {
                enemy.setFlipX(vx < 0);
            }

            // 射擊
            if (enemy.canShoot) {
                this.enemyShoot(enemy);
            }

            // 移除離開屏幕的敵人
            if (enemy.y > GAME_CONFIG.height + 100 || enemy.x < -100 || enemy.x > GAME_CONFIG.width + 100) {
                enemy.destroy();
                this.checkLevelComplete();
            }
        });
    }

    cleanupObjects() {
        // 清理子彈
        this.bullets.children.entries.forEach(bullet => {
            if (bullet.y < -50 || bullet.y > GAME_CONFIG.height + 50 ||
                bullet.x < -50 || bullet.x > GAME_CONFIG.width + 50) {
                bullet.destroy();
            }
        });

        // 清理敵人子彈
        this.enemyBullets.children.entries.forEach(bullet => {
            if (bullet.y < -50 || bullet.y > GAME_CONFIG.height + 50 ||
                bullet.x < -50 || bullet.x > GAME_CONFIG.width + 50) {
                bullet.destroy();
            }
        });

        // 清理掉出畫面的物品
        this.items.children.entries.forEach(item => {
            if (item.y > GAME_CONFIG.height + 50) {
                item.destroy();
            }
        });
    }

    useSpecialSkill() {
        if (this.energy < this.maxEnergy) return;

        this.energy = 0;
        this.updateUI();

        // 必殺技效果 - 全屏攻擊
        this.cameras.main.flash(500, 255, 255, 255);
        
        // 圓形衝擊波
        const wave = this.add.circle(this.player.x, this.player.y, 50, 0xffff00, 0.5);
        
        this.tweens.add({
            targets: wave,
            scale: 10,
            alpha: 0,
            duration: 1000,
            onComplete: () => wave.destroy()
        });

        // 一擊必殺所有敵人
        const enemiesToDestroy = this.enemies.children.entries.filter(e => e.active);
        enemiesToDestroy.forEach(enemy => {
            this.createExplosion(enemy.x, enemy.y, 1);
            this.score += enemy.score;
            this.addEnergy(5);
            if (Math.random() < 0.3) {
                this.dropItem(enemy.x, enemy.y);
            }
            enemy.destroy();
        });
        this.updateUI();

        // 清除所有敵人子彈
        this.enemyBullets.clear(true, true);

        // 顯示文字
        this.showFloatingText(this.player.x, this.player.y - 50, '必殺技！', '#ffff00');
        audioManager.playExplosionSound();

        // 10秒無敵防禦
        this.activateShield(10000);

        // 檢查通關
        this.checkLevelComplete();
    }

    activateShield(duration) {
        this.player.invulnerable = true;
        this.player.setTint(0x00ffff);

        // 護盾光環
        if (this.shieldCircle) this.shieldCircle.destroy();
        this.shieldCircle = this.add.circle(this.player.x, this.player.y, 60, 0x00ffff, 0.2);
        this.shieldCircle.setStrokeStyle(2, 0x00ffff, 0.8);

        // 護盾跟隨玩家
        this.shieldFollowEvent = this.time.addEvent({
            delay: 16,
            callback: () => {
                if (this.shieldCircle && this.player.active) {
                    this.shieldCircle.setPosition(this.player.x, this.player.y);
                }
            },
            loop: true
        });

        // 閃爍提示
        this.tweens.add({
            targets: this.shieldCircle,
            alpha: 0.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // 倒數提示
        this.showFloatingText(this.player.x, this.player.y - 80, '無敵 10秒！', '#00ffff');

        // 時間到解除
        if (this.shieldTimer) this.shieldTimer.destroy();
        this.shieldTimer = this.time.delayedCall(duration, () => {
            this.player.invulnerable = false;
            this.player.clearTint();
            if (this.shieldCircle) {
                this.shieldCircle.destroy();
                this.shieldCircle = null;
            }
            if (this.shieldFollowEvent) {
                this.shieldFollowEvent.destroy();
                this.shieldFollowEvent = null;
            }
            this.showFloatingText(this.player.x, this.player.y - 50, '無敵結束', '#ff6666');
        });
    }
}


// ==========================================
// BOSS戰場景
// ==========================================
class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
    }

    init(data) {
        this.currentLevel = data.level || 1;
        this.score = data.score || 0;
        this.powerLevel = data.powerLevel || 1;
        this.playerHealth = GAME_CONFIG.playerHealth;
        this.playerMaxHealth = GAME_CONFIG.playerHealth;
        this.energy = 50;
        this.maxEnergy = 100;
        this.isGameOver = false;
    }

    create() {
        // 初始化音頻並播放BOSS警告音效
        audioManager.init();
        audioManager.playBossWarning();

        // 創建背景
        this.createBossBackground();

        // 創建玩家
        this.createPlayer();

        // 創建遊戲對象群組
        this.bullets = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();
        this.items = this.physics.add.group();

        // 設置控制
        this.setupControls();

        // 創建UI
        this.createUI();

        // 生成BOSS
        this.spawnBoss();

        // 設置碰撞
        this.setupCollisions();

        // 開始BOSS戰
        this.startBossBattle();

        this.lastShotTime = 0;
        this.shotInterval = 200;
    }

    createBossBackground() {
        // BOSS戰特殊背景
        const colors = [0x2a0a0a, 0x0a0a2a];
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(colors[0], colors[1], colors[0], colors[1], 1);
        graphics.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);

        // 魔法陣效果
        const magicCircle = this.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);
        
        for (let i = 0; i < 3; i++) {
            const circle = this.add.circle(0, 0, 200 + i * 50, 0xff00ff, 0);
            circle.setStrokeStyle(2, 0xff00ff, 0.3 - i * 0.1);
            magicCircle.add(circle);
            
            this.tweens.add({
                targets: circle,
                rotation: i % 2 === 0 ? Math.PI * 2 : -Math.PI * 2,
                duration: 10000 + i * 2000,
                repeat: -1
            });
        }

        this.magicCircle = magicCircle;
    }

    createPlayer() {
        this.player = this.physics.add.sprite(GAME_CONFIG.width / 2, GAME_CONFIG.height - 100, 'catSprite', 0);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(1);
        this.player.play('cat_idle');
        this.player.invulnerable = false;
        this.player.speed = GAME_CONFIG.playerSpeed;
    }

    setupControls() {
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            up2: Phaser.Input.Keyboard.KeyCodes.UP,
            down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right2: Phaser.Input.Keyboard.KeyCodes.RIGHT
        });

        this.input.on('pointermove', (pointer) => {
            if (!this.player || this.isGameOver) return;
            if (pointer.x < this.player.x) {
                this.player.setFlipX(true);
            } else {
                this.player.setFlipX(false);
            }
        });

        this.input.on('pointerdown', (pointer) => {
            if (!this.isGameOver && pointer.leftButtonDown()) {
                this.fireBullet();
            }
        });
    }

    createUI() {
        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setDepth(1000);

        // BOSS警告
        const warning = this.add.text(GAME_CONFIG.width / 2, 60, '⚠ BOSS戰 ⚠', {
            fontSize: '36px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: warning,
            alpha: 0.3,
            scale: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.uiContainer.add(warning);

        // BOSS血條
        const bossHpBg = this.add.rectangle(GAME_CONFIG.width / 2, 120, 604, 30, 0x000000, 0.8);
        this.uiContainer.add(bossHpBg);

        this.bossHpBar = this.add.rectangle(GAME_CONFIG.width / 2 - 300, 120, 600, 26, 0xff0000, 1);
        this.bossHpBar.setOrigin(0, 0.5);
        this.uiContainer.add(this.bossHpBar);

        this.bossNameText = this.add.text(GAME_CONFIG.width / 2, 120, '', {
            fontSize: '20px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.uiContainer.add(this.bossNameText);

        // 玩家HP
        const hpBg = this.add.rectangle(20, 35, 204, 24, 0x000000, 0.8);
        hpBg.setOrigin(0, 0.5);
        this.uiContainer.add(hpBg);

        this.hpBar = this.add.rectangle(22, 35, 200, 20, 0xff0000, 1);
        this.hpBar.setOrigin(0, 0.5);
        this.uiContainer.add(this.hpBar);

        this.hpText = this.add.text(120, 35, `${this.playerHealth}/${this.playerMaxHealth}`, {
            fontSize: '16px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.uiContainer.add(this.hpText);

        // 能量條
        const energyBg = this.add.rectangle(250, 35, 204, 24, 0x000000, 0.8);
        energyBg.setOrigin(0, 0.5);
        this.uiContainer.add(energyBg);

        this.energyBar = this.add.rectangle(252, 35, 100, 20, 0x00aaff, 1);
        this.energyBar.setOrigin(0, 0.5);
        this.uiContainer.add(this.energyBar);

        // 分數
        this.scoreText = this.add.text(GAME_CONFIG.width - 20, 35, `分數: ${this.score}`, {
            fontSize: '24px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0.5);
        this.uiContainer.add(this.scoreText);
    }

    spawnBoss() {
        // 根據關卡選擇BOSS
        const bossConfigs = [
            { key: 'boss_fox', name: '偷魚首領 - 狡猾狐狸', health: 500, score: 5000 },
            { key: 'boss_wolf', name: '護衛隊長 - 兇狠狼人', health: 800, score: 8000 },
            { key: 'boss_bear', name: '大將軍 - 狂暴熊王', health: 1200, score: 12000 },
            { key: 'boss_dragon', name: '最終BOSS - 龍貓大王', health: 2000, score: 50000 }
        ];

        const bossIndex = Math.min(Math.floor((this.currentLevel - 1) / 10), bossConfigs.length - 1);
        const config = bossConfigs[bossIndex];

        this.boss = this.physics.add.sprite(GAME_CONFIG.width / 2, 200, config.key);
        this.boss.setCollideWorldBounds(true);
        this.boss.setScale(2);
        
        this.boss.health = config.health + (this.currentLevel - 1) * 100;
        this.boss.maxHealth = this.boss.health;
        this.boss.score = config.score;
        this.boss.name = config.name;
        this.boss.pattern = 0;
        this.boss.phase = 1;

        this.bossNameText.setText(config.name);

        // BOSS動畫
        this.tweens.add({
            targets: this.boss,
            y: 250,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // BOSS攻擊計時器
        this.bossAttackTimer = this.time.addEvent({
            delay: 2000,
            callback: () => this.bossAttack(),
            loop: true
        });
    }

    startBossBattle() {
        // 顯示BOSS登場動畫
        const overlay = this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0).setOrigin(0);
        overlay.setDepth(3000);

        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            yoyo: true,
            hold: 1000
        });
    }

    bossAttack() {
        if (!this.boss || !this.boss.active || this.isGameOver) return;

        this.boss.pattern = (this.boss.pattern + 1) % 4;

        switch(this.boss.pattern) {
            case 0:
                this.bossBulletSpread();
                break;
            case 1:
                this.bossBulletCircle();
                break;
            case 2:
                this.bossBulletAim();
                break;
            case 3:
                this.bossBulletRain();
                break;
        }

        // 根據血量改變階段
        const hpPercent = this.boss.health / this.boss.maxHealth;
        if (hpPercent < 0.5 && this.boss.phase === 1) {
            this.boss.phase = 2;
            this.bossEnterPhase2();
        }
    }

    bossBulletSpread() {
        const count = 5 + this.boss.phase * 3;
        const angleStep = 30;
        const startAngle = -angleStep * (count - 1) / 2;

        for (let i = 0; i < count; i++) {
            this.time.delayedCall(i * 100, () => {
                const angle = Phaser.Math.DegToRad(startAngle + i * angleStep + 90);
                this.createBossBullet(angle);
            });
        }
    }

    bossBulletCircle() {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            this.createBossBullet(angle);
        }
    }

    bossBulletAim() {
        // 瞄準玩家的多次射擊
        for (let i = 0; i < 3; i++) {
            this.time.delayedCall(i * 300, () => {
                const angle = Phaser.Math.Angle.Between(
                    this.boss.x, this.boss.y,
                    this.player.x, this.player.y
                );
                this.createBossBullet(angle);
                
                // 額外兩發散射
                this.createBossBullet(angle + 0.2);
                this.createBossBullet(angle - 0.2);
            });
        }
    }

    bossBulletRain() {
        // 隨機落下的子彈
        for (let i = 0; i < 8; i++) {
            this.time.delayedCall(i * 150, () => {
                const x = Phaser.Math.Between(50, GAME_CONFIG.width - 50);
                const bullet = this.enemyBullets.create(x, -20, 'enemyBullet');
                bullet.setScale(1.5);
                bullet.setVelocityY(300);
                bullet.damage = 15;
            });
        }
    }

    bossEnterPhase2() {
        // 第二階段強化
        this.cameras.main.shake(500, 0.02);
        this.cameras.main.flash(500, 255, 0, 0);

        const warning = this.add.text(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2, 'BOSS狂怒！', {
            fontSize: '48px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        warning.setDepth(4000);

        this.tweens.add({
            targets: warning,
            alpha: 0,
            scale: 2,
            duration: 1500,
            onComplete: () => warning.destroy()
        });

        // 加快攻擊速度
        this.bossAttackTimer.remove();
        this.bossAttackTimer = this.time.addEvent({
            delay: 1500,
            callback: () => this.bossAttack(),
            loop: true
        });
    }

    createBossBullet(angle) {
        const bullet = this.enemyBullets.create(this.boss.x, this.boss.y + 50, 'enemyBullet');
        bullet.setScale(1.5);
        
        const speed = 250 + this.boss.phase * 50;
        bullet.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        bullet.damage = 15 + this.boss.phase * 5;

        // 粒子效果
        const trail = this.add.circle(bullet.x, bullet.y, 4, 0xff00ff, 0.5);
        this.tweens.add({
            targets: trail,
            scale: 0,
            alpha: 0,
            duration: 300,
            onComplete: () => trail.destroy()
        });
    }

    setupCollisions() {
        // 玩家子彈擊中BOSS
        this.physics.add.overlap(this.bullets, this.boss, (bullet, boss) => {
            this.hitBoss(boss, bullet);
            bullet.destroy();
        });

        // 敵人子彈擊中玩家
        this.physics.add.overlap(this.player, this.enemyBullets, (player, bullet) => {
            if (!player.invulnerable) {
                this.hitPlayer(bullet.damage || 10);
                bullet.destroy();
                this.createExplosion(bullet.x, bullet.y, 0.5);
            }
        });

        // 玩家碰撞BOSS
        this.physics.add.overlap(this.player, this.boss, (player, boss) => {
            if (!player.invulnerable) {
                this.hitPlayer(30);
            }
        });

        // 收集物品
        this.physics.add.overlap(this.player, this.items, (player, item) => {
            this.collectItem(item);
        });
    }

    hitBoss(boss, bullet) {
        const dmg = this.powerLevel * 15 + 15;
        boss.health -= dmg;

        // 播放擊中音效
        audioManager.playExplosionSound();

        // 更新BOSS血條
        const hpPercent = Math.max(0, boss.health / boss.maxHealth);
        this.bossHpBar.width = 600 * hpPercent;
        this.bossHpBar.setFillStyle(hpPercent > 0.5 ? 0xff0000 : hpPercent > 0.25 ? 0xffaa00 : 0xff00ff);

        // 閃爍
        this.tweens.add({
            targets: boss,
            alpha: 0.5,
            duration: 50,
            yoyo: true,
            repeat: 2
        });

        // 傷害數字
        this.showDamageNumber(boss.x, boss.y - 50, dmg);

        // 爆炸
        this.createExplosion(bullet.x, bullet.y, 0.5);

        if (boss.health <= 0) {
            this.bossDefeated();
        }
    }

    bossDefeated() {
        // 停止攻擊
        this.bossAttackTimer.remove();

        // 大爆炸
        for (let i = 0; i < 10; i++) {
            this.time.delayedCall(i * 100, () => {
                const x = this.boss.x + Phaser.Math.Between(-100, 100);
                const y = this.boss.y + Phaser.Math.Between(-50, 50);
                this.createExplosion(x, y, 1.5);
            });
        }

        this.boss.destroy();

        // 增加分數
        this.score += this.boss.score;

        // 延遲後顯示勝利
        this.time.delayedCall(2000, () => {
            this.bossVictory();
        });
    }

    bossVictory() {
        this.physics.pause();

        // 播放勝利音效
        audioManager.playVictorySound();

        const overlay = this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.7).setOrigin(0);
        overlay.setDepth(4000);

        const container = this.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);
        container.setDepth(4001);

        const victoryText = this.add.text(0, -50, 'BOSS擊破！', {
            fontSize: '56px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const scoreText = this.add.text(0, 30, `獲得 ${this.boss.score} 分！`, {
            fontSize: '32px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffff00'
        }).setOrigin(0.5);

        container.add([victoryText, scoreText]);

        // 進入下一關
        this.time.delayedCall(3000, () => {
            if (this.currentLevel >= GAME_CONFIG.totalLevels) {
                this.scene.start('VictoryScene', { score: this.score });
            } else {
                this.scene.start('GameScene', { 
                    level: this.currentLevel,
                    score: this.score,
                    powerLevel: this.powerLevel
                });
            }
        });
    }

    showDamageNumber(x, y, damage) {
        const text = this.add.text(x, y, damage.toString(), {
            fontSize: '24px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#ff0000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: y - 60,
            alpha: 0,
            duration: 800,
            onComplete: () => text.destroy()
        });
    }

    createExplosion(x, y, scale = 1) {
        const colors = [0xff4400, 0xffaa00, 0xffff00, 0xff6600];
        
        for (let i = 0; i < 10 * scale; i++) {
            const angle = (Math.PI * 2 * i) / (10 * scale);
            const speed = 100 + Math.random() * 150;
            const color = Phaser.Utils.Array.GetRandom(colors);
            
            const particle = this.add.circle(x, y, 5 * scale, color, 0.8);
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                scale: 0,
                alpha: 0,
                duration: 500 + Math.random() * 300,
                onComplete: () => particle.destroy()
            });
        }

        const flash = this.add.circle(x, y, 20 * scale, 0xffffff, 1);
        this.tweens.add({
            targets: flash,
            scale: 2 * scale,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }

    hitPlayer(damage) {
        this.playerHealth -= damage;
        this.player.invulnerable = true;

        // 播放受傷音效
        audioManager.playHurtSound();

        this.player.play('cat_hurt');

        this.tweens.add({
            targets: this.player,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.player.alpha = 1;
                this.player.invulnerable = false;
                this.player.play('cat_idle');
            }
        });

        this.cameras.main.shake(200, 0.01);
        this.createExplosion(this.player.x, this.player.y, 0.8);

        if (this.playerHealth <= 0) {
            this.gameOver();
        }

        this.updateUI();
    }

    healPlayer(amount) {
        this.playerHealth = Math.min(this.playerHealth + amount, this.playerMaxHealth);
        this.updateUI();
    }

    addEnergy(amount) {
        this.energy = Math.min(this.energy + amount, this.maxEnergy);
        this.updateUI();
    }

    collectItem(item) {
        switch(item.itemType) {
            case 'fish':
                this.score += 50;
                this.addEnergy(10);
                break;
            case 'heart':
                this.healPlayer(20);
                break;
            case 'star':
                this.powerLevel = Math.min(this.powerLevel + 1, 5);
                break;
        }
        item.destroy();
        this.updateUI();
    }

    updateUI() {
        const hpPercent = this.playerHealth / this.playerMaxHealth;
        this.hpBar.width = 200 * hpPercent;
        this.hpBar.setFillStyle(hpPercent > 0.5 ? 0x00ff00 : hpPercent > 0.25 ? 0xffff00 : 0xff0000);
        this.hpText.setText(`${Math.ceil(this.playerHealth)}/${this.playerMaxHealth}`);

        const energyPercent = this.energy / this.maxEnergy;
        this.energyBar.width = 200 * energyPercent;
        this.energyBar.setFillStyle(energyPercent >= 1 ? 0xff00ff : 0x00aaff);

        this.scoreText.setText(`分數: ${this.score}`);
    }

    fireBullet() {
        const now = this.time.now;
        if (now - this.lastShotTime < this.shotInterval) return;
        this.lastShotTime = now;

        // 播放射擊音效
        audioManager.playShootSound();

        this.player.play('cat_attack');
        this.time.delayedCall(300, () => {
            if (!this.isGameOver) this.player.play('cat_idle');
        });

        const bulletCount = Math.min(this.powerLevel, 5);
        const spreadAngle = 15;

        for (let i = 0; i < bulletCount; i++) {
            const angle = (i - (bulletCount - 1) / 2) * spreadAngle;
            this.createBullet(angle);
        }
    }

    createBullet(angleOffset = 0) {
        const bullet = this.bullets.create(this.player.x, this.player.y - 30, 'bullet');
        bullet.setScale(1 + this.powerLevel * 0.2);

        const pointer = this.input.activePointer;
        const angle = Phaser.Math.Angle.Between(
            this.player.x, this.player.y,
            pointer.x, pointer.y
        ) + Phaser.Math.DegToRad(angleOffset);

        const speed = 600;
        bullet.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }

    gameOver() {
        this.isGameOver = true;
        this.physics.pause();
        if (this.bossAttackTimer) this.bossAttackTimer.remove();

        // 停止背景音樂
        audioManager.stopBGM();

        this.player.play('cat_die');

        const overlay = this.add.rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height, 0x000000, 0.8).setOrigin(0);
        overlay.setDepth(5000);

        const container = this.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);
        container.setDepth(5001);

        const gameOverText = this.add.text(0, -80, '遊戲結束', {
            fontSize: '72px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        const scoreText = this.add.text(0, 30, `最終分數: ${this.score}`, {
            fontSize: '32px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffff00'
        }).setOrigin(0.5);

        const restartText = this.add.text(0, 100, '點擊重新開始', {
            fontSize: '28px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffa500'
        }).setOrigin(0.5);

        container.add([gameOverText, scoreText, restartText]);

        this.tweens.add({
            targets: restartText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.input.on('pointerdown', () => {
            this.scene.start('GameScene', { level: 1 });
        });
    }

    update(time, delta) {
        if (this.isGameOver) return;

        this.handlePlayerMovement(delta);

        if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
            this.useSpecialSkill();
        }

        // 旋轉魔法陣
        if (this.magicCircle) {
            this.magicCircle.rotation += 0.001;
        }

        // 清理子彈
        this.cleanupObjects();
    }

    handlePlayerMovement(delta) {
        let vx = 0;
        let vy = 0;

        if (this.keys.left.isDown || this.keys.left2.isDown) vx = -1;
        if (this.keys.right.isDown || this.keys.right2.isDown) vx = 1;
        if (this.keys.up.isDown || this.keys.up2.isDown) vy = -1;
        if (this.keys.down.isDown || this.keys.down2.isDown) vy = 1;

        if (vx !== 0 || vy !== 0) {
            const len = Math.sqrt(vx * vx + vy * vy);
            vx /= len;
            vy /= len;

            this.player.setVelocity(vx * this.player.speed, vy * this.player.speed);

            if (Math.abs(vx) > 0.5) {
                this.player.setFlipX(vx < 0);
            }

            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'cat_run') {
                this.player.play('cat_run');
            }
        } else {
            this.player.setVelocity(0, 0);
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'cat_idle') {
                this.player.play('cat_idle');
            }
        }
    }

    cleanupObjects() {
        this.bullets.children.entries.forEach(bullet => {
            if (bullet.y < -50 || bullet.y > GAME_CONFIG.height + 50 ||
                bullet.x < -50 || bullet.x > GAME_CONFIG.width + 50) {
                bullet.destroy();
            }
        });

        this.enemyBullets.children.entries.forEach(bullet => {
            if (bullet.y < -50 || bullet.y > GAME_CONFIG.height + 50 ||
                bullet.x < -50 || bullet.x > GAME_CONFIG.width + 50) {
                bullet.destroy();
            }
        });
    }

    useSpecialSkill() {
        if (this.energy < this.maxEnergy) return;

        this.energy = 0;
        this.updateUI();

        this.cameras.main.flash(500, 255, 255, 255);
        
        const wave = this.add.circle(this.player.x, this.player.y, 50, 0xffff00, 0.5);
        
        this.tweens.add({
            targets: wave,
            scale: 10,
            alpha: 0,
            duration: 1000,
            onComplete: () => wave.destroy()
        });

        // 對BOSS造成大量傷害 (Boss血量的30%)
        if (this.boss && this.boss.active) {
            const megaDamage = Math.ceil(this.boss.maxHealth * 0.3);
            this.hitBoss(this.boss, null, megaDamage);
        }

        this.enemyBullets.clear(true, true);
        this.showFloatingText(this.player.x, this.player.y - 50, '必殺技！', '#ffff00');
        audioManager.playExplosionSound();

        // 10秒無敵防禦
        this.activateShield(10000);
    }

    activateShield(duration) {
        this.player.invulnerable = true;
        this.player.setTint(0x00ffff);

        if (this.shieldCircle) this.shieldCircle.destroy();
        this.shieldCircle = this.add.circle(this.player.x, this.player.y, 60, 0x00ffff, 0.2);
        this.shieldCircle.setStrokeStyle(2, 0x00ffff, 0.8);

        this.shieldFollowEvent = this.time.addEvent({
            delay: 16,
            callback: () => {
                if (this.shieldCircle && this.player.active) {
                    this.shieldCircle.setPosition(this.player.x, this.player.y);
                }
            },
            loop: true
        });

        this.tweens.add({
            targets: this.shieldCircle,
            alpha: 0.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.showFloatingText(this.player.x, this.player.y - 80, '無敵 10秒！', '#00ffff');

        if (this.shieldTimer) this.shieldTimer.destroy();
        this.shieldTimer = this.time.delayedCall(duration, () => {
            this.player.invulnerable = false;
            this.player.clearTint();
            if (this.shieldCircle) {
                this.shieldCircle.destroy();
                this.shieldCircle = null;
            }
            if (this.shieldFollowEvent) {
                this.shieldFollowEvent.destroy();
                this.shieldFollowEvent = null;
            }
            this.showFloatingText(this.player.x, this.player.y - 50, '無敵結束', '#ff6666');
        });
    }
}


// ==========================================
// 勝利場景 - 遊戲通關
// ==========================================
class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    create() {
        // 創建慶祝背景
        this.createCelebrationBackground();

        // 主要內容容器
        const container = this.add.container(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);

        // 勝利標題
        const victoryTitle = this.add.text(0, -320, '🎉 通關！ 🎉', {
            fontSize: '72px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ffd700',
            stroke: '#ff6600',
            strokeThickness: 6,
            shadow: { blur: 20, color: '#ffaa00', fill: true }
        }).setOrigin(0.5);

        // 標題動畫
        this.tweens.add({
            targets: victoryTitle,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 故事結局
        const storyLines = [
            "喵布布終於擊敗了邪惡的龍貓大王！",
            "",
            "被搶走的魚全部找回來了，",
            "貓咪村莊恢復了往日的和平...",
            "",
            "從此以後，喵布布成為了村莊的英雄，",
            "每天都有吃不完的鮮魚！",
            "",
            "THE END"
        ];

        const storyContainer = this.add.container(0, -220);
        storyLines.forEach((line, i) => {
            const text = this.add.text(0, i * 35, line, {
                fontSize: line === "THE END" ? '36px' : '24px',
                fontFamily: 'Microsoft JhengHei',
                color: line === "THE END" ? '#ff6600' : '#ffffff',
                fontStyle: line === "THE END" ? 'bold' : 'normal'
            }).setOrigin(0.5);
            storyContainer.add(text);
        });

        // 分數顯示
        const scoreContainer = this.add.container(0, 130);
        
        const scoreBg = this.add.rectangle(0, 0, 400, 80, 0x000000, 0.6);
        scoreBg.setStrokeStyle(3, 0xffd700);
        
        const scoreLabel = this.add.text(0, -15, '最終分數', {
            fontSize: '24px',
            fontFamily: 'Microsoft JhengHei',
            color: '#ffffff'
        }).setOrigin(0.5);

        const scoreValue = this.add.text(0, 20, this.finalScore.toLocaleString(), {
            fontSize: '40px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#ffd700'
        }).setOrigin(0.5);

        scoreContainer.add([scoreBg, scoreLabel, scoreValue]);

        // 數字滾動動畫
        const scoreObj = { value: 0 };
        this.tweens.add({
            targets: scoreObj,
            value: this.finalScore,
            duration: 3000,
            ease: 'Power2',
            onUpdate: () => {
                scoreValue.setText(Math.floor(scoreObj.value).toLocaleString());
            }
        });

        // 重新開始按鈕
        const restartBtn = this.createButton(0, 260, '再玩一次', () => {
            this.scene.start('MenuScene');
        });

        container.add([victoryTitle, storyContainer, scoreContainer, restartBtn]);

        // 添加貓咪精靈慶祝
        this.createCelebrationCats();

        // 煙花效果
        this.createFireworks();
    }

    createCelebrationBackground() {
        // 彩虹漸層背景
        const graphics = this.add.graphics();
        const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
        
        for (let i = 0; i < colors.length; i++) {
            const y1 = (GAME_CONFIG.height / colors.length) * i;
            const y2 = (GAME_CONFIG.height / colors.length) * (i + 1);
            graphics.fillStyle(colors[i], 0.3);
            graphics.fillRect(0, y1, GAME_CONFIG.width, y2 - y1);
        }

        // 星星背景
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, GAME_CONFIG.width);
            const y = Phaser.Math.Between(0, GAME_CONFIG.height);
            const star = this.add.star(x, y, 5, 3, 6, 0xffffff, 0.8);
            
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                scale: 0.5,
                duration: Phaser.Math.Between(500, 1500),
                yoyo: true,
                repeat: -1,
                delay: Math.random() * 1000
            });
        }
    }

    createCelebrationCats() {
        // 創建多個喵布布在屏幕上跑動慶祝
        for (let i = 0; i < 5; i++) {
            const cat = this.add.sprite(
                Phaser.Math.Between(100, GAME_CONFIG.width - 100),
                Phaser.Math.Between(100, GAME_CONFIG.height - 100),
                'catSprite'
            );
            cat.setScale(0.6);
            cat.play('cat_run');
            
            // 隨機移動
            const moveCat = () => {
                const targetX = Phaser.Math.Between(100, GAME_CONFIG.width - 100);
                const targetY = Phaser.Math.Between(100, GAME_CONFIG.height - 100);
                const duration = Phaser.Math.Between(2000, 4000);
                
                cat.setFlipX(targetX < cat.x);
                
                this.tweens.add({
                    targets: cat,
                    x: targetX,
                    y: targetY,
                    duration: duration,
                    ease: 'Linear',
                    onComplete: moveCat
                });
            };
            
            this.time.delayedCall(i * 500, moveCat);
        }
    }

    createFireworks() {
        // 定期發射煙花
        const launchFirework = () => {
            const x = Phaser.Math.Between(100, GAME_CONFIG.width - 100);
            const y = Phaser.Math.Between(100, GAME_CONFIG.height / 2);
            const color = Phaser.Utils.Array.GetRandom([
                0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500
            ]);

            // 煙花心
            const flash = this.add.circle(x, y, 30, 0xffffff, 1);
            
            // 粒子爆炸
            const particleCount = 20;
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount;
                const speed = 100 + Math.random() * 100;
                
                const particle = this.add.circle(x, y, 5, color, 0.9);
                
                this.tweens.add({
                    targets: particle,
                    x: x + Math.cos(angle) * speed,
                    y: y + Math.sin(angle) * speed,
                    scale: 0,
                    alpha: 0,
                    duration: 1000 + Math.random() * 500,
                    onComplete: () => particle.destroy()
                });
            }

            this.tweens.add({
                targets: flash,
                scale: 3,
                alpha: 0,
                duration: 300,
                onComplete: () => flash.destroy()
            });

            // 下一次煙花
            this.time.delayedCall(Phaser.Math.Between(500, 1500), launchFirework);
        };

        // 開始發射煙花
        this.time.delayedCall(1000, launchFirework);
    }

    createButton(x, y, text, callback) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 250, 60, 0xffd700, 0.9);
        bg.setStrokeStyle(3, 0xffa500);
        
        const label = this.add.text(0, 0, text, {
            fontSize: '28px',
            fontFamily: 'Microsoft JhengHei',
            fontStyle: 'bold',
            color: '#000000'
        }).setOrigin(0.5);

        container.add([bg, label]);
        container.setSize(250, 60);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            bg.setFillStyle(0xffea00, 1);
            container.setScale(1.05);
        });

        container.on('pointerout', () => {
            bg.setFillStyle(0xffd700, 0.9);
            container.setScale(1);
        });

        container.on('pointerdown', callback);

        return container;
    }
}

// ==========================================
// 遊戲配置與初始化
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [LoadScene, StoryScene, MenuScene, GameScene, BossScene, VictoryScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 啟動遊戲
const game = new Phaser.Game(config);
