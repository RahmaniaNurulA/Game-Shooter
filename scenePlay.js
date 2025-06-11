var scenePlay = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: 'scenePlay' });
    },
    init: function () { },
    preload: function () {
        this.load.setBaseURL('asset/');
        this.load.image("BG1", "images/BG1.png");
        this.load.image("BG2", "images/BG2.png");
        this.load.image("BG3", "images/BG3.png");
        this.load.image("GroundTransisi", "images/Transisi.png");
        this.load.image("Pesawat1", "images/Pesawat1.png");
        this.load.image("Pesawat2", "images/Pesawat2.png");
        this.load.image("Peluru", "images/Peluru.png");
        this.load.image("EfekLedakan", "images/EfekLedakan.png");
        this.load.image("cloud", "images/cloud.png");
        this.load.image("Musuh1", "images/Musuh1.png");
        this.load.image("Musuh2", "images/Musuh2.png");
        this.load.image("Musuh3", "images/Musuh3.png");
        this.load.image("MusuhBos", "images/Musuh1.png");
        this.load.image("Transisi", "images/cloud.png");
        this.load.audio("snd_explode", "audio/fx_explode.mp3");
        this.load.audio("snd_play", "audio/music_play.mp3");
        this.load.audio("snd_shoot", "audio/fx_shoot.mp3");
    },
    create: function () {
        const isSoundEnabled = parseInt(localStorage['sound_enabled'] || "1");
        this.sound.mute = (isSoundEnabled === 0);

        this.sound.stopAll();

        this.musicPlay = this.sound.add('snd_play', { loop: true, volume: 0.5 });
        this.musicPlay.play();
        this.snd_shoot = this.sound.add('snd_shoot');

        this.transisi = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, "Transisi");
        this.transisi.setAlpha(0);
        this.transisi.setDepth(999);

        this.lastBGIndex = Phaser.Math.Between(1, 3);
        this.bgBottomSize = { 'width': 768, 'height': 1064 };
        this.arrBgBottom = [];

        this.createBGBottom = function (xPos, yPos) {
            let bgBottom = this.add.image(xPos, yPos, "BG" + this.lastBGIndex);
            bgBottom.setData('kecepatan', 3);
            bgBottom.setDepth(1);
            bgBottom.flipX = Phaser.Math.Between(0, 1);
            this.arrBgBottom.push(bgBottom);

            let newBgIndex = Phaser.Math.Between(1, 3);
            if (newBgIndex == this.lastBGIndex) {
                let bgBottomAdditon = this.add.image(xPos, yPos - this.bgBottomSize.height / 2, "GroundTransisi");
                bgBottomAdditon.setData('kecepatan', 3);
                bgBottomAdditon.setData('tambahan', true);
                bgBottomAdditon.setDepth(2);
                bgBottomAdditon.flipX = Phaser.Math.Between(0, 1);
                this.arrBgBottom.push(bgBottomAdditon);
            }
            this.lastBGIndex = newBgIndex;
        };

        this.addBGBottom = function () {
            if (this.arrBgBottom.length > 0) {
                let lastBG = this.arrBgBottom[this.arrBgBottom.length - 1];
                if (lastBG.getData('tambahan')) {
                    lastBG = this.arrBgBottom[this.arrBgBottom.length - 2];
                }
                this.createBGBottom(game.canvas.width / 2, lastBG.y - this.bgBottomSize.height);
            } else {
                this.createBGBottom(game.canvas.width / 2, game.canvas.height - this.bgBottomSize.height / 2);
            }
        };

        this.addBGBottom();
        this.addBGBottom();
        this.addBGBottom();

        this.bgCloudSize = { 'width': 768, 'height': 1962 };
        this.arrBgTop = [];
        this.createBGTop = function (xPos, yPos) {
            var bgTop = this.add.image(xPos, yPos, "cloud");
            bgTop.setData('kecepatan', 6);
            bgTop.setDepth(5);
            bgTop.flipX = Phaser.Math.Between(0, 1);
            bgTop.setAlpha(Phaser.Math.Between(4, 7) / 10);
            this.arrBgTop.push(bgTop);
        };

        this.addBGTop = function () {
            if (this.arrBgTop.length > 0) {
                let lastBG = this.arrBgTop[this.arrBgTop.length - 1];
                this.createBGTop(game.canvas.width / 2, lastBG.y - this.bgCloudSize.height * Phaser.Math.Between(1, 4));
            } else {
                this.createBGTop(game.canvas.width / 2, -this.bgCloudSize.height);
            }
        };
        this.addBGTop();

        for (let i = 0; i < this.arrBgTop.length; i++) {
            this.arrBgTop[i].y += this.arrBgTop[i].getData('kecepatan');
            if (this.arrBgTop[i].y >= game.canvas.height + this.bgCloudSize.height / 2) {
                this.arrBgTop[i].destroy();
                this.arrBgTop[i].splice(i, 1);
                this.addBGTop();
                break;
            }
        }

        // === ✅ Ambil pilihan hero dari registry (default ke Pesawat1 jika tidak ada) ===
        let selectedHero = this.registry.get('selectedHero') || 'Pesawat1';

        // === 🛩️ Tambahkan heroShip sesuai pilihan ===
        this.heroShip = this.add.image(X_POSITION.CENTER, Y_POSITION.BOTTOM - 200, selectedHero);
        this.heroShip.setDepth(4);
        this.heroShip.setScale(0.35);

        this.scoreLabel = this.add.text(X_POSITION.CENTER, Y_POSITION.TOP + 80, '0', {
            fontFamily: 'Verdana, Arial',
            fontSize: '70px',
            color: '#ffffff',
            stroke: '#5c5c5c',
            strokeThickness: 2
        });
        this.scoreLabel.setOrigin(0.5);
        this.scoreLabel.setDepth(100);

        this.cursorKeyListener = this.input.keyboard.createCursorKeys();

        this.input.on('pointermove', function (pointer) {
            let movementX = this.heroShip.x;
            let movementY = this.heroShip.y;

            if (pointer.x > 70 && pointer.x < (X_POSITION.RIGHT - 70)) {
                movementX = pointer.x;
            } else {
                movementX = pointer.x <= 70 ? 70 : X_POSITION.RIGHT - 70;
            }

            if (pointer.y > 70 && pointer.y < (Y_POSITION.BOTTOM - 70)) {
                movementY = pointer.y;
            } else {
                movementY = pointer.y <= 70 ? 70 : Y_POSITION.BOTTOM - 70;
            }

            this.heroShip.x = movementX;
            this.heroShip.y = movementY;
        }, this);

        // Path points for enemy movement
        let pointA =[];
        pointA.push(new Phaser.Math.Vector2(-200, 100));
        pointA.push(new Phaser.Math.Vector2(250, 200));
        pointA.push(new Phaser.Math.Vector2(200, (Y_POSITION.BOTTOM +  200)/2));
        pointA.push(new Phaser.Math.Vector2(300, Y_POSITION.BOTTOM + 200));

        let pointB = [];
        pointB.push(new Phaser.Math.Vector2(900, 100));
        pointB.push(new Phaser.Math.Vector2(550, 200));
        pointB.push(new Phaser.Math.Vector2(500, (Y_POSITION.BOTTOM +  200)/2));
        pointB.push(new Phaser.Math.Vector2(500, Y_POSITION.BOTTOM + 200));

        let pointC =[];
        pointC.push(new Phaser.Math.Vector2(900, 100));
        pointC.push(new Phaser.Math.Vector2(550, 200));
        pointC.push(new Phaser.Math.Vector2(400, (Y_POSITION.BOTTOM +  200)/2));
        pointC.push(new Phaser.Math.Vector2(0, Y_POSITION.BOTTOM + 200));

        let pointD = [];
        pointD.push(new Phaser.Math.Vector2(-200, 100));
        pointD.push(new Phaser.Math.Vector2(550, 200));
        pointD.push(new Phaser.Math.Vector2(650, (Y_POSITION.BOTTOM +  200)/2));
        pointD.push(new Phaser.Math.Vector2(0, Y_POSITION.BOTTOM + 200));

        var points = [];
        points.push(pointA);
        points.push(pointB);
        points.push(pointC);
        points.push(pointD);

        this.arrEnemies = [];
        this.arrEnemyBullets = [];
        this.arrBullets = [];
        this.scoreValue = 0;

        // Sound
        this.snd_explode = this.sound.add('snd_explode');

        // Particles
        let partikelExplode = this.add.particles('EfekLedakan');
        partikelExplode.setDepth(4);

        this.emitterExplode1 = partikelExplode.createEmitter({
            speed: { min: -800, max: 800 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'SCREEN',
            lifespan: 200,
            tint: 0xffa500 // orange
        });
        this.emitterExplode1.setPosition(-100, -100);
        this.emitterExplode1.explode();

        this.emitterExplode2 = partikelExplode.createEmitter({
            speed: { min: -500, max: 500 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            lifespan: 150,
            tint: 0xffffff // white
        });
        this.emitterExplode2.setPosition(-100, -100);
        this.emitterExplode2.explode();

        // ✨ Tambahan: Particle emitter untuk ledakan pesawat pemain
        this.emitterPlayerExplode1 = partikelExplode.createEmitter({
            speed: { min: -1000, max: 1000 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.2, end: 0 },
            blendMode: 'SCREEN',
            lifespan: 400,
            tint: 0xff4500 // red-orange untuk ledakan pesawat pemain
        });
        this.emitterPlayerExplode1.setPosition(-100, -100);

        this.emitterPlayerExplode2 = partikelExplode.createEmitter({
            speed: { min: -700, max: 700 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 300,
            tint: 0xffffff // white
        });
        this.emitterPlayerExplode2.setPosition(-100, -100);

        // EnemyBullet class
        var EnemyBullet = new Phaser.Class({
            Extends: Phaser.GameObjects.Image,
            initialize: function EnemyBullet(scene, x, y) {
                Phaser.GameObjects.Image.call(this, scene, x, y, 'Peluru');
                this.setDepth(3);
                this.setScale(0.4);
                this.speed = Phaser.Math.GetSpeed(300, 1);
            },
            fire: function(x, y) {
                this.setPosition(x, y);
                this.setActive(true);
                this.setVisible(true);
            },
            update: function(time, delta) {
                this.y += this.speed * delta;
                if (this.y > Y_POSITION.BOTTOM + 50) {
                    this.setActive(false);
                    this.setVisible(false);
                    if (this.parentContainer) {
                        this.parentContainer.remove(this);
                    }
                }
            }
        });

        // Enemy class
        var Enemy = new Phaser.Class({
        Extends: Phaser.GameObjects.Image,
        initialize: function Enemy(scene, x, y, pathPoints) {
            const textures = ['Musuh1', 'Musuh2', 'Musuh3'];
            const randomTexture = Phaser.Utils.Array.GetRandom(textures);

            Phaser.GameObjects.Image.call(this, scene, x, y, randomTexture);
            this.scene = scene;

            this.setDepth(3);
            this.setScale(0.35);

            this.speed = Phaser.Math.GetSpeed(150, 1);
            this.isAlive = true;

            this.pathPoints = pathPoints;
            this.pointIndex = 0;

            this.shootTimer = this.scene.time.addEvent({
                delay: 800,
                callback: this.shootBullet,
                callbackScope: this,
                loop: true
            });
        },
            shootBullet: function() {
                if (!this.isAlive) {
                    return;
                }
                if(this.scene.arrEnemyBullets.length < 5){
                    let bullet = new EnemyBullet(this.scene, this.x, this.y);
                    bullet.fire(this.x, this.y + 20);
                    this.scene.add.existing(bullet);
                    this.scene.arrEnemyBullets.push(bullet);
                }
            },
            update: function(time, delta) {
                if(!this.isAlive) return;

                if(this.pointIndex < this.pathPoints.length){
                    let target = this.pathPoints[this.pointIndex];
                    let distX = target.x - this.x;
                    let distY = target.y - this.y;
                    let dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

                    if(dist > 5){
                        let angle = Math.atan2(distY, distX);
                        this.x += Math.cos(angle) * this.speed * delta;
                        this.y += Math.sin(angle) * this.speed * delta;
                    } else {
                        this.pointIndex++;
                    }
                } else {
                    // reached end of path, kill enemy
                    this.isAlive = false;
                    this.setActive(false);
                    this.setVisible(false);
                    if(this.shootTimer){
                        this.shootTimer.remove(false);
                    }
                }
            }
        });

        // Function untuk menangani kematian pesawat pemain
        this.playerDeath = function(playerX, playerY) {
            // Mainkan suara ledakan
            this.snd_explode.play();
            
            // Tampilkan efek ledakan pesawat pemain
            this.emitterPlayerExplode1.setPosition(playerX, playerY);
            this.emitterPlayerExplode1.explode();
            this.emitterPlayerExplode2.setPosition(playerX, playerY);
            this.emitterPlayerExplode2.explode();
            
            // Sembunyikan pesawat pemain
            this.heroShip.setVisible(false);
            
            // Stop musik
            this.musicPlay.stop();
            
            // Tampilkan transisi dan pindah ke sceneGameOver
            this.tweens.add({
                targets: this.transisi,
                alpha: 1,
                duration: 500,
                onComplete: () => {
                    this.time.delayedCall(300, () => {
                        this.scene.start('sceneGameOver', { score: this.scoreValue });
                    });
                }
            });
        };

        // Spawn enemies periodically
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if(this.arrEnemies.length < 4){
                    let randIdx = Phaser.Math.Between(0, points.length - 1);
                    let enemy = new Enemy(this, points[randIdx][0].x, points[randIdx][0].y, points[randIdx]);
                    this.add.existing(enemy);
                    this.arrEnemies.push(enemy);
                }
            },
            loop: true
        });

        // Player bullet group
        this.bulletSpeed = 600;

        // Input shoot bullet on pointer down
        this.input.on('pointerdown', () => {
            if(this.arrBullets.length < 5){
                // 🔊 Mainkan suara tembakan
                this.snd_shoot.play();
                
                let bullet = this.add.image(this.heroShip.x, this.heroShip.y - 40, 'Peluru');
                bullet.setScale(0.4);
                bullet.setDepth(4);
                this.arrBullets.push(bullet);
            }
        });

        // ⌨️ Tambahan: Shooting dengan keyboard (spasi)
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    },
    update: function(time, delta){
        // Update bg bottom scrolling
        for(let i = 0; i < this.arrBgBottom.length; i++){
            let bg = this.arrBgBottom[i];
            let newY = bg.y + bg.getData('kecepatan');
            if(newY >= game.canvas.height + this.bgBottomSize.height/2){
                bg.destroy();
                this.arrBgBottom.splice(i, 1);
                this.addBGBottom();
                break;
            } else {
                bg.y = newY;
            }
        }

        // Update bg top scrolling
        for(let i = 0; i < this.arrBgTop.length; i++){
            let bg = this.arrBgTop[i];
            let newY = bg.y + bg.getData('kecepatan');
            if(newY >= game.canvas.height + this.bgCloudSize.height/2){
                bg.destroy();
                this.arrBgTop.splice(i, 1);
                this.addBGTop();
                break;
            } else {
                bg.y = newY;
            }
        }

        // Update enemies
        for(let i = this.arrEnemies.length -1; i >= 0; i--){
            let enemy = this.arrEnemies[i];
            if(enemy.isAlive){
                enemy.update(time, delta);
            } else {
                this.arrEnemies.splice(i, 1);
                enemy.destroy();
            }
        }

        // Update enemy bullets
        for(let i = this.arrEnemyBullets.length -1; i >= 0; i--){
            let bullet = this.arrEnemyBullets[i];
            if(bullet.active){
                bullet.update(time, delta);
                // Check collision with heroShip
                if(Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), this.heroShip.getBounds())){
                    // ✨ Gunakan function playerDeath untuk efek ledakan
                    this.playerDeath(this.heroShip.x, this.heroShip.y);
                    return; // Keluar dari update loop
                }
            } else {
                this.arrEnemyBullets.splice(i, 1);
                bullet.destroy();
            }
        }

        // Update player bullets
        for(let i = this.arrBullets.length - 1; i >= 0; i--){
            let bullet = this.arrBullets[i];
            bullet.y -= this.bulletSpeed * delta / 1000;
            if(bullet.y < 0){
                bullet.destroy();
                this.arrBullets.splice(i, 1);
                continue;
            }
            // Check collision with enemies
            for(let j = this.arrEnemies.length - 1; j >= 0; j--){
                let enemy = this.arrEnemies[j];
                if(enemy.isAlive && Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), enemy.getBounds())){
                    enemy.isAlive = false;
                    enemy.setActive(false);
                    enemy.setVisible(false);
                    this.snd_explode.play();

                    // Particles explosion
                    this.emitterExplode1.setPosition(enemy.x, enemy.y);
                    this.emitterExplode1.explode();
                    this.emitterExplode2.setPosition(enemy.x, enemy.y);
                    this.emitterExplode2.explode();

                    bullet.destroy();
                    this.arrBullets.splice(i, 1);

                    this.scoreValue += 10;
                    this.scoreLabel.setText(this.scoreValue);

                    // 🎉 Check for win condition
                    if (this.scoreValue >= 50) {
                        // Stop music
                        this.musicPlay.stop();
                        
                        // Show transition and go to sceneWin
                        this.tweens.add({
                            targets: this.transisi,
                            alpha: 1,
                            duration: 500,
                            onComplete: () => {
                                this.time.delayedCall(300, () => {
                                    this.scene.start('sceneWin', { score: this.scoreValue });
                                });
                            }
                        });
                        return; // Exit update loop
                    }
                    break;
                }
            }
        }

        // Move heroShip by keyboard arrows
        if(this.cursorKeyListener.left.isDown && this.heroShip.x > 70){
            this.heroShip.x -= 10;
        } else if(this.cursorKeyListener.right.isDown && this.heroShip.x < X_POSITION.RIGHT - 70){
            this.heroShip.x += 10;
        }

        if(this.cursorKeyListener.up.isDown && this.heroShip.y > 70){
            this.heroShip.y -= 10;
        } else if(this.cursorKeyListener.down.isDown && this.heroShip.y < Y_POSITION.BOTTOM - 70){
            this.heroShip.y += 10;
        }

        // 🔫 Shooting dengan tombol spasi
        if(Phaser.Input.Keyboard.JustDown(this.spaceKey)){
            if(this.arrBullets.length < 5){
                // 🔊 Mainkan suara tembakan
                this.snd_shoot.play();
                
                let bullet = this.add.image(this.heroShip.x, this.heroShip.y - 40, 'Peluru');
                bullet.setScale(0.4);
                bullet.setDepth(4);
                this.arrBullets.push(bullet);
            }
        }

        // Cek tabrakan heroShip dengan musuh
        for (let i = this.arrEnemies.length - 1; i >= 0; i--) {
            let enemy = this.arrEnemies[i];
            if (enemy.isAlive && Phaser.Geom.Intersects.RectangleToRectangle(enemy.getBounds(), this.heroShip.getBounds())) {
                // ✨ Gunakan function playerDeath untuk efek ledakan
                this.playerDeath(this.heroShip.x, this.heroShip.y);
                break; // Hentikan loop setelah tabrakan terdeteksi
            }
        }
    }
});