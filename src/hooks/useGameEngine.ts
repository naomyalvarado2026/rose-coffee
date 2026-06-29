import { useRef, useEffect, useState, useCallback } from 'react';
import { kittenFrames, breadObstacle, coffeeObstacle, createSVGImage } from '../components/game/sprites';

export type GameState = 'START' | 'PLAYING' | 'GAME_OVER';

export interface GameEngineOptions {
  onScoreUpdate?: (score: number) => void;
  onLivesUpdate?: (lives: number) => void;
  onStateChange?: (state: GameState) => void;
}

const kittenImg1 = createSVGImage(kittenFrames[0]);
const kittenImg2 = createSVGImage(kittenFrames[1]);
const breadImg = createSVGImage(breadObstacle);
const coffeeImg = createSVGImage(coffeeObstacle);

export const useGameEngine = (options: GameEngineOptions) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  // Engine state variables (using refs to avoid re-renders during loop)
  const engineRef = useRef({
    score: 0,
    lives: 3,
    speed: 5,
    frameCount: 0,
    isJumping: false,
    jumpVelocity: 0,
    gravity: 0.6,
    kittenY: 0,
    kittenX: 50,
    groundY: 0, // Calculated based on canvas height
    obstacles: [] as { x: number, y: number, width: number, height: number, type: 'bread' | 'coffee' }[],
    particles: [] as { x: number, y: number, vx: number, vy: number, life: number, color: string }[],
    lastTime: 0,
    reqId: 0,
  });

  const jump = useCallback(() => {
    const engine = engineRef.current;
    if (gameState === 'PLAYING' && !engine.isJumping) {
      engine.isJumping = true;
      engine.jumpVelocity = -12; // Initial jump force
    }
  }, [gameState]);

  const startGame = useCallback(() => {
    const engine = engineRef.current;
    engine.score = 0;
    engine.lives = 3;
    engine.speed = 5;
    engine.obstacles = [];
    engine.particles = [];
    setScore(0);
    setLives(3);
    setGameState('PLAYING');
    options.onStateChange?.('PLAYING');
  }, [options]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        engineRef.current.groundY = canvas.height - 50; // 50px above bottom
        if (gameState === 'START') {
          engineRef.current.kittenY = engineRef.current.groundY - 40; // Kitten height is ~40
          drawStartScreen(ctx, canvas);
        }
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Input handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'START' || gameState === 'GAME_OVER') {
          startGame();
        } else {
          jump();
        }
      }
    };
    
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (gameState === 'START' || gameState === 'GAME_OVER') {
        startGame();
      } else {
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    
    // Draw functions

    const drawStartScreen = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#faf2e7'; // bg-brand-base
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw floor
      ctx.fillStyle = '#e9ebef'; // --color-gray-155
      ctx.fillRect(0, engineRef.current.groundY, canvas.width, canvas.height - engineRef.current.groundY);
    };

    const spawnObstacle = () => {
      const engine = engineRef.current;
      // Spawn random obstacle
      if (Math.random() < 0.02) {
        // Only spawn if last obstacle is far enough
        const lastObstacle = engine.obstacles[engine.obstacles.length - 1];
        if (!lastObstacle || canvas.width - lastObstacle.x > 300) {
          engine.obstacles.push({
            x: canvas.width,
            y: engine.groundY - 30, // Bread height
            width: 40,
            height: 30,
            type: Math.random() > 0.8 ? 'coffee' : 'bread'
          });
        }
      }
    };

    // The Game Loop
    const gameLoop = (time: number) => {
      const engine = engineRef.current;
      if (gameState !== 'PLAYING') return;

      // Calculate delta
      // const deltaTime = time - engine.lastTime;
      engine.lastTime = time;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Background
      ctx.fillStyle = '#faf2e7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#e9ebef';
      ctx.fillRect(0, engine.groundY, canvas.width, canvas.height - engine.groundY);

      // Physics (Kitten Y)
      if (engine.isJumping) {
        engine.kittenY += engine.jumpVelocity;
        engine.jumpVelocity += engine.gravity;

        if (engine.kittenY >= engine.groundY - 40) { // Kitten height
          engine.kittenY = engine.groundY - 40;
          engine.isJumping = false;
          engine.jumpVelocity = 0;
        }
      } else {
        engine.kittenY = engine.groundY - 40;
      }

      // Draw Kitten Placeholder (TODO: use SVG sprite)
      const currentKittenImg = (Math.floor(engine.frameCount / 5) % 2 === 0) ? kittenImg1 : kittenImg2;
      const finalKittenImg = engine.isJumping ? kittenImg1 : currentKittenImg;
      ctx.drawImage(finalKittenImg, engine.kittenX, engine.kittenY, 50, 50);

      // Update and draw obstacles
      for (let i = engine.obstacles.length - 1; i >= 0; i--) {
        const obs = engine.obstacles[i];
        obs.x -= engine.speed;

        // Draw obstacle
        const obsImg = obs.type === 'bread' ? breadImg : coffeeImg;
        ctx.drawImage(obsImg, obs.x, obs.y - 10, obs.width + 10, obs.height + 10);

        // Collision detection (AABB)
        if (
          engine.kittenX < obs.x + obs.width &&
          engine.kittenX + 40 > obs.x &&
          engine.kittenY < obs.y + obs.height &&
          engine.kittenY + 40 > obs.y
        ) {
          // Hit!
          engine.obstacles.splice(i, 1);
          engine.lives -= 1;
          setLives(engine.lives);
          options.onLivesUpdate?.(engine.lives);
          
          // Generate Hit Particles
          for (let p = 0; p < 10; p++) {
             engine.particles.push({
               x: engine.kittenX + 20,
               y: engine.kittenY + 20,
               vx: (Math.random() - 0.5) * 10,
               vy: (Math.random() - 0.5) * 10,
               life: 1,
               color: '#DC2626'
             });
          }

          if (engine.lives <= 0) {
            setGameState('GAME_OVER');
            options.onStateChange?.('GAME_OVER');
            break;
          }
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
          engine.obstacles.splice(i, 1);
        }
      }
      
      // Update and draw particles
      for (let i = engine.particles.length - 1; i >= 0; i--) {
         const p = engine.particles[i];
         p.x += p.vx;
         p.y += p.vy;
         p.life -= 0.05;
         if (p.life <= 0) {
            engine.particles.splice(i, 1);
         } else {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
         }
      }

      spawnObstacle();

      // Score
      engine.frameCount++;
      if (engine.frameCount % 10 === 0) {
        engine.score += 1;
        if (engine.score % 100 === 0) {
          engine.speed += 0.5; // Increase difficulty
        }
        setScore(engine.score);
        options.onScoreUpdate?.(engine.score);
      }

      engine.reqId = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'PLAYING') {
      engineRef.current.lastTime = performance.now();
      engineRef.current.reqId = requestAnimationFrame(gameLoop);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouch);
      cancelAnimationFrame(engineRef.current.reqId);
    };
  }, [gameState, jump, options, startGame]);

  return {
    canvasRef,
    gameState,
    score,
    lives,
    startGame,
    jump
  };
};
