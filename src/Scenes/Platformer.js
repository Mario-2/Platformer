class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 900;
        this.DRAG = 1400;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1800;
        this.JUMP_VELOCITY = -825;
        this.TURN_SPEED = 3000;
        this.MOVE_SPEED = 400;
        this.DASH_SPEED = 650;
        this.DASH_COOLDOWN = 20;
        this.DASH_DURATION = 16;
        this.dash = true;
        this.dash_cd = 0;
        this.dashing = false;
        this.dash_dir = 1;
        this.dash_time = 0;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.backgroundLayer.setScale(2.0);

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setScale(2.0);

        // Create a layer
        this.foregroundLayer = this.map.createLayer("Foreground", this.tileset, 0, 0);
        this.foregroundLayer.setScale(2.0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // set up player avatar
        this.playerLayer = this.map.getObjectLayer("Player");
        my.sprite.player = this.physics.add.sprite(this.playerLayer.objects[0].x * 2, this.playerLayer.objects[0].y * 2, "platformer_characters", "tile_0000.png").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(false);
        my.sprite.player.setMaxVelocity(10000, 900);

        this.goalLayer = this.map.getObjectLayer("Goal");
        my.sprite.goal = this.physics.add.sprite(this.goalLayer.objects[0].x * 2, this.goalLayer.objects[0].y * 2, "platformer_characters", "tile_0000.png").setScale(SCALE)
        my.sprite.goal.body.setAllowGravity(false);
        my.sprite.goal.setFlip(true, false);
        this.physics.add.collider(my.sprite.player, my.sprite.goal, _ => this.win());

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        this.cameras.main.startFollow(my.sprite.player);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        this.input.keyboard.on('keydown-R', () => {
            this.scene.start("platformerScene");
        }, this);

        this.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    }

    update() {
        if(cursors.left.isDown && Phaser.Input.Keyboard.JustDown(this.shift) && this.dash) {
            this.dashing = true;
            this.dash_dir = -1;
            this.dash = false;
            this.dash_cd = this.DASH_COOLDOWN;
            this.dash_time = this.DASH_DURATION;
            my.sprite.player.body.setVelocityY(0);
            this.sound.play("dash", {
                volume: 0.5 
             });
        }
        else if(cursors.right.isDown && Phaser.Input.Keyboard.JustDown(this.shift) && this.dash) {
            this.dashing = true;
            this.dash_dir = 1;
            this.dash = false;
            this.dash_cd = this.DASH_COOLDOWN;
            this.dash_time = this.DASH_DURATION;
            my.sprite.player.body.setVelocityY(0);
            this.sound.play("dash", {
                volume: 0.5 
             });
        }

        if(this.dashing) {
            my.sprite.player.body.velocity.x = this.DASH_SPEED * this.dash_dir;
            if(!my.sprite.player.body.blocked.down) {
                my.sprite.player.body.setAllowGravity(false);
            }
            if((cursors.left.isDown && this.dash_dir == 1) || (cursors.right.isDown && this.dash_dir == -1)) {
                this.dashing = false;
                my.sprite.player.body.setDragX(this.DRAG);
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setAllowGravity(true);
            }
            this.dash_time--;
            if(this.dash_time <= 0) {
                this.dashing = false;
                my.sprite.player.body.setDragX(this.DRAG);
                my.sprite.player.body.setAccelerationX(0);
                my.sprite.player.body.setAllowGravity(true);
            }
        }
        else {
        if(cursors.left.isDown) {
            if(my.sprite.player.body.velocity.x > -this.MOVE_SPEED)
            {
                if(my.sprite.player.body.velocity.x > 0) {
                    my.sprite.player.body.setAccelerationX(-this.TURN_SPEED);
                }
                else {
                    my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
                }
            }
            else {
                my.sprite.player.body.setAccelerationX(0);
            }
            
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

        } else if(cursors.right.isDown) {
            if(my.sprite.player.body.velocity.x < this.MOVE_SPEED)
            {
                if(my.sprite.player.body.velocity.x < 0) {
                    my.sprite.player.body.setAccelerationX(this.TURN_SPEED);
                }
                else {
                    my.sprite.player.body.setAccelerationX(this.ACCELERATION);
                }
            }
            else {
                my.sprite.player.body.setAccelerationX(0);
            }

            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

        } else {
            my.sprite.player.body.setAccelerationX(0);
            if(my.sprite.player.body.blocked.down) {
                my.sprite.player.body.setDragX(this.DRAG);
            }
            else {
                my.sprite.player.body.setDragX(0);
            }

            my.sprite.player.anims.play('idle');
        }
        }

        this.dash_cd -= 1;
        if(this.dash_cd < 0 && my.sprite.player.body.blocked.down) {
            this.dash = true;
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            if(my.sprite.player.body.y  > 2000) {
                this.sound.play("lose", {
                    volume: 0.5 
                 });
                this.scene.start("platformerScene");
            }
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.space)) {
            if(this.dashing) {
                this.dashing = false;
                my.sprite.player.body.setAllowGravity(true);
                my.sprite.player.body.velocity.x = this.DASH_SPEED * this.dash_dir;
            }
            this.dash = true;
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.sound.play("jump", {
                volume: 0.5
             });
        }
    }

    win() {
        this.sound.play("win", {
            volume: 0.5 
         });
         this.scene.start("platformerScene");
    }
}