import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const ROAD_WIDTH = 400;
const LANE_COUNT = 4;
const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;

// GTA VI Color Palette
const COLORS = {
    neonPink: 0xff0080,
    neonCyan: 0x00ffff,
    neonOrange: 0xff6600,
    darkPurple: 0x1a0a2e,
    road: 0x2a2a2a,
    roadLine: 0xffffff,
    playerCar: 0xff0080,
    enemyCars: [0x00ffff, 0xff6600, 0xffff00, 0x00ff00, 0xff00ff]
};

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.enemies = null;
        this.cursors = null;
        this.score = 0;
        this.lives = 3;
        this.speed = 5;
        this.spawnTimer = null;
        this.roadLines = [];
        this.isInvincible = false;
        this.gameOver = false;
        this.scoreText = null;
        this.livesDisplay = [];
        this.updateCallback = null;
        // New properties
        this.skylineElements = [];
        this.palmTrees = [];
        this.policeCar = null;
        this.policeSpawned = false;
        this.sirenTimer = null;
        this.wantedLevel = 0;
    }

    init(data) {
        this.updateCallback = data.updateCallback;
    }

    create() {
        this.score = 0;
        this.lives = 3;
        this.speed = 5;
        this.gameOver = false;
        this.isInvincible = false;
        this.policeSpawned = false;
        this.wantedLevel = 0;

        // Create Miami skyline background
        this.createMiamiSkyline();

        // Create road background
        const roadX = (GAME_WIDTH - ROAD_WIDTH) / 2;
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, ROAD_WIDTH + 40, GAME_HEIGHT, 0x1a1a1a);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, ROAD_WIDTH, GAME_HEIGHT, COLORS.road);

        // Road edge lines (neon)
        this.add.rectangle(roadX, GAME_HEIGHT / 2, 4, GAME_HEIGHT, COLORS.neonPink);
        this.add.rectangle(roadX + ROAD_WIDTH, GAME_HEIGHT / 2, 4, GAME_HEIGHT, COLORS.neonPink);

        // Create palm trees on sides
        this.createPalmTrees();

        // Create animated road lines
        for (let i = 0; i < 10; i++) {
            const line = this.add.rectangle(
                GAME_WIDTH / 2,
                i * 70 - 35,
                4,
                40,
                COLORS.roadLine
            );
            this.roadLines.push(line);
        }

        // Lane dividers (dashed)
        for (let lane = 1; lane < LANE_COUNT; lane++) {
            for (let i = 0; i < 10; i++) {
                const dashLine = this.add.rectangle(
                    roadX + lane * LANE_WIDTH,
                    i * 70 - 35,
                    2,
                    30,
                    0x666666
                );
                this.roadLines.push(dashLine);
            }
        }

        // Create player car
        this.player = this.createCar(GAME_WIDTH / 2, GAME_HEIGHT - 100, COLORS.playerCar, true);

        // Enemy group
        this.enemies = this.physics.add.group();

        // Spawn enemies periodically
        this.spawnTimer = this.time.addEvent({
            delay: 1500,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Score text with neon glow effect
        this.scoreText = this.add.text(GAME_WIDTH - 20, 20, 'SCORE: 0', {
            fontSize: '24px',
            fontFamily: 'pricedown, Arial Black',
            fill: '#00ffff',
            stroke: '#ff0080',
            strokeThickness: 2
        }).setOrigin(1, 0);

        // Lives display (hearts)
        this.updateLivesDisplay();

        // Wanted level display
        this.wantedText = this.add.text(GAME_WIDTH / 2, 20, '', {
            fontSize: '20px',
            fontFamily: 'pricedown, Arial Black',
            fill: '#ff0000'
        }).setOrigin(0.5, 0);

        // Collision detection
        this.physics.add.overlap(this.player, this.enemies, this.handleCrash, null, this);
    }

    createMiamiSkyline() {
        // Gradient sky background
        const skyGradient = this.add.graphics();
        skyGradient.fillGradientStyle(0xff6b9d, 0xff6b9d, 0x1a0a2e, 0x1a0a2e, 1);
        skyGradient.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Sun/moon
        const sun = this.add.circle(GAME_WIDTH - 100, 80, 40, 0xffcc00, 0.8);
        this.tweens.add({
            targets: sun,
            alpha: 0.4,
            duration: 2000,
            yoyo: true,
            repeat: -1
        });

        // Miami buildings silhouette (back layer)
        const buildingColors = [0x2a1a4a, 0x1a0a3a, 0x3a2a5a];
        const buildingData = [
            { x: 30, w: 60, h: 120 },
            { x: 100, w: 40, h: 180 },
            { x: 150, w: 70, h: 140 },
            { x: 650, w: 50, h: 160 },
            { x: 710, w: 80, h: 200 },
            { x: 770, w: 45, h: 130 }
        ];

        buildingData.forEach((b, i) => {
            const building = this.add.rectangle(b.x, GAME_HEIGHT / 2 - 50, b.w, b.h, buildingColors[i % 3]);
            building.setOrigin(0.5, 1);
            building.setDepth(-2);
            this.skylineElements.push({ obj: building, speed: 0.1 });

            // Add neon windows
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 3; col++) {
                    if (Math.random() > 0.3) {
                        const windowLight = this.add.rectangle(
                            b.x - b.w / 3 + col * (b.w / 3),
                            GAME_HEIGHT / 2 - 70 - row * 25,
                            6, 8,
                            Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
                            0.7
                        );
                        windowLight.setDepth(-1);
                        this.skylineElements.push({ obj: windowLight, speed: 0.1 });
                    }
                }
            }
        });

        // Front layer buildings (closer, darker)
        const frontBuildings = [
            { x: 50, w: 80, h: 100 },
            { x: 730, w: 90, h: 110 }
        ];

        frontBuildings.forEach(b => {
            const building = this.add.rectangle(b.x, GAME_HEIGHT / 2, b.w, b.h, 0x0a0a1a);
            building.setOrigin(0.5, 1);
            building.setDepth(-1);
            this.skylineElements.push({ obj: building, speed: 0.3 });
        });
    }

    createPalmTrees() {
        const roadX = (GAME_WIDTH - ROAD_WIDTH) / 2;

        // Left side palm trees
        for (let i = 0; i < 5; i++) {
            const tree = this.createPalmTree(roadX - 60, i * 150 - 50);
            this.palmTrees.push(tree);
        }

        // Right side palm trees
        for (let i = 0; i < 5; i++) {
            const tree = this.createPalmTree(roadX + ROAD_WIDTH + 60, i * 150 - 50);
            this.palmTrees.push(tree);
        }
    }

    createPalmTree(x, y) {
        const container = this.add.container(x, y);
        container.setDepth(0);

        // Trunk
        const trunk = this.add.rectangle(0, 0, 8, 60, 0x4a3728);

        // Leaves (simplified as triangles)
        const leafColor = 0x228b22;
        for (let i = 0; i < 5; i++) {
            const angle = (i * 72) * Math.PI / 180;
            const leaf = this.add.triangle(
                Math.cos(angle) * 15,
                -35 + Math.sin(angle) * 5,
                0, 0, -8, 30, 8, 30,
                leafColor
            );
            leaf.setRotation(angle - Math.PI / 2);
            container.add(leaf);
        }

        container.add(trunk);
        return container;
    }

    createCar(x, y, color, isPlayer = false) {
        const car = this.add.container(x, y);

        // Car body
        const body = this.add.rectangle(0, 0, 40, 70, color);
        body.setStrokeStyle(2, 0xffffff);

        // Windshield
        const windshield = this.add.rectangle(0, -15, 30, 15, 0x333333);

        // Headlights
        if (isPlayer) {
            this.add.rectangle(-12, -35, 8, 6, 0xffff00).setAlpha(0.8);
            this.add.rectangle(12, -35, 8, 6, 0xffff00).setAlpha(0.8);
        } else {
            // Taillights for enemy cars (they face us)
            this.add.rectangle(-12, 35, 8, 6, 0xff0000).setAlpha(0.8);
            this.add.rectangle(12, 35, 8, 6, 0xff0000).setAlpha(0.8);
        }

        car.add([body, windshield]);

        // Add physics body
        this.physics.add.existing(car);
        car.body.setSize(40, 70);

        return car;
    }

    createPoliceCar(x, y) {
        const car = this.add.container(x, y);

        // Car body (black and white police colors)
        const body = this.add.rectangle(0, 0, 45, 75, 0x000000);
        body.setStrokeStyle(3, 0xffffff);

        // White stripe
        const stripe = this.add.rectangle(0, 0, 45, 15, 0xffffff);

        // Windshield
        const windshield = this.add.rectangle(0, -18, 32, 15, 0x333333);

        // Police lights (siren)
        this.leftSiren = this.add.rectangle(-12, -38, 10, 8, 0xff0000);
        this.rightSiren = this.add.rectangle(12, -38, 10, 8, 0x0000ff);

        // POLICE text
        const policeText = this.add.text(0, -5, 'POLICE', {
            fontSize: '8px',
            fontFamily: 'Arial Black',
            fill: '#ffffff'
        }).setOrigin(0.5);

        car.add([body, stripe, windshield, this.leftSiren, this.rightSiren, policeText]);

        // Rotate to face upward (chasing from behind)
        car.setRotation(Math.PI);

        // Add physics body
        this.physics.add.existing(car);
        car.body.setSize(45, 75);

        // Siren light animation
        this.sirenTimer = this.time.addEvent({
            delay: 200,
            callback: () => {
                const temp = this.leftSiren.fillColor;
                this.leftSiren.setFillStyle(this.rightSiren.fillColor);
                this.rightSiren.setFillStyle(temp);
            },
            loop: true
        });

        return car;
    }

    spawnPoliceCar() {
        if (this.policeSpawned || this.gameOver) return;

        this.policeSpawned = true;
        this.wantedLevel = 1;

        const roadX = (GAME_WIDTH - ROAD_WIDTH) / 2;
        // Spawn from BEHIND (bottom of screen) like Subway Surfers
        this.policeCar = this.createPoliceCar(roadX + ROAD_WIDTH / 2, GAME_HEIGHT + 100);
        this.enemies.add(this.policeCar);
        this.policeCar.setData('isPolice', true);

        // Show wanted level
        this.wantedText.setText('⭐ WANTED');
        this.tweens.add({
            targets: this.wantedText,
            alpha: 0.3,
            duration: 300,
            yoyo: true,
            repeat: -1
        });

        // Flash warning
        const warningText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '🚨 POLICE INCOMING! 🚨', {
            fontSize: '32px',
            fontFamily: 'pricedown, Arial Black',
            fill: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.tweens.add({
            targets: warningText,
            scale: 1.2,
            alpha: 0,
            duration: 1500,
            onComplete: () => warningText.destroy()
        });
    }

    createExplosion(x, y) {
        const particles = [];
        for (let i = 0; i < 15; i++) {
            const particle = this.add.circle(x, y, Phaser.Math.Between(3, 8),
                Phaser.Utils.Array.GetRandom([COLORS.neonPink, COLORS.neonCyan, COLORS.neonOrange, 0xffff00]));
            particles.push(particle);

            this.tweens.add({
                targets: particle,
                x: x + Phaser.Math.Between(-80, 80),
                y: y + Phaser.Math.Between(-80, 80),
                alpha: 0,
                scale: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Flash effect
        const flash = this.add.circle(x, y, 50, 0xffffff, 0.8);
        this.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }

    spawnEnemy() {
        if (this.gameOver) return;

        const roadX = (GAME_WIDTH - ROAD_WIDTH) / 2;

        // Calculate which lane the player is in
        const playerLane = Math.floor((this.player.x - roadX) / LANE_WIDTH);

        // 50% chance to spawn in player's lane (forces them to move!)
        let laneIndex;
        if (Math.random() < 0.5) {
            laneIndex = Phaser.Math.Clamp(playerLane, 0, LANE_COUNT - 1);
        } else {
            laneIndex = Phaser.Math.Between(0, LANE_COUNT - 1);
        }

        const x = roadX + laneIndex * LANE_WIDTH + LANE_WIDTH / 2;

        const color = Phaser.Utils.Array.GetRandom(COLORS.enemyCars);
        const enemy = this.createCar(x, -80, color, false);
        this.enemies.add(enemy);

        // Store data for lane-changing behavior
        enemy.setData('targetX', x);
        enemy.setData('canChangeLane', true);

        // Set enemy velocity
        enemy.body.setVelocityY(150 + this.speed * 20);

        // 40% chance to spawn a second car in a different lane
        if (Math.random() < 0.4) {
            let secondLane = Phaser.Math.Between(0, LANE_COUNT - 1);
            if (secondLane === laneIndex) {
                secondLane = (secondLane + 1) % LANE_COUNT;
            }
            const x2 = roadX + secondLane * LANE_WIDTH + LANE_WIDTH / 2;
            const color2 = Phaser.Utils.Array.GetRandom(COLORS.enemyCars);
            const enemy2 = this.createCar(x2, -120, color2, false);
            this.enemies.add(enemy2);
            enemy2.setData('targetX', x2);
            enemy2.setData('canChangeLane', true);
            enemy2.body.setVelocityY(150 + this.speed * 20);
        }
    }

    updateLivesDisplay() {
        // Clear old hearts
        this.livesDisplay.forEach(h => h.destroy());
        this.livesDisplay = [];

        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.text(20 + i * 35, 20, '❤', {
                fontSize: '28px',
                fill: '#ff0080'
            });
            this.livesDisplay.push(heart);
        }
    }

    handleCrash(player, enemy) {
        if (this.isInvincible || this.gameOver) return;

        const isPolice = enemy.getData('isPolice');

        // Create explosion
        this.createExplosion(enemy.x, enemy.y);

        // Remove enemy (police respawns)
        if (isPolice) {
            this.policeSpawned = false;
            if (this.sirenTimer) this.sirenTimer.remove();
        }
        enemy.destroy();

        // Lose a life (police costs 2 lives!)
        this.lives -= isPolice ? 2 : 1;
        this.updateLivesDisplay();

        // Screen shake
        this.cameras.main.shake(200, isPolice ? 0.04 : 0.02);

        // SLOW DOWN on crash - makes police catch up!
        this.speed = Math.max(this.speed - 3, 3);

        // Flash player red
        this.isInvincible = true;
        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.player.alpha = 1;
                this.isInvincible = false;
            }
        });

        // Check game over
        if (this.lives <= 0) {
            this.endGame();
        }
    }

    endGame() {
        this.gameOver = true;
        this.spawnTimer.remove();
        if (this.sirenTimer) this.sirenTimer.remove();

        // Stop all enemies
        this.enemies.children.iterate(enemy => {
            if (enemy) enemy.body.setVelocity(0, 0);
        });

        // Game over overlay
        const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

        const gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'WASTED', {
            fontSize: '72px',
            fontFamily: 'pricedown, Arial Black',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const finalScoreText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, `FINAL SCORE: ${this.score}`, {
            fontSize: '36px',
            fontFamily: 'pricedown, Arial Black',
            fill: '#00ffff',
            stroke: '#ff0080',
            strokeThickness: 2
        }).setOrigin(0.5);

        const restartText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'PRESS SPACE TO RESTART', {
            fontSize: '24px',
            fontFamily: 'pricedown, Arial Black',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Blink restart text
        this.tweens.add({
            targets: restartText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Listen for restart
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart();
        });

        // Notify parent component
        if (this.updateCallback) {
            this.updateCallback({ gameOver: true, score: this.score });
        }
    }

    update() {
        if (this.gameOver) return;

        // Animate palm trees (parallax scrolling)
        this.palmTrees.forEach(tree => {
            tree.y += this.speed * 0.8;
            if (tree.y > GAME_HEIGHT + 50) {
                tree.y = -50;
            }
        });

        // Animate road lines
        this.roadLines.forEach(line => {
            line.y += this.speed + 3;
            if (line.y > GAME_HEIGHT + 40) {
                line.y = -40;
            }
        });

        // Player movement
        const roadX = (GAME_WIDTH - ROAD_WIDTH) / 2;
        const minX = roadX + 25;
        const maxX = roadX + ROAD_WIDTH - 25;

        if (this.cursors.left.isDown && this.player.x > minX) {
            this.player.x -= 6;
        }
        if (this.cursors.right.isDown && this.player.x < maxX) {
            this.player.x += 6;
        }
        if (this.cursors.up.isDown) {
            this.speed = Math.min(this.speed + 0.1, 15);
        }
        if (this.cursors.down.isDown) {
            this.speed = Math.max(this.speed - 0.1, 3);
        }

        // Update score
        this.score += Math.floor(this.speed / 5);
        this.scoreText.setText(`SCORE: ${this.score}`);

        // Spawn police after 2000 points
        if (this.score > 2000 && !this.policeSpawned) {
            this.spawnPoliceCar();
        }

        // Police chase AI - chases from BEHIND like Subway Surfers
        if (this.policeCar && this.policeCar.active) {
            // Move towards player horizontally
            const dx = this.player.x - this.policeCar.x;
            if (Math.abs(dx) > 5) {
                this.policeCar.x += dx > 0 ? 4 : -4;
            }

            // SPEED-BASED CHASE: Fast = police falls behind, Slow = police catches up!
            // At max speed (15), police stays way behind
            // At min speed (3), police is right on your tail
            const speedFactor = (this.speed - 3) / 12; // 0 to 1 based on speed
            const minDistance = 100; // Closest police can get
            const maxDistance = GAME_HEIGHT; // Police goes off-screen at max speed
            const targetDistance = minDistance + (speedFactor * (maxDistance - minDistance));

            const targetY = this.player.y + targetDistance;

            // Smoothly move toward target position
            if (this.policeCar.y < targetY - 10) {
                this.policeCar.y += 5; // Fall behind
            } else if (this.policeCar.y > targetY + 10) {
                this.policeCar.y -= 8; // Catch up!
            }

            // Keep police on road
            this.policeCar.x = Phaser.Math.Clamp(this.policeCar.x, minX, maxX);

            // Police has no vertical velocity - we control position directly
            this.policeCar.body.setVelocityY(0);
        }

        // LANE CHANGING AI - Cars randomly swerve between lanes!
        this.enemies.children.iterate(enemy => {
            if (!enemy || enemy.getData('isPolice')) return;

            // 1% chance per frame to change lane
            if (enemy.getData('canChangeLane') && Math.random() < 0.01) {
                const roadX = (GAME_WIDTH - ROAD_WIDTH) / 2;

                // Pick a random direction: -1 (left) or 1 (right)
                const direction = Math.random() < 0.5 ? -1 : 1;
                const newX = enemy.x + (direction * LANE_WIDTH);

                // Make sure new position is on the road
                if (newX >= roadX + LANE_WIDTH / 2 && newX <= roadX + ROAD_WIDTH - LANE_WIDTH / 2) {
                    enemy.setData('targetX', newX);
                    enemy.setData('canChangeLane', false);
                    // Allow lane change again after some time
                    this.time.delayedCall(Phaser.Math.Between(500, 1500), () => {
                        if (enemy.active) enemy.setData('canChangeLane', true);
                    });
                }
            }

            // Move toward target X position (smooth lane changing)
            const targetX = enemy.getData('targetX');
            if (targetX && Math.abs(enemy.x - targetX) > 2) {
                enemy.x += (targetX > enemy.x) ? 3 : -3;
            }
        });

        // Check for near-misses (bonus points)
        this.enemies.children.iterate(enemy => {
            if (!enemy) return;

            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist < 100 && dist > 60 && enemy.y > this.player.y - 50 && !enemy.getData('nearMiss')) {
                this.score += 50;
                enemy.setData('nearMiss', true);

                // Show near miss text
                const nearMissText = this.add.text(this.player.x, this.player.y - 60, '+50 NEAR MISS!', {
                    fontSize: '16px',
                    fontFamily: 'pricedown, Arial Black',
                    fill: '#00ff00'
                }).setOrigin(0.5);

                this.tweens.add({
                    targets: nearMissText,
                    y: nearMissText.y - 40,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => nearMissText.destroy()
                });
            }
        });

        // Remove off-screen enemies (except police which stays behind)
        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.y > GAME_HEIGHT + 150) {
                if (enemy.getData('isPolice')) {
                    // Police respawns at bottom if it goes too far
                    enemy.y = GAME_HEIGHT + 100;
                } else {
                    enemy.destroy();
                }
            }
            // Remove enemies that go above screen
            if (enemy && enemy.y < -100 && !enemy.getData('isPolice')) {
                enemy.destroy();
            }
        });

        // Increase difficulty over time
        if (this.score > 1000 && this.spawnTimer.delay > 800) {
            this.spawnTimer.delay = 1200;
        }
        if (this.score > 3000 && this.spawnTimer.delay > 600) {
            this.spawnTimer.delay = 900;
        }
        if (this.score > 5000 && this.spawnTimer.delay > 500) {
            this.spawnTimer.delay = 700;
        }

        // Update parent component with current state
        if (this.updateCallback) {
            this.updateCallback({ score: this.score, lives: this.lives, speed: this.speed });
        }
    }
}

const RacingGame = ({ onClose }) => {
    const gameRef = useRef(null);
    const containerRef = useRef(null);
    const [gameState, setGameState] = useState({ score: 0, lives: 3, speed: 5, gameOver: false });

    useEffect(() => {
        if (!containerRef.current || gameRef.current) return;

        const config = {
            type: Phaser.AUTO,
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            parent: containerRef.current,
            backgroundColor: COLORS.darkPurple,
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false
                }
            },
            scene: [GameScene]
        };

        gameRef.current = new Phaser.Game(config);

        // Pass update callback to scene
        gameRef.current.events.on('ready', () => {
            const scene = gameRef.current.scene.getScene('GameScene');
            if (scene) {
                scene.updateCallback = setGameState;
            }
        });

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div className="racing-game-overlay">
            <div className="racing-game-container">
                <div className="game-header">
                    <h2 className="game-title">VICE CITY RACER</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="game-instructions">
                    <span>← → STEER</span>
                    <span>↑ ACCELERATE</span>
                    <span>↓ BRAKE</span>
                </div>
                <div ref={containerRef} className="game-canvas-container" />
            </div>
        </div>
    );
};

export default RacingGame;
