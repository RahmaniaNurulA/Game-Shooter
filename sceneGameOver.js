var sceneGameOver = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: 'sceneGameOver' });
    },

    init: function (data) {
        // Ambil skor dari scene sebelumnya
        this.score = data.score || 0;

        // Ambil skor tertinggi dari localStorage
        let savedHighScore = localStorage.getItem('highScore') || 0;
        savedHighScore = parseInt(savedHighScore);

        // Bandingkan dengan skor saat ini
        this.highScore = Math.max(this.score, savedHighScore);

        // Simpan kembali jika skor saat ini lebih tinggi
        localStorage.setItem('highScore', this.highScore);
    },

    preload: function () {
        this.load.setBaseURL("asset/");
        this.load.image("BGPlay", "images/BGPlay.png");
        this.load.image("ButtonPlay", "images/ButtonPlay.png");
        this.load.audio("snd_gameover", "audio/music_gameover.mp3");
        this.load.audio("snd_touchshooter", "audio/fx_touch.mp3");
    },

    create: function () {
        const isSoundEnabled = parseInt(localStorage['sound_enabled'] || "1");
        this.sound.mute = (isSoundEnabled === 0);

        const centerX = this.game.config.width / 2;
        const centerY = this.game.config.height / 2;

        // Background
        this.add.image(centerX, centerY, "BGPlay");

        this.sound.stopAll();

        // Musik game over
        this.sound.play("snd_gameover");

        // Teks Game Over
        this.add.text(centerX, centerY - 190, "Game Over", {
            fontSize: "76px",
            fontFamily: "Sans-serif",
            fontStyle: "bold",
            color: "#ff0000",
            stroke: "#ffffff",
            strokeThickness: 6
        }).setOrigin(0.5);

        // High Score
        this.add.text(centerX, centerY - 80, "High Score: " + this.highScore, {
            fontSize: "40px",
            fontFamily: "Sans-serif",
            color: "#ffff00",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 10
        }).setOrigin(0.5);

        // Score Saat Ini
        this.add.text(centerX, centerY - 20, "Score: " + this.score, {
            fontSize: "40px",
            fontFamily: "Sans-serif",
            color: "#ffff00",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 10
        }).setOrigin(0.5);

       // Tombol Play Again - posisi kiri
        const buttonPlay = this.add.image(centerX - 60, centerY + 100, "ButtonPlay").setInteractive();
        buttonPlay.setScale(0.6);
        
        // Event handler untuk tombol Play Again
        buttonPlay.on('pointerdown', () => {
            this.sound.play("snd_touchshooter");
            this.scene.start('scenePlay'); // Mulai game lagi
        });

        // Tombol Menu - posisi kanan
        const buttonMenu = this.add.image(centerX + 60, centerY + 100, "ButtonMenu").setInteractive();
        buttonMenu.setScale(1.0);

        // Event handler untuk tombol Menu
        buttonMenu.on('pointerdown', () => {
            this.sound.play("snd_touchshooter");
            this.scene.start('sceneMenu'); // Kembali ke menu utama
        });

        // Tambahkan hover effects (opsional)
        [buttonPlay].forEach(button => {
            button.on('pointerover', () => {
                button.setScale(0.7);
                button.setTint(0xdddddd);
            });
            
            button.on('pointerout', () => {
                button.setScale(0.6);
                button.clearTint();
            });
        });
        [buttonMenu].forEach(button => {
            button.on('pointerover', () => {
                button.setScale(1.1);
                button.setTint(0xdddddd);
            });
            
            button.on('pointerout', () => {
                button.setScale(1.0);
                button.clearTint();
            });
        });
    },

    update: function () {}
});