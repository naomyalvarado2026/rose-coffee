import { PLAYER_SVG, ENEMY1_SVG, ENEMY2_SVG, BOSS_SVG, PROJECTILE_PLAYER_SVG, PROJECTILE_ENEMY_SVG, POWERUP_DOUBLE_SVG, POWERUP_LASER_SVG, POWERUP_SHIELD_SVG, loadSprite } from './Sprites';
import { audio } from '../../../utils/audioEngine';

export interface GameState {
  score: number;
  level: number;
  combo: number;
  lives: number;
  isGameOver: boolean;
  isPlaying: boolean;
  isPaused: boolean;
}

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  type: string;
  owner?: 'player' | 'enemy';
  startX?: number; // for sine wave movement
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface Upgrades {
  fireRate: number; // 0 to 5
  moveSpeed: number; // 0 to 5
  extraLives: number; // 0 to 3
  bulletDamage: number; // 0 to 5
  shieldDuration: number; // 0 to 5
}

export class CoffeeInvadersEngine {
  private ctx: CanvasRenderingContext2D;
  private onStateChange: (state: GameState) => void;
  private onScore: (points: number) => void;
  private upgrades: Upgrades;
  
  public state: GameState;
  
  private width: number;
  private height: number;
  
  private player!: Entity;
  private enemies: Entity[] = [];
  private projectiles: Entity[] = [];
  private particles: Particle[] = [];
  private powerups: Entity[] = [];
  private floatingTexts: FloatingText[] = [];
  
  private keys: { [key: string]: boolean } = {};
  private animationId: number = 0;
  private lastTime: number = 0;
  
  private baseEnemyInterval: number = 1000;
  private lastEnemyMove: number = 0;
  private enemyDirection: number = 1;
  private enemyDropSpeed: number = 20;
  
  private isShooting: boolean = false;
  private lastShot: number = 0;
  
  private activePowerUps = {
    double: 0,
    shield: 0,
    laser: 0
  };
  
  private comboTimer: number = 0;
  private bgStars: {x: number, y: number, speed: number, size: number}[] = [];
  private shakeTime: number = 0;
  private shakeMagnitude: number = 0;

  // Sprites
  private sprites: { [key: string]: HTMLImageElement } = {};
  private spritesLoaded: boolean = false;

  constructor(
    canvas: HTMLCanvasElement, 
    onStateChange: (state: GameState) => void,
    onScore: (points: number) => void,
    upgrades: Upgrades = { fireRate: 0, moveSpeed: 0, extraLives: 0, bulletDamage: 0, shieldDuration: 0 }
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.onStateChange = onStateChange;
    this.onScore = onScore;
    this.upgrades = upgrades;
    
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.state = {
      score: 0,
      level: 1,
      combo: 1,
      lives: 3 + this.upgrades.extraLives,
      isGameOver: false,
      isPlaying: false,
      isPaused: false
    };

    // Init background stars
    for (let i = 0; i < 50; i++) {
      this.bgStars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: 0.5 + Math.random() * 2,
        size: Math.random() * 2
      });
    }

    this.player = {
      x: this.width / 2 - 20,
      y: this.height - 70,
      width: 40,
      height: 40,
      vx: 0,
      vy: 0,
      hp: 1,
      type: 'player'
    };

    this.initInputs();
    this.loadAllSprites();
  }

  public handleResize(width: number, height: number) {
    this.width = width;
    this.height = height;
    
    // Keep player in bounds on resize
    if (this.player.x > this.width - this.player.width) {
      this.player.x = this.width - this.player.width;
    }
    this.player.y = this.height - 70;
  }

  private async loadAllSprites() {
    this.sprites['player'] = await loadSprite(PLAYER_SVG);
    this.sprites['alien1'] = await loadSprite(ENEMY1_SVG);
    this.sprites['alien2'] = await loadSprite(ENEMY2_SVG);
    this.sprites['boss'] = await loadSprite(BOSS_SVG);
    this.sprites['proj_player'] = await loadSprite(PROJECTILE_PLAYER_SVG);
    this.sprites['proj_enemy'] = await loadSprite(PROJECTILE_ENEMY_SVG);
    this.sprites['power_double'] = await loadSprite(POWERUP_DOUBLE_SVG);
    this.sprites['power_laser'] = await loadSprite(POWERUP_LASER_SVG);
    this.sprites['power_shield'] = await loadSprite(POWERUP_SHIELD_SVG);
    this.spritesLoaded = true;
  }

  private initInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public cleanup() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (['Space', 'KeyX', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
      e.preventDefault();
    }
    this.keys[e.code] = true;
    if (e.code === 'KeyX' || e.code === 'Space') this.isShooting = true;
    if (e.code === 'KeyP' || e.code === 'Escape') this.togglePause();
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (['Space', 'KeyX', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
      e.preventDefault();
    }
    this.keys[e.code] = false;
    if (e.code === 'KeyX' || e.code === 'Space') this.isShooting = false;
  };

  public setShooting(shooting: boolean) {
    this.isShooting = shooting;
  }

  public setMoveDir(dir: number) {
    if (dir === -1) {
      this.keys['ArrowLeft'] = true;
      this.keys['ArrowRight'] = false;
    } else if (dir === 1) {
      this.keys['ArrowRight'] = true;
      this.keys['ArrowLeft'] = false;
    } else {
      this.keys['ArrowLeft'] = false;
      this.keys['ArrowRight'] = false;
    }
  }

  public togglePause() {
    if (!this.state.isPlaying || this.state.isGameOver) return;
    this.state.isPaused = !this.state.isPaused;
    this.onStateChange({ ...this.state });
    
    if (!this.state.isPaused) {
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    }
  }

  public start() {
    this.state = {
      score: 0,
      level: 1,
      combo: 1,
      lives: 3 + this.upgrades.extraLives,
      isGameOver: false,
      isPlaying: true,
      isPaused: false
    };
    
    this.player.hp = 1;
    this.activePowerUps = { double: 0, shield: 0, laser: 0 };
    
    this.spawnWave();
    
    this.onStateChange({ ...this.state });
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  private spawnWave() {
    this.enemies = [];
    this.projectiles = [];
    this.powerups = [];
    
    const isBossLevel = this.state.level % 5 === 0;

    if (isBossLevel) {
      this.enemies.push({
        x: this.width / 2 - 40,
        y: 50,
        width: 80,
        height: 80,
        vx: 3 + this.state.level * 0.2,
        vy: 0,
        hp: 30 + this.state.level * 5,
        type: 'boss'
      });
      this.baseEnemyInterval = 500;
    } else {
      const rows = Math.min(3 + Math.floor(this.state.level / 2), 6);
      const cols = 6;
      
      const padding = 15;
      const enemyW = 32;
      const enemyH = 24;
      
      const startX = (this.width - (cols * (enemyW + padding))) / 2;
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          this.enemies.push({
            x: startX + c * (enemyW + padding),
            y: 50 + r * (enemyH + padding),
            width: enemyW,
            height: enemyH,
            vx: 0,
            vy: 0,
            hp: 1 + Math.floor(this.state.level / 4),
            type: r % 2 === 0 ? 'alien1' : 'alien2',
            startX: startX + c * (enemyW + padding) // for sine wave
          });
        }
      }
      this.baseEnemyInterval = Math.max(100, 1000 - this.state.level * 100);
    }
  }

  private firePlayer() {
    audio.playShoot();
    const shots = this.activePowerUps.double > 0 ? 2 : 1;
    const isLaser = this.activePowerUps.laser > 0;
    
    if (isLaser) {
      this.projectiles.push({
        x: this.player.x + this.player.width / 2 - 6,
        y: this.player.y - 10,
        width: 12,
        height: 30,
        vx: 0,
        vy: -15,
        hp: 3, // Penetrates
        type: 'laser',
        owner: 'player'
      });
      return;
    }

    if (shots === 1) {
      this.projectiles.push({
        x: this.player.x + this.player.width / 2 - 4,
        y: this.player.y - 10,
        width: 8,
        height: 12,
        vx: 0,
        vy: -10,
        hp: 1 + this.upgrades.bulletDamage,
        type: 'bean',
        owner: 'player'
      });
    } else {
      this.projectiles.push({
        x: this.player.x + 5,
        y: this.player.y - 10,
        width: 8,
        height: 12,
        vx: 0,
        vy: -10,
        hp: 1 + this.upgrades.bulletDamage,
        type: 'bean',
        owner: 'player'
      });
      this.projectiles.push({
        x: this.player.x + this.player.width - 13,
        y: this.player.y - 10,
        width: 8,
        height: 12,
        vx: 0,
        vy: -10,
        hp: 1 + this.upgrades.bulletDamage,
        type: 'bean',
        owner: 'player'
      });
    }
  }

  private createExplosion(x: number, y: number, color: string) {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        maxLife: 20 + Math.random() * 20,
        color,
        size: 2 + Math.random() * 3
      });
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      x, y, text, color, life: 0, maxLife: 40
    });
  }

  private screenShake(magnitude: number, duration: number) {
    this.shakeMagnitude = magnitude;
    this.shakeTime = duration;
  }

  private checkCollisions() {
    // Proj vs Enemies
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (p.owner !== 'player') continue;
      
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (
          p.x < e.x + e.width &&
          p.x + p.width > e.x &&
          p.y < e.y + e.height &&
          p.y + p.height > e.y
        ) {
          // Hit
          e.hp -= 1;
          p.hp -= 1;
          
          if (e.hp <= 0) {
            this.createExplosion(e.x + e.width/2, e.y + e.height/2, e.type === 'boss' ? '#be185d' : '#f59e0b');
            this.enemies.splice(j, 1);
            audio.playExplosion();
            
            const points = e.type === 'boss' ? 500 : 10;
            const pointsEarned = points * this.state.combo;
            this.state.score += pointsEarned;
            this.onScore(pointsEarned);
            this.addFloatingText(e.x, e.y, '+' + pointsEarned, '#D4AF37');
            
            this.state.combo++;
            this.comboTimer = 2000;
            
            if (e.type === 'boss') {
              this.screenShake(10, 30);
            } else {
              this.screenShake(2, 5);
            }

            // Power up drop
            if (Math.random() < 0.1) {
              const pTypes = ['double', 'shield', 'laser'];
              this.powerups.push({
                x: e.x + e.width/2 - 10,
                y: e.y + e.height/2,
                width: 20,
                height: 20,
                vx: 0,
                vy: 3,
                hp: 1,
                type: pTypes[Math.floor(Math.random() * pTypes.length)]
              });
            }
          } else {
             // Boss hit
             this.createExplosion(p.x, p.y, '#facc15');
             this.screenShake(1, 3);
          }
          
          if (p.hp <= 0) {
            this.projectiles.splice(i, 1);
            break;
          }
        }
      }
    }
    
    // Proj vs Player
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (p.owner === 'player') continue;
      
      // Slightly smaller hitbox for player for fairness
      const px = this.player.x + 4;
      const pw = this.player.width - 8;
      const py = this.player.y + 4;
      const ph = this.player.height - 8;

      if (
        p.x < px + pw &&
        p.x + p.width > px &&
        p.y < py + ph &&
        p.y + p.height > py
      ) {
        this.projectiles.splice(i, 1);
        this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#ef4444');
        this.screenShake(8, 20);
        this.takeDamage();
        audio.playHurt();
        break;
      }
    }
    
    // Powerups vs Player
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      if (
        p.x < this.player.x + this.player.width &&
        p.x + p.width > this.player.x &&
        p.y < this.player.y + this.player.height &&
        p.y + p.height > this.player.y
      ) {
        const typeKey = p.type as 'double' | 'shield' | 'laser';
        this.activePowerUps[typeKey] = typeKey === 'double' ? 500 : typeKey === 'shield' ? 1000 + (this.upgrades.shieldDuration * 200) : 300;
        this.powerups.splice(i, 1);
        this.addFloatingText(this.player.x, this.player.y - 20, p.type.toUpperCase() + '!', '#38bdf8');
        audio.playPowerUp();
      }
    }
    
    // Enemies vs Player (Game over)
    for (const e of this.enemies) {
      if (e.y + e.height > this.player.y) {
        this.state.lives = 0;
        this.takeDamage();
        break;
      }
    }
  }

  private takeDamage() {
    if (this.activePowerUps.shield > 0) {
      this.activePowerUps.shield = 0;
      this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#38bdf8');
      this.addFloatingText(this.player.x, this.player.y - 20, "SHIELD BROKEN", '#38bdf8');
      return;
    }
    
    this.state.lives--;
    this.state.combo = 1;
    this.onStateChange({ ...this.state });
    
    if (this.state.lives <= 0) {
      this.state.isGameOver = true;
      this.state.isPlaying = false;
      this.onStateChange({ ...this.state });
    }
  }

  private gameLoop = (timestamp: number) => {
    if (!this.state.isPlaying || this.state.isGameOver || this.state.isPaused || !this.spritesLoaded) {
      if (!this.state.isGameOver && !this.state.isPaused && !this.spritesLoaded) {
          this.animationId = requestAnimationFrame(this.gameLoop);
      }
      return;
    }

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    try {
      this.update(deltaTime);
      this.draw();
    } catch (e) {
      console.error('GameLoop error:', e);
    }

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number) {
    // Player move (Speed upgrade affects it)
    const speed = 5 + (this.upgrades.moveSpeed * 1);
    if (this.keys['ArrowLeft']) this.player.x -= speed;
    if (this.keys['ArrowRight']) this.player.x += speed;
    
    this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));
    
    // Player shoot (Fire rate upgrade affects it)
    const fireInterval = Math.max(100, 300 - (this.upgrades.fireRate * 30));
    if (this.isShooting && performance.now() - this.lastShot > fireInterval) {
      this.firePlayer();
      this.lastShot = performance.now();
    }
    
    // Powerups
    if (this.activePowerUps.double > 0) this.activePowerUps.double--;
    if (this.activePowerUps.shield > 0) this.activePowerUps.shield--;
    if (this.activePowerUps.laser > 0) this.activePowerUps.laser--;
    
    // Combo
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime;
      if (this.comboTimer <= 0) {
        this.state.combo = 1;
        this.onStateChange({ ...this.state });
      }
    }
    
    // Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -50 || p.y > this.height + 50) {
        this.projectiles.splice(i, 1);
      }
    }
    
    // Drops
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.y += p.vy;
      if (p.y > this.height) {
        this.powerups.splice(i, 1);
      }
    }
    
    // Background
    for (const star of this.bgStars) {
      star.y += star.speed;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }

    // Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y -= 1;
      t.life++;
      if (t.life > t.maxLife) this.floatingTexts.splice(i, 1);
    }

    // Screen Shake
    if (this.shakeTime > 0) {
      this.shakeTime--;
    }
    
    const isBossLevel = this.state.level % 5 === 0;

    if (isBossLevel && this.enemies.length > 0) {
      const boss = this.enemies[0];
      boss.x += boss.vx;
      
      if (boss.x < 0 || boss.x + boss.width > this.width) {
         boss.vx *= -1;
         boss.x = Math.max(0, Math.min(this.width - boss.width, boss.x));
      }

      // Boss shooting
      if (Math.random() < 0.05 + (this.state.level * 0.005)) {
         // Shoot 3 projectiles
         const spread = -2 + Math.random() * 4;
         this.projectiles.push({
          x: boss.x + boss.width / 2,
          y: boss.y + boss.height,
          width: 8,
          height: 12,
          vx: spread,
          vy: 6,
          hp: 1,
          type: 'drip',
          owner: 'enemy'
        });
      }
    } else {
      // Normal enemies movement
      if (performance.now() - this.lastEnemyMove > this.baseEnemyInterval) {
        this.lastEnemyMove = performance.now();
        
        let hitEdge = false;
        for (const e of this.enemies) {
          if ((e.x <= 10 && this.enemyDirection === -1) || 
              (e.x + e.width >= this.width - 10 && this.enemyDirection === 1)) {
            hitEdge = true;
            break;
          }
        }
        
        if (hitEdge) {
          this.enemyDirection *= -1;
          for (const e of this.enemies) {
            e.y += this.enemyDropSpeed;
          }
        } else {
          const moveTime = performance.now() * 0.002;
          for (const e of this.enemies) {
            // Alien2 uses sine wave movement relative to its grid pos
            if (e.type === 'alien2' && e.startX !== undefined) {
               e.startX += this.enemyDirection * 15;
               e.x = e.startX + Math.sin(moveTime + e.y) * 20;
            } else {
               e.x += this.enemyDirection * 15;
               if (e.startX !== undefined) e.startX = e.x;
            }
          }
        }
        
        // Enemy Shooting
        if (this.enemies.length > 0) {
          const columns = new Map<number, Entity>();
          for (const e of this.enemies) {
             const col = Math.floor(e.x / 40);
            if (!columns.has(col) || columns.get(col)!.y < e.y) {
              columns.set(col, e);
            }
          }
          
          const shooters = Array.from(columns.values());
          if (Math.random() < 0.3 + (this.state.level * 0.05)) {
            const shooter = shooters[Math.floor(Math.random() * shooters.length)];
            this.projectiles.push({
              x: shooter.x + shooter.width / 2 - 4,
              y: shooter.y + shooter.height,
              width: 8,
              height: 12,
              vx: 0,
              vy: 4 + (this.state.level * 0.5),
              hp: 1,
              type: 'drip',
              owner: 'enemy'
            });
          }
        }
      } else {
         // Smooth update for alien2
         const moveTime = performance.now() * 0.002;
         for (const e of this.enemies) {
            if (e.type === 'alien2' && e.startX !== undefined) {
               e.x = e.startX + Math.sin(moveTime + e.y) * 15;
            }
         }
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    this.checkCollisions();
    
    // Wave clear
    if (this.enemies.length === 0 && this.state.isPlaying) {
      this.state.level++;
      this.spawnWave();
      this.onStateChange({ ...this.state });
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.save();
    
    // Apply Shake
    if (this.shakeTime > 0) {
       const dx = (Math.random() - 0.5) * this.shakeMagnitude;
       const dy = (Math.random() - 0.5) * this.shakeMagnitude;
       this.ctx.translate(dx, dy);
    }

    // Draw background stars
    this.ctx.fillStyle = '#ffffff';
    for (const star of this.bgStars) {
      this.ctx.globalAlpha = Math.max(0, Math.min(1, 0.2 + (star.speed / 4)));
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    this.ctx.globalAlpha = 1;
    
    // Draw particles
    for (const p of this.particles) {
      this.ctx.globalAlpha = Math.max(0, Math.min(1, 1 - (p.life / p.maxLife)));
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, p.size, p.size); // Pixel style particles
    }
    this.ctx.globalAlpha = 1;

    // Draw player
    if (this.sprites['player']) {
      this.ctx.drawImage(this.sprites['player'], this.player.x, this.player.y, this.player.width, this.player.height);
    } else {
      this.ctx.fillStyle = '#475569';
      this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    }
    
    // Draw Shield
    if (this.activePowerUps.shield > 0) {
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      // Hexagon or square shield for retro feel
      this.ctx.rect(this.player.x - 4, this.player.y - 4, this.player.width + 8, this.player.height + 8);
      this.ctx.stroke();
    }

    // Draw enemies
    for (const e of this.enemies) {
      const sprite = this.sprites[e.type];
      if (sprite) {
         this.ctx.drawImage(sprite, e.x, e.y, e.width, e.height);
         // If boss, draw health bar
         if (e.type === 'boss') {
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(e.x, e.y - 10, e.width, 5);
            this.ctx.fillStyle = '#ef4444';
            const hpPerc = e.hp / (30 + this.state.level * 5);
            this.ctx.fillRect(e.x, e.y - 10, e.width * Math.max(0, hpPerc), 5);
         }
      } else {
         this.ctx.fillStyle = e.type === 'alien1' ? '#ef4444' : '#f59e0b';
         this.ctx.fillRect(e.x, e.y, e.width, e.height);
      }
    }

    // Draw projectiles
    for (const p of this.projectiles) {
       const spriteName = p.type === 'bean' ? 'proj_player' : (p.type === 'drip' ? 'proj_enemy' : null);
       if (spriteName && this.sprites[spriteName]) {
          this.ctx.drawImage(this.sprites[spriteName], p.x, p.y, p.width, p.height);
       } else {
          this.ctx.fillStyle = p.owner === 'player' ? (p.type === 'laser' ? '#a855f7' : '#d4af37') : '#4ade80';
          this.ctx.fillRect(p.x, p.y, p.width, p.height);
       }
    }
    
    // Draw powerups
    for (const p of this.powerups) {
      const spriteName = `power_${p.type}`;
      if (this.sprites[spriteName]) {
         this.ctx.drawImage(this.sprites[spriteName], p.x, p.y, p.width, p.height);
      } else {
         this.ctx.fillStyle = p.type === 'double' ? '#facc15' : (p.type === 'shield' ? '#38bdf8' : '#a855f7');
         this.ctx.fillRect(p.x, p.y, p.width, p.height);
      }
    }

    // Draw Floating Text
    this.ctx.font = '16px "Courier New", monospace';
    this.ctx.textAlign = 'center';
    for (const t of this.floatingTexts) {
       this.ctx.globalAlpha = Math.max(0, Math.min(1, 1 - (t.life / t.maxLife)));
       this.ctx.fillStyle = t.color;
       this.ctx.fillText(t.text, t.x, t.y);
    }
    this.ctx.globalAlpha = 1;

    this.ctx.restore();
  }
}
