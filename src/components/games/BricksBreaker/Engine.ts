import { audio } from '../../../utils/audioEngine';

export interface Powerup {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'expand' | 'multiball' | 'shield' | 'slow';
  active: boolean;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  status: number; // 0 = broken, 1+ = hits left
  type: 'normal' | 'hard' | 'unbreakable';
  color: string;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  active: boolean;
}

export class BricksEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number = 0;
  
  public isPlaying: boolean = false;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public hasWon: boolean = false;
  public score: number = 0;
  public lives: number = 3;
  public level: number = 1;
  
  private onScoreChange: (score: number) => void;
  private onGameOver: (score: number, win: boolean) => void;
  private onLivesChange: (lives: number) => void;
  private onLevelChange: (level: number) => void;
  
  // Game Entities
  private paddle = { x: 0, y: 0, width: 100, height: 15, defaultWidth: 100 };
  private balls: Ball[] = [];
  private bricks: Brick[] = [];
  private powerups: Powerup[] = [];
  private particles: {x: number, y: number, dx: number, dy: number, life: number, color: string}[] = [];
  
  // Settings
  private canvasW = 800;
  private canvasH = 600;
  private paddleSpeed = 8;
  private rightPressed = false;
  private leftPressed = false;
  
  // Shield
  private shieldActive = false;
  private shieldTime = 0;

  constructor(
      canvas: HTMLCanvasElement, 
      onScoreChange: (score: number) => void, 
      onGameOver: (score: number, win: boolean) => void, 
      onLivesChange: (lives: number) => void,
      onLevelChange: (level: number) => void
   ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onScoreChange = onScoreChange;
    this.onGameOver = onGameOver;
    this.onLivesChange = onLivesChange;
    this.onLevelChange = onLevelChange;
    
    this.canvas.width = this.canvasW;
    this.canvas.height = this.canvasH;
    
    this.initLevel();
  }
  
  private initLevel() {
     this.paddle.width = this.paddle.defaultWidth;
     this.paddle.x = (this.canvasW - this.paddle.width) / 2;
     this.paddle.y = this.canvasH - 30;
     
     this.balls = [{
        x: this.canvasW / 2,
        y: this.canvasH - 45,
        radius: 8,
        dx: 4 + (this.level * 0.5),
        dy: -4 - (this.level * 0.5),
        active: true
     }];
     
     this.powerups = [];
     this.shieldActive = false;
     
     this.buildBricks();
  }
  
  private buildBricks() {
     this.bricks = [];
     const rowCount = 3 + this.level;
     const colCount = 8;
     const padding = 10;
     const offsetTop = 60;
     const offsetLeft = 40;
     const width = 80;
     const height = 25;
     
     const colors = ['#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24'];
     
     for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
           let type: 'normal' | 'hard' | 'unbreakable' = 'normal';
           let status = 1;
           if (this.level > 2 && Math.random() > 0.8) {
              type = 'hard';
              status = 2;
           }
           
           this.bricks.push({
              x: (c * (width + padding)) + offsetLeft,
              y: (r * (height + padding)) + offsetTop,
              width, height, status, type,
              color: colors[r % colors.length]
           });
        }
     }
  }

  public start() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.onScoreChange(this.score);
    this.onLivesChange(this.lives);
    this.onLevelChange(this.level);
    this.isGameOver = false;
    this.hasWon = false;
    this.isPlaying = true;
    this.isPaused = false;
    
    this.initLevel();
    this.loop();
  }
  
  public togglePause() {
     if (this.isPlaying && !this.isGameOver && !this.hasWon) {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) this.loop();
     }
     return this.isPaused;
  }
  
  public stop() {
     this.isPlaying = false;
     cancelAnimationFrame(this.animationId);
  }
  
  public handleKeyDown(e: KeyboardEvent) {
     if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
       e.preventDefault();
     }
     if (e.code === 'ArrowRight') this.rightPressed = true;
     else if (e.code === 'ArrowLeft') this.leftPressed = true;
  }
  
  public handleKeyUp(e: KeyboardEvent) {
     if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
       e.preventDefault();
     }
     if (e.code === 'ArrowRight') this.rightPressed = false;
     else if (e.code === 'ArrowLeft') this.leftPressed = false;
  }
  
  public handlePointerMove(x: number) {
      if (this.isPaused || !this.isPlaying) return;
      // Convert screen x to canvas x
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const canvasX = (x - rect.left) * scaleX;
      
      this.paddle.x = canvasX - this.paddle.width / 2;
      if (this.paddle.x < 0) this.paddle.x = 0;
      if (this.paddle.x + this.paddle.width > this.canvasW) this.paddle.x = this.canvasW - this.paddle.width;
  }

  private update() {
     // Move paddle
     if (this.rightPressed && this.paddle.x < this.canvasW - this.paddle.width) {
        this.paddle.x += this.paddleSpeed;
     } else if (this.leftPressed && this.paddle.x > 0) {
        this.paddle.x -= this.paddleSpeed;
     }
     
     // Shield timer
     if (this.shieldActive) {
        this.shieldTime--;
        if (this.shieldTime <= 0) this.shieldActive = false;
     }
     
     // Move balls
     let activeBalls = 0;
     for (let ball of this.balls) {
        if (!ball.active) continue;
        activeBalls++;
        
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Wall collision
        if (ball.x + ball.radius > this.canvasW || ball.x - ball.radius < 0) {
           ball.dx = -ball.dx;
           audio.playJump();
        }
        if (ball.y - ball.radius < 0) {
           ball.dy = -ball.dy;
           audio.playJump();
        } else if (ball.y + ball.radius > this.canvasH) {
           if (this.shieldActive) {
              ball.dy = -ball.dy;
              ball.y = this.canvasH - ball.radius;
              this.shieldActive = false; // consume shield
              audio.playPowerUp();
           } else {
              ball.active = false;
           }
        }
        
        // Paddle collision
        if (ball.y + ball.radius > this.paddle.y && ball.y - ball.radius < this.paddle.y + this.paddle.height &&
            ball.x > this.paddle.x && ball.x < this.paddle.x + this.paddle.width) {
           
           // Determine angle based on hit position
           let hitPoint = ball.x - (this.paddle.x + this.paddle.width/2);
           hitPoint = hitPoint / (this.paddle.width/2); // -1 to 1
           
           const speed = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
           const angle = hitPoint * (Math.PI / 3); // max 60 degrees
           
           ball.dx = speed * Math.sin(angle);
           ball.dy = -speed * Math.cos(angle);
           audio.playJump();
        }
        
        // Brick collision
        for (let r = 0; r < this.bricks.length; r++) {
           let b = this.bricks[r];
           if (b.status > 0) {
              if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + b.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + b.height) {
                 ball.dy = -ball.dy;
                 b.status--;
                 
                 if (b.status === 0) {
                    this.score += (b.type === 'hard' ? 20 : 10);
                    this.onScoreChange(this.score);
                    audio.playCoin();
                    
                    // Create particles
                    for(let i=0; i<5; i++) {
                       this.particles.push({
                          x: ball.x, y: ball.y,
                          dx: (Math.random()-0.5)*5, dy: (Math.random()-0.5)*5,
                          life: 20 + Math.random()*10,
                          color: b.color
                       });
                    }
                    
                    // Spawn powerup?
                    if (Math.random() < 0.15) {
                       const types: Powerup['type'][] = ['expand', 'multiball', 'shield', 'slow'];
                       this.powerups.push({
                          x: b.x + b.width/2 - 10,
                          y: b.y + b.height/2,
                          width: 20, height: 20,
                          type: types[Math.floor(Math.random()*types.length)],
                          active: true
                       });
                    }
                 } else {
                    audio.playHurt();
                 }
              }
           }
        }
     }
     
     if (activeBalls === 0) {
        this.lives--;
        this.onLivesChange(this.lives);
        if (this.lives <= 0) {
           this.isGameOver = true;
           this.onGameOver(this.score, false);
           return;
        } else {
           // Reset ball and paddle
           this.paddle.x = (this.canvasW - this.paddle.width) / 2;
           this.balls = [{
              x: this.canvasW / 2,
              y: this.canvasH - 45,
              radius: 8,
              dx: 4 + (this.level * 0.5),
              dy: -4 - (this.level * 0.5),
              active: true
           }];
        }
     }
     
     // Update powerups
     for (let p of this.powerups) {
        if (!p.active) continue;
        p.y += 3;
        
        // Paddle collision
        if (p.y + p.height > this.paddle.y && p.y < this.paddle.y + this.paddle.height &&
            p.x + p.width > this.paddle.x && p.x < this.paddle.x + this.paddle.width) {
           p.active = false;
           this.activatePowerup(p.type);
           audio.playPowerUp();
        } else if (p.y > this.canvasH) {
           p.active = false;
        }
     }
     
     // Update particles
     for (let i = this.particles.length - 1; i >= 0; i--) {
        let pt = this.particles[i];
        pt.x += pt.dx;
        pt.y += pt.dy;
        pt.life--;
        if (pt.life <= 0) this.particles.splice(i, 1);
     }
     
     // Check win
     let bricksLeft = this.bricks.filter(b => b.status > 0 && b.type !== 'unbreakable').length;
     if (bricksLeft === 0) {
        if (this.level >= 5) {
           this.hasWon = true;
           this.isPlaying = false;
           this.onGameOver(this.score, true);
        } else {
           this.level++;
           this.onLevelChange(this.level);
           this.score += 500;
           this.onScoreChange(this.score);
           this.initLevel();
           audio.playPowerUp();
        }
     }
  }
  
  private activatePowerup(type: Powerup['type']) {
     switch(type) {
        case 'expand':
           this.paddle.width = Math.min(this.paddle.width + 40, 200);
           setTimeout(() => { this.paddle.width = this.paddle.defaultWidth; }, 10000);
           break;
        case 'multiball':
           let currentActive = this.balls.find(b => b.active);
           if (currentActive) {
              this.balls.push({
                 x: currentActive.x, y: currentActive.y,
                 radius: currentActive.radius,
                 dx: -currentActive.dx, dy: currentActive.dy, active: true
              });
              this.balls.push({
                 x: currentActive.x, y: currentActive.y,
                 radius: currentActive.radius,
                 dx: currentActive.dx, dy: -currentActive.dy, active: true
              });
           }
           break;
        case 'shield':
           this.shieldActive = true;
           this.shieldTime = 600; // ~10 seconds at 60fps
           break;
        case 'slow':
           for(let b of this.balls) {
              b.dx *= 0.7;
              b.dy *= 0.7;
           }
           setTimeout(() => {
              for(let b of this.balls) {
                 b.dx /= 0.7;
                 b.dy /= 0.7;
              }
           }, 8000);
           break;
     }
  }
  
  private draw() {
     // Background
     this.ctx.fillStyle = '#1c1917'; // dark stone
     this.ctx.fillRect(0, 0, this.canvasW, this.canvasH);
     
     // Draw Shield
     if (this.shieldActive) {
        this.ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        this.ctx.fillRect(0, this.canvasH - 10, this.canvasW, 10);
     }
     
     // Draw Paddle (Portafilter)
     this.ctx.fillStyle = '#451a03'; // dark brown handle
     this.ctx.beginPath();
     this.ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, 8);
     this.ctx.fill();
     // Metal part
     this.ctx.fillStyle = '#d1d5db';
     this.ctx.beginPath();
     this.ctx.roundRect(this.paddle.x + this.paddle.width/2 - 20, this.paddle.y - 5, 40, 10, 4);
     this.ctx.fill();
     
     // Draw Bricks
     for (let b of this.bricks) {
        if (b.status > 0) {
           this.ctx.fillStyle = b.type === 'hard' ? '#451a03' : b.color;
           this.ctx.beginPath();
           this.ctx.roundRect(b.x, b.y, b.width, b.height, 4);
           this.ctx.fill();
           
           // Highlight
           this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
           this.ctx.fillRect(b.x, b.y, b.width, b.height / 3);
           
           // Cracks if damaged
           if (b.type === 'hard' && b.status === 1) {
              this.ctx.strokeStyle = '#000';
              this.ctx.beginPath();
              this.ctx.moveTo(b.x + 10, b.y);
              this.ctx.lineTo(b.x + 20, b.y + b.height);
              this.ctx.stroke();
           }
        }
     }
     
     // Draw Powerups
     for (let p of this.powerups) {
        if (!p.active) continue;
        this.ctx.save();
        this.ctx.translate(p.x + p.width/2, p.y + p.height/2);
        
        switch (p.type) {
           case 'expand': this.ctx.fillStyle = '#34d399'; break; // green
           case 'multiball': this.ctx.fillStyle = '#facc15'; break; // yellow
           case 'shield': this.ctx.fillStyle = '#38bdf8'; break; // blue
           case 'slow': this.ctx.fillStyle = '#a78bfa'; break; // purple
        }
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.width/2, 0, Math.PI*2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        let icon = p.type === 'expand' ? '↔' : p.type === 'multiball' ? '●●' : p.type === 'shield' ? '🛡' : '⧖';
        this.ctx.fillText(icon, 0, 0);
        
        this.ctx.restore();
     }
     
     // Draw Balls (Coffee beans)
     for (let ball of this.balls) {
        if (!ball.active) continue;
        this.ctx.fillStyle = '#78350f'; // Bean color
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        // Bean line
        this.ctx.strokeStyle = '#451a03';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(ball.x - ball.radius*0.6, ball.y - ball.radius*0.6);
        this.ctx.quadraticCurveTo(ball.x, ball.y, ball.x + ball.radius*0.6, ball.y + ball.radius*0.6);
        this.ctx.stroke();
     }
     
     // Draw Particles
     for (let pt of this.particles) {
        this.ctx.fillStyle = pt.color;
        this.ctx.globalAlpha = pt.life / 30;
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
     }
  }

  private loop = () => {
    if (!this.isPlaying || this.isPaused) return;

    this.update();
    this.draw();

    if (!this.isGameOver && !this.hasWon) {
      this.animationId = requestAnimationFrame(this.loop);
    }
  }
}
