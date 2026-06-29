export interface GameState {
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPlaying: boolean;
  isPaused: boolean;
}

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

const SHAPES: Record<TetrominoType, { shape: number[][]; color: string }> = {
  'I': { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#fbbf24' }, // Amber (Latte Art)
  'J': { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#38bdf8' }, // Blue (Cup)
  'L': { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#f472b6' }, // Pink (Donut)
  'O': { shape: [[1, 1], [1, 1]], color: '#a8a29e' }, // Stone (Sugar Cube)
  'S': { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#4ade80' }, // Green (Matcha)
  'T': { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#c084fc' }, // Purple (Syrup)
  'Z': { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#ef4444' }  // Red (Strawberry)
};

export class LatteArtEngine {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private cols: number = 10;
  private rows: number = 20;
  private blockSize: number;
  
  private grid: string[][];
  private currentPiece: Tetromino | null = null;
  private dropCounter: number = 0;
  private dropInterval: number = 1000;
  private lastTime: number = 0;
  
  private animationId: number = 0;
  
  public state: GameState = {
    score: 0,
    level: 1,
    lines: 0,
    isGameOver: false,
    isPlaying: false,
    isPaused: false
  };

  private onStateChange: (state: GameState) => void;
  private onLinesCleared: (lines: number, comboScore: number) => void;

  constructor(
    canvas: HTMLCanvasElement, 
    onStateChange: (state: GameState) => void,
    onLinesCleared: (lines: number, comboScore: number) => void
  ) {
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.blockSize = this.width / this.cols; // Should be same as height / rows if ratio is 1:2
    this.onStateChange = onStateChange;
    this.onLinesCleared = onLinesCleared;
    
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(''));
    this.initInputs();
  }

  private initInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  public cleanup() {
    window.removeEventListener('keydown', this.handleKeyDown);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
      e.preventDefault();
    }

    if (!this.state.isPlaying || this.state.isGameOver) return;

    if (e.code === 'KeyP' || e.code === 'Escape') {
      this.togglePause();
      return;
    }

    if (this.state.isPaused) return;

    if (e.code === 'ArrowLeft') {
      this.movePiece(-1);
    } else if (e.code === 'ArrowRight') {
      this.movePiece(1);
    } else if (e.code === 'ArrowDown') {
      this.dropPiece();
    } else if (e.code === 'ArrowUp') {
      this.rotatePiece();
    } else if (e.code === 'Space') {
      this.hardDrop();
    }
  };

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
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(''));
    this.state = {
      score: 0,
      level: 1,
      lines: 0,
      isGameOver: false,
      isPlaying: true,
      isPaused: false
    };
    this.dropInterval = 1000;
    this.spawnPiece();
    this.onStateChange({ ...this.state });
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  private spawnPiece() {
    const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const type = types[Math.floor(Math.random() * types.length)];
    const data = SHAPES[type];
    
    this.currentPiece = {
      type,
      shape: data.shape,
      color: data.color,
      x: Math.floor(this.cols / 2) - Math.floor(data.shape[0].length / 2),
      y: 0
    };

    if (this.collides(this.currentPiece)) {
      this.state.isGameOver = true;
      this.state.isPlaying = false;
      this.onStateChange({ ...this.state });
    }
  }

  private collides(piece: Tetromino, offsetX = 0, offsetY = 0): boolean {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const newX = piece.x + x + offsetX;
          const newY = piece.y + y + offsetY;
          
          if (newX < 0 || newX >= this.cols || newY >= this.rows) {
            return true;
          }
          if (newY >= 0 && this.grid[newY][newX] !== '') {
            return true;
          }
        }
      }
    }
    return false;
  }

  private rotatePiece() {
    if (!this.currentPiece) return;
    
    const shape = this.currentPiece.shape;
    const N = shape.length;
    const rotated = Array.from({ length: N }, () => Array(N).fill(0));
    
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        rotated[x][N - 1 - y] = shape[y][x];
      }
    }
    
    const originalShape = this.currentPiece.shape;
    this.currentPiece.shape = rotated;
    
    if (this.collides(this.currentPiece)) {
      this.currentPiece.shape = originalShape; // Revert
    }
  }

  private movePiece(dir: number) {
    if (!this.currentPiece) return;
    if (!this.collides(this.currentPiece, dir, 0)) {
      this.currentPiece.x += dir;
    }
  }

  private dropPiece() {
    if (!this.currentPiece) return;
    if (!this.collides(this.currentPiece, 0, 1)) {
      this.currentPiece.y += 1;
      this.dropCounter = 0;
    } else {
      this.lockPiece();
    }
  }
  
  private hardDrop() {
    if (!this.currentPiece) return;
    while (!this.collides(this.currentPiece, 0, 1)) {
      this.currentPiece.y += 1;
    }
    this.lockPiece();
  }

  private lockPiece() {
    if (!this.currentPiece) return;
    
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x] !== 0) {
          const gridY = this.currentPiece.y + y;
          const gridX = this.currentPiece.x + x;
          if (gridY >= 0) {
            this.grid[gridY][gridX] = this.currentPiece.color;
          }
        }
      }
    }
    
    this.clearLines();
    this.spawnPiece();
  }

  private clearLines() {
    let linesCleared = 0;
    
    for (let y = this.rows - 1; y >= 0; y--) {
      let isLineFull = true;
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] === '') {
          isLineFull = false;
          break;
        }
      }
      
      if (isLineFull) {
        this.grid.splice(y, 1);
        this.grid.unshift(Array(this.cols).fill(''));
        linesCleared++;
        y++; // Check the new line at this index
      }
    }
    
    if (linesCleared > 0) {
      this.state.lines += linesCleared;
      
      // Tetris scoring multiplier
      let baseScore = 0;
      if (linesCleared === 1) baseScore = 10;
      else if (linesCleared === 2) baseScore = 30;
      else if (linesCleared === 3) baseScore = 100;
      else if (linesCleared === 4) baseScore = 1000;
      
      const levelMultiplier = this.state.level;
      const totalGained = baseScore * levelMultiplier;
      
      this.state.score += totalGained;
      
      // Increase level every 10 lines
      const newLevel = Math.floor(this.state.lines / 10) + 1;
      if (newLevel > this.state.level) {
        this.state.level = newLevel;
        this.dropInterval = Math.max(100, 1000 - (this.state.level - 1) * 100);
      }
      
      this.onLinesCleared(linesCleared, totalGained);
      this.onStateChange({ ...this.state });
    }
  }

  private drawBlock(x: number, y: number, color: string) {
    const p = 1; // padding
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * this.blockSize + p, y * this.blockSize + p, this.blockSize - p * 2, this.blockSize - p * 2);
    
    // Add lighting effect
    this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
    this.ctx.fillRect(x * this.blockSize + p, y * this.blockSize + p, this.blockSize - p * 2, (this.blockSize - p * 2) / 2);
    
    this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
    this.ctx.fillRect(x * this.blockSize + p, y * this.blockSize + p + (this.blockSize - p * 2) / 2, this.blockSize - p * 2, (this.blockSize - p * 2) / 2);
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x <= this.cols; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.blockSize, 0);
      this.ctx.lineTo(x * this.blockSize, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.rows; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.blockSize);
      this.ctx.lineTo(this.width, y * this.blockSize);
      this.ctx.stroke();
    }

    // Draw settled blocks
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] !== '') {
          this.drawBlock(x, y, this.grid[y][x]);
        }
      }
    }

    // Draw current piece
    if (this.currentPiece) {
      for (let y = 0; y < this.currentPiece.shape.length; y++) {
        for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
          if (this.currentPiece.shape[y][x] !== 0) {
            this.drawBlock(this.currentPiece.x + x, this.currentPiece.y + y, this.currentPiece.color);
          }
        }
      }
    }
  }

  private gameLoop = (timestamp: number) => {
    if (!this.state.isPlaying || this.state.isPaused || this.state.isGameOver) {
      this.draw(); // Draw last frame
      return;
    }

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.dropPiece();
    }

    this.draw();
    this.animationId = requestAnimationFrame(this.gameLoop);
  };
}
