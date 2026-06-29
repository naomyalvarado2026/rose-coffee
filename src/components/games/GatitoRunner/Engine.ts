import type { Particle } from './Sprites';
import { updateAndDrawParticles, createParticles, drawSprite } from './Sprites';

export interface GatitoConfig {
  id: string;
  name: string;
  desc: string;
  price: number;
  color: string;
  apronColor: string;
  jumpCount: number;
  hasShield: boolean;
  magnetDuration: number; // in frames
}

export const GATITO_SKINS: GatitoConfig[] = [
  { id: 'street', name: 'Gato Callejero', desc: 'Con mandil negro', price: 0, color: '#f97316', apronColor: '#1c1917', jumpCount: 1, hasShield: false, magnetDuration: 600 },
  { id: 'ninja', name: 'Gato Ninja', desc: 'Doble salto + mandil rojo', price: 3000, color: '#1e293b', apronColor: '#b91c1c', jumpCount: 2, hasShield: false, magnetDuration: 600 },
  { id: 'magnet', name: 'Gato Imán', desc: 'Imán x2 + mandil azul', price: 8000, color: '#fcd34d', apronColor: '#1d4ed8', jumpCount: 1, hasShield: false, magnetDuration: 1200 },
  { id: 'tank', name: 'Gato Tanque', desc: 'Escudo inicial + mandil dorado', price: 15000, color: '#475569', apronColor: '#eab308', jumpCount: 1, hasShield: true, magnetDuration: 600 },
];

export const DEFAULT_GATITO = GATITO_SKINS[0];

export interface GameState {
  canvasWidth: number;
  canvasHeight: number;
  score: number;
  lives: number;
  isPlaying: boolean;
  isGameOver: boolean;
  speed: number;
  groundY: number;
  frames: number;
  level: number;
  bossActive: boolean;
  combo: number;
  sugarRushFrames: number;
  lastBossLevel?: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  jumpsLeft: number;
  isHurt: boolean;
  hurtFrames: number;
  runFrame: number;
  isCrouching: boolean;
  shieldActive: boolean;
  magnetActiveFrames: number;
  ammo: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'bread' | 'croissant' | 'donut' | 'spill' | 'boss_projectile' | 'bird_1' | 'bird_2';
  passed: boolean;
  vy?: number;
  hitHp?: number; // Some enemies can take hits
  hurtFrames?: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  active: boolean;
}

export interface Item {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'coin' | 'magnet' | 'shield' | 'gold_coin' | 'espresso' | 'latte';
  collected: boolean;
  vx?: number;
  vy?: number;
}

export class GatitoEngine {
  public state: GameState;
  public player: Player;
  public obstacles: Obstacle[];
  public items: Item[];
  public projectiles: Projectile[];
  public particles: Particle[];
  public onGameOver?: (score: number) => void;
  public onShoot?: () => void;
  
  private sprites: Record<string, HTMLImageElement>;
  private config: GatitoConfig;
  
  private GRAVITY = 0.8;
  private JUMP_FORCE = -14;
  private readonly BASE_SPEED = 6;
  
  private bossHp = 0;
  private bossY = 0;
  private bossDirection = 1;
  private bossHurtFrames = 0;
  private cloudPositions: {x: number, y: number, scale: number, speed: number}[] = [];

  constructor(width: number, height: number, sprites: Record<string, HTMLImageElement>, config: GatitoConfig) {
    this.sprites = sprites;
    this.config = config;
    
    this.state = {
      canvasWidth: width,
      canvasHeight: height,
      score: 0,
      lives: 3,
      isPlaying: false,
      isGameOver: false,
      speed: this.BASE_SPEED,
      groundY: height - 50,
      frames: 0,
      level: 1,
      bossActive: false,
      combo: 0,
      sugarRushFrames: 0,
      lastBossLevel: 0,
    };

    this.player = {
      x: 50,
      y: this.state.groundY - 50,
      width: 50,
      height: 50,
      vy: 0,
      jumpsLeft: config.jumpCount,
      isHurt: false,
      hurtFrames: 0,
      runFrame: 0,
      isCrouching: false,
      shieldActive: config.hasShield,
      magnetActiveFrames: 0,
      ammo: 3, // start with 3 espresso shots
    };

    this.obstacles = [];
    this.items = [];
    this.projectiles = [];
    this.particles = [];
    
    // Init clouds
    for(let i=0; i<5; i++) {
       this.cloudPositions.push({
          x: Math.random() * width,
          y: Math.random() * (height / 2),
          scale: 0.5 + Math.random() * 1.5,
          speed: 0.2 + Math.random() * 0.5
       });
    }
  }

  public setConfig(config: GatitoConfig) {
    this.config = config;
    this.player.jumpsLeft = config.jumpCount;
    this.player.shieldActive = config.hasShield;
  }

  public reset() {
    this.state.score = 0;
    this.state.lives = 3;
    this.state.isPlaying = true;
    this.state.isGameOver = false;
    this.state.speed = this.BASE_SPEED;
    this.state.frames = 0;
    this.state.level = 1;
    this.state.bossActive = false;
    this.state.combo = 0;
    this.state.sugarRushFrames = 0;
    this.state.lastBossLevel = 0;
    
    this.obstacles = [];
    this.items = [];
    this.projectiles = [];
    this.particles = [];
    
    this.player.y = this.state.groundY - this.player.height;
    this.player.vy = 0;
    this.player.jumpsLeft = this.config.jumpCount;
    this.player.isHurt = false;
    this.player.isCrouching = false;
    this.player.shieldActive = this.config.hasShield;
    this.player.magnetActiveFrames = 0;
    this.player.ammo = 3;
  }

  public jump() {
    if (!this.state.isPlaying || this.state.isGameOver) return;
    if (this.player.isCrouching) return;
    
    if (this.player.jumpsLeft > 0) {
      this.player.vy = this.JUMP_FORCE;
      this.player.jumpsLeft--;
      this.particles.push(...createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height, 5, '#d2b48c'));
    }
  }

  public jumpRelease() {
    if (this.player.vy < -5) {
      this.player.vy = -5; // variable jump height
    }
  }

  public crouch(isCrouching: boolean) {
    if (!this.state.isPlaying || this.state.isGameOver) return;
    if (isCrouching && this.player.y < this.state.groundY - this.player.height) {
      this.player.vy += 12; // Caida rapida "snappy"
    }
    this.player.isCrouching = isCrouching;
  }

  public shoot() {
    if (!this.state.isPlaying || this.state.isGameOver) return;
    if (this.player.ammo > 0) {
      this.player.ammo--;
      this.projectiles.push({
         x: this.player.x + this.player.width,
         y: this.player.isCrouching ? this.player.y + (this.player.height * 0.5) : this.player.y + (this.player.height * 0.3),
         vx: this.state.speed * 2,
         active: true
      });
      if (this.onShoot) this.onShoot();
    }
  }

  private handleCombo(increase: boolean) {
    if (increase) {
      if (this.state.sugarRushFrames <= 0) {
        this.state.combo++;
        if (this.state.combo >= 10) {
          // Trigger Sugar Rush
          this.state.sugarRushFrames = 480; // 8 seconds at 60fps
          this.state.combo = 0; // reset
          // Spawn explosion of particles
          this.particles.push(...createParticles(this.player.x, this.player.y, 50, '#f472b6'));
        }
      }
    } else {
      this.state.combo = 0;
    }
  }

  private triggerBossPinata() {
    this.particles.push(...createParticles(this.state.canvasWidth - 150, this.bossY + 50, 100, '#eab308'));
    for (let i = 0; i < 30; i++) {
      this.items.push({
        x: this.state.canvasWidth - 150,
        y: this.bossY + 50,
        width: 30,
        height: 30,
        type: 'gold_coin',
        collected: false,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 1) * 15
      });
    }
  }

  public update() {
    if (!this.state.isPlaying || this.state.isGameOver) return;

    this.state.frames++;
    
    const isSugarRush = this.state.sugarRushFrames > 0;
    if (isSugarRush) {
      this.state.sugarRushFrames--;
    }

    const currentMultiplier = isSugarRush ? 2 : (1 + Math.floor(this.state.combo / 2));
    this.state.speed = (this.BASE_SPEED + Math.floor(this.state.frames / 1000)) * (isSugarRush ? 1.5 : 1);
    
    // Level up every 10000 points
    this.state.level = 1 + Math.floor(this.state.score / 10000);

    // Player Physics
    this.player.vy += this.GRAVITY;
    this.player.y += this.player.vy;

    const currentHeight = this.player.isCrouching ? this.player.height * 0.6 : this.player.height;

    // Ground Collision
    if (this.player.y >= this.state.groundY - currentHeight) {
      this.player.y = this.state.groundY - currentHeight;
      this.player.vy = 0;
      this.player.jumpsLeft = this.config.jumpCount; // Reset jumps
    }

    // Player Animation
    if (this.player.y >= this.state.groundY - currentHeight) {
      if (this.state.frames % 10 === 0) {
        this.player.runFrame = this.player.runFrame === 1 ? 2 : 1;
      }
    } else {
      this.player.runFrame = 0;
    }

    // Hurt State & Magnet
    if (this.player.isHurt) {
      this.player.hurtFrames--;
      if (this.player.hurtFrames <= 0) {
        this.player.isHurt = false;
      }
    }
    if (this.player.magnetActiveFrames > 0) {
      this.player.magnetActiveFrames--;
    }

    // Boss Logic
    if (this.state.bossActive) {
      // Move boss up and down
      this.bossY += this.bossDirection * 2;
      if (this.bossY < this.state.groundY - 200) this.bossDirection = 1;
      if (this.bossY > this.state.groundY - 100) this.bossDirection = -1;

      // Boss shoots
      if (this.state.frames % 90 === 0) {
        this.obstacles.push({
          x: this.state.canvasWidth - 120,
          y: this.bossY + 50,
          width: 30,
          height: 30,
          type: 'boss_projectile',
          passed: false
        });
      }
      
      // Boss Stomp mechanic
      const bossHitbox = { x: this.state.canvasWidth - 150, y: this.bossY, w: 100, h: 100 };
      if (this.player.vy > 0 && 
          this.player.y + currentHeight >= bossHitbox.y && 
          this.player.y + currentHeight <= bossHitbox.y + 40 &&
          this.player.x + this.player.width > bossHitbox.x &&
          this.player.x < bossHitbox.x + bossHitbox.w) {
        
        // Bounced on head!
        this.player.vy = this.JUMP_FORCE; // bounce off
        this.bossHp--;
        this.bossHurtFrames = 10;
        this.particles.push(...createParticles(this.player.x + this.player.width/2, this.player.y + currentHeight, 20, '#ffffff'));
        
        if (this.bossHp <= 0) {
          this.state.bossActive = false;
          this.state.score += 2000;
          this.triggerBossPinata();
        }
      }
    } else {
      // Spawn boss at level 3, 6, 9 etc
      if (this.state.level % 3 === 0 && this.state.level > 1 && !isSugarRush && this.state.level !== this.state.lastBossLevel) {
        this.state.bossActive = true;
        this.state.lastBossLevel = this.state.level;
        this.bossHp = 5; // increased hp for boss
        this.bossY = this.state.groundY - 150;
      }
    }

    // Update projectiles
    this.projectiles.forEach(p => {
       p.x += p.vx;
       
       // check boss collision
       if (this.state.bossActive) {
          const bossHitbox = { x: this.state.canvasWidth - 150, y: this.bossY, w: 100, h: 100 };
          if (p.x > bossHitbox.x && p.x < bossHitbox.x + bossHitbox.w &&
              p.y > bossHitbox.y && p.y < bossHitbox.y + bossHitbox.h) {
             p.active = false;
             this.bossHp -= 0.5; // Beans do half damage
             this.bossHurtFrames = 10;
             this.particles.push(...createParticles(p.x, p.y, 10, '#78350f'));
             if (this.bossHp <= 0) {
                this.state.bossActive = false;
                this.state.score += 2000;
                this.triggerBossPinata();
             }
             return;
          }
       }
       
       // check obstacles collision
       this.obstacles.forEach(obs => {
          if (!obs.passed && obs.type !== 'spill' && p.x > obs.x && p.x < obs.x + obs.width && p.y > obs.y && p.y < obs.y + obs.height) {
             p.active = false;
             obs.hitHp = (obs.hitHp || 1) - 1;
             obs.hurtFrames = 10;
             this.particles.push(...createParticles(p.x, p.y, 10, '#c68e17'));
             if (obs.hitHp <= 0) {
                obs.passed = true;
                obs.y = 9999;
                this.state.score += 150 * currentMultiplier; // bonus for shooting
             }
          }
       });
    });
    
    this.projectiles = this.projectiles.filter(p => p.active && p.x < this.state.canvasWidth);

    // Items update
    this.items.forEach(item => {
      if (item.vx !== undefined && item.vy !== undefined) {
         // Pinata coins physics
         item.vy += this.GRAVITY;
         item.x += item.vx;
         item.y += item.vy;
         if (item.y > this.state.groundY - item.height) {
            item.y = this.state.groundY - item.height;
            item.vy = -item.vy * 0.5;
            item.vx *= 0.8;
         }
      } else {
        item.x -= this.state.speed;
        // Magnet effect
        if (this.player.magnetActiveFrames > 0 && item.type.includes('coin')) {
          const dx = this.player.x - item.x;
          const dy = this.player.y - item.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300) {
            item.x += (dx / dist) * 10;
            item.y += (dy / dist) * 10;
          }
        }
      }

      if (!item.collected && 
          this.player.x < item.x + item.width &&
          this.player.x + this.player.width > item.x &&
          this.player.y < item.y + item.height &&
          this.player.y + currentHeight > item.y) {
        
        item.collected = true;
        this.handleCombo(true);
        if (item.type === 'coin') this.state.score += 50 * currentMultiplier;
        if (item.type === 'gold_coin') this.state.score += 1000 * currentMultiplier;
        if (item.type === 'shield') this.player.shieldActive = true;
        if (item.type === 'magnet') this.player.magnetActiveFrames = this.config.magnetDuration;
        if (item.type === 'espresso') this.player.ammo += 3; // +3 shots
        if (item.type === 'latte') this.state.lives = Math.min(3, this.state.lives + 1);
        
        this.particles.push(...createParticles(item.x, item.y, 10, '#fcd34d'));
      }
    });

    // Obstacles update
    this.obstacles.forEach((obs) => {
      // Sugar rush destroys obstacles near player
      if (isSugarRush && Math.abs(this.player.x - obs.x) < 300) {
        obs.passed = true;
        this.particles.push(...createParticles(obs.x, obs.y, 10, '#cbd5e1'));
        obs.y = 9999; // throw away
        return;
      }

      if (obs.type === 'boss_projectile') {
        obs.x -= this.state.speed * 1.5;
      } else {
        obs.x -= this.state.speed;
      }

      if (!obs.passed && obs.x + obs.width < this.player.x) {
        obs.passed = true;
        this.state.score += 100 * currentMultiplier;
      }

      if (!this.player.isHurt && !obs.passed) {
        const hitboxPadding = 15; // Increased padding to make it fairer
        if (
          this.player.x + hitboxPadding < obs.x + obs.width - hitboxPadding &&
          this.player.x + this.player.width - hitboxPadding > obs.x + hitboxPadding &&
          this.player.y + hitboxPadding < obs.y + obs.height - hitboxPadding &&
          this.player.y + currentHeight - hitboxPadding > obs.y + hitboxPadding
        ) {
          if (this.player.shieldActive) {
             this.player.shieldActive = false;
             this.player.isHurt = true;
             this.player.hurtFrames = 60;
             this.particles.push(...createParticles(this.player.x, this.player.y, 30, '#60a5fa'));
          } else {
            this.player.isHurt = true;
            this.player.hurtFrames = 60;
            this.state.lives--;
            this.handleCombo(false);
            this.particles.push(...createParticles(this.player.x + this.player.width / 2, this.player.y + currentHeight / 2, 20, '#ff4444'));

            if (this.state.lives <= 0) {
              this.state.isGameOver = true;
              this.state.isPlaying = false;
              if (this.onGameOver) this.onGameOver(this.state.score);
            }
          }
        }
      }
    });

    this.obstacles = this.obstacles.filter(obs => obs.x + obs.width > 0);
    this.items = this.items.filter(item => !item.collected && (item.vx !== undefined || item.x + item.width > 0));

    // Spawn Logic
    if (!this.state.bossActive && !isSugarRush && this.state.frames % Math.max(40, 100 - Math.floor(this.state.speed * 2)) === 0) {
      if (Math.random() > 0.3) {
        const r = Math.random();
        if (r < 0.1) {
          // Spawn powerup
          this.items.push({
            x: this.state.canvasWidth,
            y: this.state.groundY - 100,
            width: 30, height: 30,
            type: Math.random() > 0.5 ? 'shield' : 'magnet',
            collected: false
          });
        } else if (r < 0.3) {
           // Spawn collectable ammo/health
           this.items.push({
              x: this.state.canvasWidth,
              y: this.state.groundY - 100,
              width: 30, height: 30,
              type: Math.random() > 0.6 ? 'espresso' : 'latte',
              collected: false
           });
        } else if (r < 0.5) {
          // Spawn coin
          this.items.push({
            x: this.state.canvasWidth,
            y: this.state.groundY - 40 - Math.random() * 80,
            width: 30, height: 30,
            type: 'coin', collected: false
          });
        } else {
          // Spawn obstacle
          const types: Obstacle['type'][] = ['bread', 'croissant', 'donut', 'spill', 'bird_1'];
          const type = types[Math.floor(Math.random() * types.length)];
          
          if (type === 'spill') {
             this.obstacles.push({
              x: this.state.canvasWidth, y: this.state.groundY - 15,
              width: 50, height: 15, type: 'spill', passed: false
             });
          } else if (type === 'bird_1') {
             this.obstacles.push({
              x: this.state.canvasWidth, y: this.state.groundY - 80 - Math.random() * 40,
              width: 40, height: 30, type: 'bird_1', passed: false, hitHp: 1
            });
          } else if (type === 'donut') {
             this.obstacles.push({
              x: this.state.canvasWidth, y: this.state.groundY - 40,
              width: 40, height: 40, type: 'donut', passed: false, hitHp: 2
             });
          } else {
            this.obstacles.push({
              x: this.state.canvasWidth, y: this.state.groundY - 35,
              width: 40, height: 35, type, passed: false, hitHp: 1
            });
          }
        }
      }
    }
    
    // Sugar rush spawner
    if (isSugarRush && this.state.frames % 10 === 0) {
       this.items.push({
          x: this.state.canvasWidth,
          y: this.state.groundY - 20 - Math.random() * 150,
          width: 30, height: 30,
          type: 'gold_coin', collected: false
       });
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    const isSugarRush = this.state.sugarRushFrames > 0;
    
    // Clear
    ctx.clearRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
    
    if (isSugarRush) {
       ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
       ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
    }

    // Parallax Clouds
    this.cloudPositions.forEach(cloud => {
       cloud.x -= this.state.speed * cloud.speed;
       if (cloud.x + 100 * cloud.scale < 0) {
          cloud.x = this.state.canvasWidth;
          cloud.y = Math.random() * (this.state.canvasHeight / 2);
       }
       ctx.fillStyle = isSugarRush ? 'rgba(255, 200, 230, 0.5)' : 'rgba(255, 255, 255, 0.6)';
       ctx.beginPath();
       const cx = cloud.x;
       const cy = cloud.y;
       const r = 20 * cloud.scale;
       ctx.arc(cx, cy, r, 0, Math.PI * 2);
       ctx.arc(cx + r, cy - r*0.5, r*1.2, 0, Math.PI * 2);
       ctx.arc(cx + r*2.2, cy, r*0.8, 0, Math.PI * 2);
       ctx.fill();
    });

    // Ground Parallax Colors (change by level)
    const levelColors = ['#e5e7eb', '#dcfce7', '#ffedd5', '#e0e7ff', '#fce7f3'];
    const groundColor = isSugarRush ? '#f472b6' : levelColors[(this.state.level - 1) % levelColors.length];

    ctx.beginPath();
    ctx.moveTo(0, this.state.groundY);
    ctx.lineTo(this.state.canvasWidth, this.state.groundY);
    ctx.strokeStyle = groundColor; 
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, this.state.groundY, this.state.canvasWidth, this.state.canvasHeight - this.state.groundY);
    
    ctx.fillStyle = isSugarRush ? '#fbcfe8' : '#9ca3af';
    const dotSpacing = 80;
    const offset = -(this.state.frames * this.state.speed) % dotSpacing;
    for(let i = 0; i < this.state.canvasWidth / dotSpacing + 2; i++) {
        ctx.beginPath();
        ctx.arc(i * dotSpacing + offset, this.state.groundY + 15, 3, 0, Math.PI * 2);
        ctx.arc(i * dotSpacing + offset + 30, this.state.groundY + 30, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw Boss
    if (this.state.bossActive) {
      if (this.bossHurtFrames > 0) this.bossHurtFrames--;
      
      // Boss aura
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      
      const bossSpriteName = this.bossHp <= 2 ? 'boss_angry' : 'boss_normal';
      const sprite = this.sprites[bossSpriteName];
      if (sprite) {
        ctx.globalAlpha = this.bossHurtFrames > 0 && this.state.frames % 4 < 2 ? 0.5 : 1;
        drawSprite(ctx, sprite, this.state.canvasWidth - 150, this.bossY, 100, 100);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = this.bossHurtFrames > 0 ? '#ffffff' : (this.bossHp <= 2 ? '#b91c1c' : '#ef4444');
        ctx.fillRect(this.state.canvasWidth - 150, this.bossY, 100, 100);
      }
      ctx.shadowBlur = 0;
    }

    // Items
    this.items.forEach(item => {
      // Glow effect based on item type
      ctx.shadowColor = item.type.includes('coin') ? '#fbbf24' : (item.type === 'shield' ? '#3b82f6' : (item.type === 'magnet' ? '#f43f5e' : '#fcd34d'));
      ctx.shadowBlur = 15;

      const sprite = this.sprites[item.type];
      if (sprite) {
        drawSprite(ctx, sprite, item.x, item.y, item.width, item.height);
      } else {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(item.x + item.width/2, item.y + item.height/2, item.width/2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    });

    // Obstacles
    this.obstacles.forEach(obs => {
      if (obs.hurtFrames && obs.hurtFrames > 0) obs.hurtFrames--;
      
      // Enemies danger aura
      if (obs.type.startsWith('bird') || obs.type === 'boss_projectile') {
         ctx.shadowColor = '#ef4444';
         ctx.shadowBlur = 15;
      }
      
      ctx.globalAlpha = obs.hurtFrames && obs.hurtFrames > 0 && this.state.frames % 4 < 2 ? 0.5 : 1;

      // For rolling donut
      if (obs.type === 'donut') {
         const sprite = this.sprites['donut'];
         if (sprite) {
            ctx.save();
            ctx.translate(obs.x + obs.width/2, obs.y + obs.height/2);
            ctx.rotate((this.state.frames * this.state.speed) * 0.05);
            drawSprite(ctx, sprite, -obs.width/2, -obs.height/2, obs.width, obs.height);
            ctx.restore();
         }
      } else if (obs.type.startsWith('bird')) {
         const birdSprite = this.state.frames % 20 < 10 ? this.sprites['bird_1'] : this.sprites['bird_2'];
         if (birdSprite) drawSprite(ctx, birdSprite, obs.x, obs.y, obs.width, obs.height);
      } else {
        const sprite = this.sprites[obs.type];
        if (sprite) {
          drawSprite(ctx, sprite, obs.x, obs.y, obs.width, obs.height);
        } else {
          ctx.fillStyle = '#c68e17';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    });
    
    // Projectiles
    this.projectiles.forEach(p => {
       const sprite = this.sprites['projectile_bean'];
       if (sprite) {
          ctx.save();
          ctx.translate(p.x + 10, p.y + 10);
          ctx.rotate(this.state.frames * 0.2);
          drawSprite(ctx, sprite, -10, -10, 20, 20);
          ctx.restore();
       } else {
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.fill();
       }
    });

    // Draw Player
    let playerAlpha = 1;
    if (this.player.isHurt) {
      playerAlpha = this.state.frames % 10 < 5 ? 0.5 : 1; 
    }

    let catSprite = this.sprites['cat_run1'];
    if (this.player.isCrouching) {
      catSprite = this.state.frames % 10 < 5 ? this.sprites['cat_crouch1'] : this.sprites['cat_crouch2'];
    } else if (this.player.y < this.state.groundY - this.player.height) {
      catSprite = this.sprites['cat_jump'];
    } else if (this.player.runFrame === 2) {
      catSprite = this.sprites['cat_run2'];
    }

    const currentHeight = this.player.isCrouching ? this.player.height * 0.6 : this.player.height;
    const currentY = this.player.isCrouching ? this.player.y + (this.player.height * 0.4) : this.player.y;

    if (catSprite) {
      // In case we don't have cat_crouch, just scale it
      if (this.player.isCrouching && !this.sprites['cat_crouch1']) {
         drawSprite(ctx, this.sprites['cat_run1'], this.player.x, currentY, this.player.width, currentHeight, playerAlpha);
      } else {
         drawSprite(ctx, catSprite, this.player.x, currentY, this.player.width, currentHeight, playerAlpha);
      }
    } else {
      ctx.globalAlpha = playerAlpha;
      ctx.fillStyle = this.config.color;
      ctx.fillRect(this.player.x, currentY, this.player.width, currentHeight);
      ctx.globalAlpha = 1;
    }
    
    // Shield
    if (this.player.shieldActive) {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.player.x + this.player.width/2, currentY + currentHeight/2, this.player.height * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Magnet aura
    if (this.player.magnetActiveFrames > 0) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.player.x + this.player.width/2, currentY + currentHeight/2, this.player.height * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Particles
    updateAndDrawParticles(ctx, this.particles);
  }
}
