import { audio } from '../../../utils/audioEngine';

export interface TazaConfig {
  id: string;
  name: string;
  gravityMod: number; 
  sizeMod: number;    
  multiplier: number; 
  baseColor: string;
  accentColor: string;
}

export const DEFAULT_TAZA: TazaConfig = {
  id: 'classic',
  name: 'Taza Clásica',
  gravityMod: 1,
  sizeMod: 1,
  multiplier: 1,
  baseColor: '#ffffff',
  accentColor: '#451a03',
};

export const TAZA_SKINS: (TazaConfig & { price: number, desc: string })[] = [
  { ...DEFAULT_TAZA, price: 0, desc: 'Balanceada. La taza original.' },
  { 
    id: 'light', name: 'Taza Ligera', gravityMod: 0.8, sizeMod: 1, multiplier: 1, 
    baseColor: '#e0f2fe', accentColor: '#0284c7', price: 500, desc: '20% menos gravedad. Flota más.' 
  },
  { 
    id: 'espresso', name: 'Taza Espresso', gravityMod: 1, sizeMod: 0.75, multiplier: 1, 
    baseColor: '#1c1917', accentColor: '#78350f', price: 2500, desc: '25% más pequeña. Pasa fácil.' 
  },
  { 
    id: 'gold', name: 'Taza Dorada', gravityMod: 1, sizeMod: 1, multiplier: 2, 
    baseColor: '#facc15', accentColor: '#ca8a04', price: 10000, desc: 'Multiplica x2 los puntos.' 
  }
];

export class FlappyEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number = 0;
  private isGameOver: boolean = false;
  private isPlaying: boolean = false;
  public isPaused: boolean = false;
  
  private score: number = 0;
  private onScoreChange: (score: number) => void;
  private onGameOver: (score: number) => void;

  private config: TazaConfig;

  // Physics & Settings (Tweaked to be easier)
  private gravity: number = 0.45; // Lower gravity
  private jumpStrength: number = -7.5; // Smoother jump
  private baseSpeed: number = 3;
  private speed: number = 3;
  private pipeWidth: number = 60;
  private pipeGap: number = 210; // Wider gap
  
  private frames: number = 0;
  private bgOffset: number = 0; // Parallax offset

  // Game Objects
  private taza = {
    x: 50,
    y: 150,
    width: 34,
    height: 34,
    velocity: 0,
    rotation: 0
  };

  private pipes: Array<{x: number, top: number, bottom: number, passed: boolean}> = [];

  constructor(
    canvas: HTMLCanvasElement, 
    onScoreChange: (score: number) => void,
    onGameOver: (score: number) => void,
    config: TazaConfig = DEFAULT_TAZA
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onScoreChange = onScoreChange;
    this.onGameOver = onGameOver;
    this.config = config;
    
    // Resize
    this.canvas.width = 400; // fixed logic width
    this.canvas.height = 500; // fixed logic height
  }

  public setConfig(config: TazaConfig) {
    this.config = config;
  }

  public start() {
    this.reset();
    this.isPlaying = true;
    this.loop();
  }

  public stop() {
    this.isPlaying = false;
    cancelAnimationFrame(this.animationId);
  }
  
  public togglePause() {
     if (this.isPlaying && !this.isGameOver) {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
           this.loop();
        }
     }
     return this.isPaused;
  }

  public jump() {
    if (!this.isPlaying || this.isGameOver) return;
    this.taza.velocity = this.jumpStrength;
    audio.playJump();
  }

  public fastFall() {
    if (!this.isPlaying || this.isGameOver) return;
    this.taza.velocity = Math.max(this.taza.velocity, 8); 
  }

  private reset() {
    this.isGameOver = false;
    this.score = 0;
    this.frames = 0;
    this.speed = this.baseSpeed;
    this.bgOffset = 0;
    this.pipes = [];
    this.taza = {
      x: 50,
      y: 250,
      width: 34 * this.config.sizeMod,
      height: 34 * this.config.sizeMod,
      velocity: 0,
      rotation: 0
    };
    this.onScoreChange(0);
  }

  private addPipe() {
    const minHeight = 50;
    const maxHeight = this.canvas.height - this.pipeGap - minHeight - 50; // 50 for ground
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    
    this.pipes.push({
      x: this.canvas.width,
      top: height,
      bottom: this.canvas.height - 50 - height - this.pipeGap,
      passed: false
    });
  }

  private update() {
    if (!this.isPlaying || this.isGameOver) return;

    this.frames++;
    
    // Progressive difficulty
    this.speed = this.baseSpeed + Math.floor(this.score / 5) * 0.4;

    // Parallax background
    this.bgOffset -= (this.speed * 0.3);
    if (this.bgOffset <= -this.canvas.width) {
      this.bgOffset += this.canvas.width;
    }
    
    // Taza Physics
    this.taza.velocity += (this.gravity * this.config.gravityMod);
    this.taza.y += this.taza.velocity;

    // Rotation
    if (this.taza.velocity < 0) {
      this.taza.rotation = -0.4;
    } else {
      this.taza.rotation = Math.min(Math.PI / 4, this.taza.rotation + 0.05);
    }

    // Floor / Ceiling Collision
    if (this.taza.y + this.taza.height >= this.canvas.height - 50 || this.taza.y <= 0) {
      this.triggerGameOver();
    }

    // Pipes
    if (this.frames % 100 === 0) { // every 100 frames spawn a pipe
      this.addPipe();
    }

    // Hitbox logic: 15% smaller than the visual size for forgiveness
    const hw = this.taza.width * 0.85;
    const hh = this.taza.height * 0.85;
    const hx = this.taza.x + (this.taza.width - hw) / 2;
    const hy = this.taza.y + (this.taza.height - hh) / 2;

    for (let i = 0; i < this.pipes.length; i++) {
      const p = this.pipes[i];
      p.x -= this.speed;

      // Collision detection with forgiving hitbox
      
      // Top pipe
      if (
        hx + hw > p.x &&
        hx < p.x + this.pipeWidth &&
        hy < p.top
      ) {
        this.triggerGameOver();
      }

      // Bottom pipe
      if (
        hx + hw > p.x &&
        hx < p.x + this.pipeWidth &&
        hy + hh > this.canvas.height - 50 - p.bottom
      ) {
        this.triggerGameOver();
      }

      // Score update
      if (p.x + this.pipeWidth < this.taza.x && !p.passed) {
        this.score += 1 * this.config.multiplier;
        p.passed = true;
        this.onScoreChange(this.score);
        audio.playCoin();
      }
    }

    // Clean up pipes
    if (this.pipes.length > 0 && this.pipes[0].x < -this.pipeWidth) {
      this.pipes.shift();
    }
  }

  private draw() {
    // Clear
    this.ctx.fillStyle = '#87CEEB'; // Sky blue
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw parallax clouds
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const drawClouds = (offset: number) => {
      // Cloud 1
      this.ctx.beginPath();
      this.ctx.arc(offset + 80, 120, 30, 0, Math.PI * 2);
      this.ctx.arc(offset + 120, 110, 40, 0, Math.PI * 2);
      this.ctx.arc(offset + 160, 120, 30, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Cloud 2
      this.ctx.beginPath();
      this.ctx.arc(offset + 280, 200, 25, 0, Math.PI * 2);
      this.ctx.arc(offset + 320, 190, 35, 0, Math.PI * 2);
      this.ctx.arc(offset + 360, 200, 25, 0, Math.PI * 2);
      this.ctx.fill();
    };
    drawClouds(this.bgOffset);
    drawClouds(this.bgOffset + this.canvas.width);

    // Draw Pipes (Molinillos)
    this.ctx.fillStyle = '#78350f'; // amber-900
    for (let i = 0; i < this.pipes.length; i++) {
      const p = this.pipes[i];
      
      // Top pipe
      this.ctx.fillRect(p.x, 0, this.pipeWidth, p.top);
      // Top pipe cap
      this.ctx.fillRect(p.x - 4, p.top - 20, this.pipeWidth + 8, 20);

      // Bottom pipe
      this.ctx.fillRect(p.x, this.canvas.height - 50 - p.bottom, this.pipeWidth, p.bottom);
      // Bottom pipe cap
      this.ctx.fillRect(p.x - 4, this.canvas.height - 50 - p.bottom, this.pipeWidth + 8, 20);
    }

    // Draw Floor
    this.ctx.fillStyle = '#d6d3d1'; // stone-300
    this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
    
    // Draw Taza
    this.ctx.save();
    this.ctx.translate(this.taza.x + this.taza.width/2, this.taza.y + this.taza.height/2);
    this.ctx.rotate(this.taza.rotation);
    
    // Base cup
    this.ctx.fillStyle = this.config.baseColor;
    this.ctx.beginPath();
    this.ctx.roundRect(-this.taza.width/2, -this.taza.height/2, this.taza.width, this.taza.height, 8 * this.config.sizeMod);
    this.ctx.fill();
    
    // Coffee inside
    this.ctx.fillStyle = this.config.accentColor;
    this.ctx.beginPath();
    this.ctx.ellipse(0, -this.taza.height/2 + (6 * this.config.sizeMod), this.taza.width/2 - (4 * this.config.sizeMod), 4 * this.config.sizeMod, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Handle
    this.ctx.strokeStyle = this.config.baseColor;
    this.ctx.lineWidth = 4 * this.config.sizeMod;
    this.ctx.beginPath();
    this.ctx.arc(this.taza.width/2, 0, 8 * this.config.sizeMod, -Math.PI/2, Math.PI/2);
    this.ctx.stroke();

    this.ctx.restore();
  }

  private loop = () => {
    if (!this.isPlaying || this.isPaused) return;

    this.update();
    this.draw();
    if (!this.isGameOver) {
      this.animationId = requestAnimationFrame(this.loop);
    }
  }

  private triggerGameOver() {
    if (this.isGameOver) return; // Prevent double trigger
    this.isGameOver = true;
    this.isPlaying = false;
    audio.playHurt();
    this.onGameOver(this.score);
  }
}
