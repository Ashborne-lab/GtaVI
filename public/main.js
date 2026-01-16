import Phaser from 'phaser';



const SCREEN_W=1920;
const SCREEN_H=1080;

const SCREEN_CX=SCREEN_W/2;
const SCREEN_CY=SCREEN_H/2;


class MainScene extends Phaser.Scene{
    constructor(){
        super({key:"MainScene"});
    }

    preload(){
        this.load.image("background","assets/background.png");
        this.load.image("player","assets/player.png");
        this.load.image("enemy","assets/enemy.png");
    }

    create(){
        this.add.image(SCREEN_CX, SCREEN_CY, "background");
        this.player = this.add.sprite(SCREEN_CX, SCREEN_CY, "player");
        this.enemies = this.physics.add.group({
            key: 'enemy',
            repeat: 5,
            setXY: { x: 100, y: 0, stepX: 150 }
        });
    }

    update(){
        // Game logic goes here
    }
}
class PauseScene extends Phaser.Scene{
    constructor(){
        super({key:"PauseScene"});
    }

    create(){
        this.add.text(SCREEN_CX, SCREEN_CY, "Game Paused", { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.input.on('pointerdown', () => {
            this.scene.resume('MainScene');
            this.scene.stop();
        });
    }
}



var config = {
    type: Phaser.AUTO,
    width: SCREEN_W,
    height: SCREEN_H,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [MainScene, PauseScene]
};

var game = new Phaser.Game(config);