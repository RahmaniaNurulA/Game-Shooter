var sceneMenu = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: 'sceneMenu' });
    },
    init: function () { },
    preload: function () {
        this.load.setBaseURL('asset/');
        this.load.image("BGPlay", "images/BGPlay.png");
        this.load.image("Title", "images/Title.png");
        this.load.image("ButtonPlay", "images/ButtonPlay.png");
        this.load.image("ButtonSoundOn", "images/ButtonSoundOn.png");
        this.load.image("ButtonSoundOff", "images/ButtonSoundOff.png");
        this.load.image("ButtonMusicOn", "images/ButtonMusicOn.png");
        this.load.image("ButtonMusicOff", "images/ButtonMusicOff.png");
        this.load.image("Transisi", "images/cloud.png");
        this.load.audio("snd_menu", "audio/music_menu.mp3");
        this.load.audio("snd_touchshooter", "audio/fx_touch.mp3");
    },
    create: function () {
        X_POSITION = {
            'LEFT': 0,
            'CENTER': game.canvas.width / 2,
            'RIGHT': game.canvas.width,
        };

        Y_POSITION = {
            'TOP': 0,
            'CENTER': game.canvas.height / 2,
            'BOTTOM': game.canvas.height,
        };

        this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "BGPlay");
        var titleGame = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER - 150, "Title");
        var buttonPlay = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER + 150, "ButtonPlay");
        buttonPlay.setInteractive();

        var buttonSound = this.add.image(X_POSITION.RIGHT - 70, Y_POSITION.BOTTOM - 70, 'ButtonSoundOn');
        buttonSound.setInteractive();

        // Audio snd_touch global, buat sekali jika belum ada
        if (!snd_touch) snd_touch = this.sound.add("snd_touchshooter");

        // Ambil status sound dari localStorage (default 1 = aktif)
        let soundState = parseInt(localStorage['sound_enabled'] || "1");

        // Cek apakah snd_menu sudah ada (supaya tidak double)
        this.snd_menu = this.sound.get("snd_menu");
        if (!this.snd_menu) {
            this.snd_menu = this.sound.add("snd_menu", { loop: true });
            if (soundState) {
                this.snd_menu.play();
            }
        } else {
            // Jika sudah ada dan tidak diputar, putar jika sound aktif
            if (soundState && !this.snd_menu.isPlaying) {
                this.snd_menu.play();
            }
        }

        var transisi = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "Transisi");
        transisi.setAlpha(0);  // mulai dengan transparan


        // Atur volume sesuai soundState
        snd_touch.setVolume(soundState ? 1 : 0);
        this.snd_menu.setVolume(soundState ? 1 : 0);

        // Set texture tombol sound sesuai status
        if (soundState === 0) {
            buttonSound.setTexture('ButtonSoundOff');
        } else {
            buttonSound.setTexture('ButtonSoundOn');
        }

        this.input.on('gameobjectover', function (pointer, gameObject) {
            if (gameObject === buttonPlay || gameObject === buttonSound) {
                gameObject.setTint(0x999999);
            }
        }, this);

        this.input.on('gameobjectout', function (pointer, gameObject) {
            if (gameObject === buttonPlay || gameObject === buttonSound) {
                gameObject.setTint(0xffffff);
            }
        }, this);

        this.input.on('gameobjectdown', function (pointer, gameObject) {
            if (gameObject === buttonSound) {
                buttonSound.setTint(0x999999);
            }
        }, this);

        this.input.on('gameobjectup', function (pointer, gameObject) {
            if (gameObject === buttonPlay) {
                buttonPlay.setTint(0xffffff);
                snd_touch.play();

                // Tampilkan transisi dengan cloud
                this.tweens.add({
                    targets: transisi,
                    alpha: 1,        // fade in jadi terlihat
                    duration: 500,   // durasi 0.5 detik
                    onComplete: () => {
                        this.scene.start("scenePilihHero");
                    }
                });
            }

            if (gameObject === buttonSound) {
                let isSoundActive = parseInt(localStorage['sound_enabled'] || "1");
                if (isSoundActive === 0) {
                    buttonSound.setTexture("ButtonSoundOn");
                    snd_touch.setVolume(1);
                    this.snd_menu.setVolume(1);
                    localStorage['sound_enabled'] = 1;
                } else {
                    buttonSound.setTexture("ButtonSoundOff");
                    snd_touch.setVolume(0);
                    this.snd_menu.setVolume(0);
                    localStorage['sound_enabled'] = 0;
                }
                buttonSound.setTint(0xffffff);
            }
        }, this);
    },
    update: function () { },
});
