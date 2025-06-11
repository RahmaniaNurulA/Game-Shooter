var sceneWin = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: 'sceneWin' });
    },

    // Tambahkan fungsi init untuk menerima data
    init: function (data) {
        this.finalScore = data.score || 0;
    },

    preload: function () {
        this.load.setBaseURL("asset/");
        this.load.image("BGPlay", "images/BGPlay.png");
        this.load.image("ButtonPlay", "images/ButtonPlay.png");
        this.load.image("ButtonMenu", "images/ButtonMenu.png");
        this.load.audio("snd_win", "audio/fx_win.mp3");
        this.load.audio("snd_touchshooter", "audio/fx_touch.mp3");
    },

    create: function () {
        // Ambil sound setting dari localStorage atau default ke enabled
        const isSoundEnabled = parseInt(localStorage.getItem('sound_enabled') || "1");
        this.sound.mute = (isSoundEnabled === 0);

        const centerX = this.game.config.width / 2;
        const centerY = this.game.config.height / 2;

        // Background
        this.add.image(centerX, centerY, "BGPlay");

        // Stop semua audio yang sedang berjalan
        this.sound.stopAll();

        // Play sound win
        this.sound.play("snd_win");

        // Teks "You Win!"
        this.add.text(centerX, centerY - 180, "You Win!", {
            fontSize: "76px",
            fontFamily: "Sans-serif",
            fontStyle: "bold",
            color: "#ff0000",
            stroke: "#ffffff",
            strokeThickness: 6
        }).setOrigin(0.5);

        // Tampilkan score yang diterima dari scene sebelumnya
        this.add.text(centerX, centerY - 50, "Score: " + this.finalScore, {
            fontSize: "48px",
            color: "#ffff00",
            fontFamily: "Sans-serif",
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

    update: function () {
        // Fungsi update kosong - tidak ada yang perlu diupdate di scene win
    }
});