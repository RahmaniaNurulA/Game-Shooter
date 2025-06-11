var scenePilihHero = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: 'scenePilihHero' });
    },
    preload: function () {
        this.load.setBaseURL('asset/');
        this.load.image("BGPilihPesawat", "images/BGPilihPesawat.png");
        this.load.image("ButtonMenu", "images/ButtonMenu.png");
        this.load.image("ButtonNext", "images/ButtonNext.png");
        this.load.image("ButtonPrev", "images/ButtonPrev.png");
        this.load.image("Transisi", "images/cloud.png");
        this.load.image("Pesawat1", "images/Pesawat1.png");
        this.load.image("Pesawat2", "images/Pesawat2.png");
    },
    create: function () {
        const isSoundEnabled = parseInt(localStorage['sound_enabled'] || "1");
        this.sound.mute = (isSoundEnabled === 0);

        this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, 'BGPilihPesawat');

        var currentHero = 0;
        var countHero = 2;

        var buttonMenu = this.add.image(50, 50, 'ButtonMenu');
        var buttonNext = this.add.image(X_POSITION.CENTER + 250, Y_POSITION.CENTER, 'ButtonNext');
        var buttonPrevious = this.add.image(X_POSITION.CENTER - 250, Y_POSITION.CENTER, 'ButtonPrev');
        var heroShip = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, 'Pesawat' + (currentHero + 1));

        var transisi = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "Transisi");
        transisi.setAlpha(0);  // mulai dengan transparan

        buttonMenu.setInteractive();
        buttonNext.setInteractive();
        buttonPrevious.setInteractive();
        heroShip.setInteractive();

        this.input.on('gameobjectover', function (pointer, gameObject) {
            gameObject.setTint(0x999999);
        }, this);

        this.input.on('gameobjectdown', function (pointer, gameObject) {
            gameObject.setTint(0x999999);
        }, this);

        this.input.on('gameobjectout', function (pointer, gameObject) {
            gameObject.setTint(0xffffff); // kembalikan warna normal
        }, this);

        this.input.on('gameobjectup', function (pointer, gameObject) {
            gameObject.setTint(0xffffff);

            if (gameObject === buttonMenu) {
                snd_touch.play();
                this.scene.start('sceneMenu');
            }

            if (gameObject === buttonNext) {
                currentHero++;
                if (currentHero >= countHero) {
                    currentHero = 0;
                }
                heroShip.setTexture('Pesawat' + (currentHero + 1));
            }

            if (gameObject === buttonPrevious) {
                currentHero--;
                if (currentHero < 0) {
                    currentHero = countHero - 1;
                }
                heroShip.setTexture('Pesawat' + (currentHero + 1));
            }

            if (gameObject === heroShip) {
                // Simpan pilihan hero ke registry agar bisa dipakai di scenePlay
                this.registry.set('selectedHero', 'Pesawat' + (currentHero + 1));

                this.tweens.add({
                    targets: transisi,
                    alpha: 1,        // fade in jadi terlihat
                    duration: 500,   // durasi 0.5 detik
                    onComplete: () => {
                        this.scene.start("scenePlay");
                    }
                });
            }

        }, this);
    },
    update: function () {}
});
