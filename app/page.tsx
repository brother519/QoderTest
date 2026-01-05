'use client';

import React, { useState, useEffect, useRef } from 'react';

const TANK_SIZE = 40;
const BULLET_SIZE = 6;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const CELL_SIZE = 40;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

interface Tank {
  id: string;
  position: Position;
  direction: Direction;
  color: string;
  health: number;
}

interface Bullet {
  id: string;
  position: Position;
  direction: Direction;
  speed: number;
}

interface Obstacle {
  position: Position;
  width: number;
  height: number;
  destructible: boolean;
}

const TankGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerTank, setPlayerTank] = useState<Tank>({
    id: 'player',
    position: { x: 50, y: 50 },
    direction: 'RIGHT',
    color: '#3B82F6', // blue-500
    health: 100
  });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemyTanks, setEnemyTanks] = useState<Tank[]>([
    {
      id: 'enemy1',
      position: { x: 300, y: 200 },
      direction: 'LEFT',
      color: '#EF4444', // red-500
      health: 100
    },
    {
      id: 'enemy2',
      position: { x: 500, y: 400 },
      direction: 'UP',
      color: '#EF4444', // red-500
      health: 100
    }
  ]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([
    { position: { x: 200, y: 100 }, width: CELL_SIZE, height: CELL_SIZE * 3, destructible: true },
    { position: { x: 400, y: 200 }, width: CELL_SIZE * 3, height: CELL_SIZE, destructible: true },
    { position: { x: 100, y: 400 }, width: CELL_SIZE * 2, height: CELL_SIZE, destructible: false },
    { position: { x: 600, y: 100 }, width: CELL_SIZE, height: CELL_SIZE * 4, destructible: false }
  ]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastFired = useRef<number>(0); // 记录上次发射时间，控制发射频率

  // 处理键盘输入
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 游戏主循环
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // 更新玩家坦克位置
      setPlayerTank(prev => {
        let newPosition = { ...prev.position };
        let newDirection = prev.direction;

        if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
          newDirection = 'UP';
          newPosition.y = Math.max(0, newPosition.y - 5);
        }
        if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
          newDirection = 'DOWN';
          newPosition.y = Math.min(GAME_HEIGHT - TANK_SIZE, newPosition.y + 5);
        }
        if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
          newDirection = 'LEFT';
          newPosition.x = Math.max(0, newPosition.x - 5);
        }
        if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
          newDirection = 'RIGHT';
          newPosition.x = Math.min(GAME_WIDTH - TANK_SIZE, newPosition.x + 5);
        }

        // 检查与障碍物的碰撞
        for (const obstacle of obstacles) {
          if (
            newPosition.x < obstacle.position.x + obstacle.width &&
            newPosition.x + TANK_SIZE > obstacle.position.x &&
            newPosition.y < obstacle.position.y + obstacle.height &&
            newPosition.y + TANK_SIZE > obstacle.position.y
          ) {
            // 如果碰撞，则恢复到之前的位置
            return { ...prev, direction: newDirection };
          }
        }

        return { ...prev, position: newPosition, direction: newDirection };
      });

      // 更新子弹位置
      setBullets(prev => {
        return prev
          .map(bullet => {
            let newX = bullet.position.x;
            let newY = bullet.position.y;

            switch (bullet.direction) {
              case 'UP':
                newY -= bullet.speed;
                break;
              case 'DOWN':
                newY += bullet.speed;
                break;
              case 'LEFT':
                newX -= bullet.speed;
                break;
              case 'RIGHT':
                newX += bullet.speed;
                break;
            }

            return { ...bullet, position: { x: newX, y: newY } };
          })
          .filter(bullet => 
            bullet.position.x >= -BULLET_SIZE &&
            bullet.position.x <= GAME_WIDTH + BULLET_SIZE &&
            bullet.position.y >= -BULLET_SIZE &&
            bullet.position.y <= GAME_HEIGHT + BULLET_SIZE
          );
      });

      // 发射子弹 (空格键) - 控制发射频率
      if (keysPressed.current.has(' ') && Date.now() - lastFired.current > 300) {
        const newBullet: Bullet = {
          id: `bullet-${Date.now()}`,
          position: {
            x: playerTank.position.x + TANK_SIZE / 2 - BULLET_SIZE / 2,
            y: playerTank.position.y + TANK_SIZE / 2 - BULLET_SIZE / 2
          },
          direction: playerTank.direction,
          speed: 7
        };
        setBullets(prev => [...prev, newBullet]);
        lastFired.current = Date.now();
      }

      // 敌方坦克AI和行为
      setEnemyTanks(prev => {
        return prev.map(tank => {
          // 简单AI：随机移动和发射
          let newDirection = tank.direction;
          let newPosition = { ...tank.position };
          
          // 5%概率改变方向
          if (Math.random() < 0.05) {
            const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
            newDirection = directions[Math.floor(Math.random() * directions.length)];
          }

          // 根据方向移动
          switch (newDirection) {
            case 'UP':
              newPosition.y = Math.max(0, newPosition.y - 2);
              break;
            case 'DOWN':
              newPosition.y = Math.min(GAME_HEIGHT - TANK_SIZE, newPosition.y + 2);
              break;
            case 'LEFT':
              newPosition.x = Math.max(0, newPosition.x - 2);
              break;
            case 'RIGHT':
              newPosition.x = Math.min(GAME_WIDTH - TANK_SIZE, newPosition.x + 2);
              break;
          }

          // 3%概率发射子弹
          if (Math.random() < 0.03) {
            const enemyBullet: Bullet = {
              id: `enemy-bullet-${Date.now()}-${tank.id}`,
              position: {
                x: tank.position.x + TANK_SIZE / 2 - BULLET_SIZE / 2,
                y: tank.position.y + TANK_SIZE / 2 - BULLET_SIZE / 2
              },
              direction: newDirection,
              speed: 5
            };
            setBullets(prevBullets => [...prevBullets, enemyBullet]);
          }

          // 检查与障碍物的碰撞
          for (const obstacle of obstacles) {
            if (
              newPosition.x < obstacle.position.x + obstacle.width &&
              newPosition.x + TANK_SIZE > obstacle.position.x &&
              newPosition.y < obstacle.position.y + obstacle.height &&
              newPosition.y + TANK_SIZE > obstacle.position.y
            ) {
              // 如果碰撞，尝试其他方向
              return { ...tank, direction: newDirection };
            }
          }

          return { ...tank, position: newPosition, direction: newDirection };
        });
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, obstacles]);

  // 碰撞检测
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    // 检查子弹与坦克的碰撞
    setBullets(prevBullets => {
      const remainingBullets = [...prevBullets];
      const bulletsToRemove: string[] = [];
      let scoreIncrease = 0;
      let playerHit = false;

      for (let i = 0; i < remainingBullets.length; i++) {
        const bullet = remainingBullets[i];
        let bulletHit = false;

        // 检查玩家子弹是否击中敌方坦克
        setEnemyTanks(prev => {
          return prev.map(enemy => {
            if (
              !bulletHit &&
              bullet.id.includes('bullet-') && // 确保是玩家的子弹
              bullet.position.x < enemy.position.x + TANK_SIZE &&
              bullet.position.x + BULLET_SIZE > enemy.position.x &&
              bullet.position.y < enemy.position.y + TANK_SIZE &&
              bullet.position.y + BULLET_SIZE > enemy.position.y
            ) {
              // 击中敌方坦克
              bulletsToRemove.push(bullet.id);
              bulletHit = true;
              scoreIncrease += 100;
              return { ...enemy, health: enemy.health - 25 }; // 每次击中减少25生命值
            }
            return enemy;
          }).filter(enemy => enemy.health > 0); // 移除生命值为0的敌方坦克
        });

        // 检查敌方子弹是否击中玩家坦克
        if (
          !bulletHit &&
          !bullet.id.includes('bullet-') && // 确保是敌方的子弹
          bullet.position.x < playerTank.position.x + TANK_SIZE &&
          bullet.position.x + BULLET_SIZE > playerTank.position.x &&
          bullet.position.y < playerTank.position.y + TANK_SIZE &&
          bullet.position.y + BULLET_SIZE > playerTank.position.y
        ) {
          bulletsToRemove.push(bullet.id);
          bulletHit = true;
          playerHit = true;
        }
      }

      if (scoreIncrease > 0) {
        setScore(prev => prev + scoreIncrease);
      }

      if (playerHit) {
        setPlayerTank(prev => {
          const newHealth = prev.health - 25;
          if (newHealth <= 0) {
            setGameOver(true);
          }
          return { ...prev, health: newHealth };
        });
      }

      return remainingBullets.filter(bullet => !bulletsToRemove.includes(bullet.id));
    });

    // 检查敌方坦克是否全部被消灭
    if (enemyTanks.length === 0) {
      setGameWon(true);
      setGameOver(true);
    }
  }, [bullets, playerTank, enemyTanks, gameStarted, gameOver]);

  // 绘制游戏
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 绘制背景
    const backgroundGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    backgroundGradient.addColorStop(0, '#1F2937'); // gray-800
    backgroundGradient.addColorStop(1, '#111827'); // gray-900
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 绘制网格线（可选，增加游戏视觉效果）
    ctx.strokeStyle = 'rgba(55, 65, 81, 0.3)'; // gray-700 with opacity
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GAME_WIDTH; x += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= GAME_HEIGHT; y += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_WIDTH, y);
      ctx.stroke();
    }

    // 绘制障碍物
    obstacles.forEach(obstacle => {
      if (obstacle.destructible) {
        // 可摧毁障碍物 - 砖块效果
        ctx.fillStyle = '#6B7280'; // gray-500
        ctx.fillRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);
        
        // 添加砖块纹理效果
        ctx.strokeStyle = '#4B5563'; // gray-600
        ctx.lineWidth = 1;
        for (let x = obstacle.position.x; x < obstacle.position.x + obstacle.width; x += 8) {
          ctx.beginPath();
          ctx.moveTo(x, obstacle.position.y);
          ctx.lineTo(x, obstacle.position.y + obstacle.height);
          ctx.stroke();
        }
        for (let y = obstacle.position.y; y < obstacle.position.y + obstacle.height; y += 8) {
          ctx.beginPath();
          ctx.moveTo(obstacle.position.x, y);
          ctx.lineTo(obstacle.position.x + obstacle.width, y);
          ctx.stroke();
        }
      } else {
        // 不可摧毁障碍物 - 钢铁效果
        const gradient = ctx.createLinearGradient(
          obstacle.position.x, 
          obstacle.position.y, 
          obstacle.position.x, 
          obstacle.position.y + obstacle.height
        );
        gradient.addColorStop(0, '#9CA3AF'); // gray-400
        gradient.addColorStop(0.5, '#6B7280'); // gray-500
        gradient.addColorStop(1, '#4B5563'); // gray-600
        ctx.fillStyle = gradient;
        ctx.fillRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);
        
        // 添加钢铁纹理
        ctx.strokeStyle = '#374151'; // gray-700
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);
      }
    });

    // 绘制玩家坦克
    // 坦克主体
    ctx.fillStyle = playerTank.color;
    ctx.fillRect(playerTank.position.x, playerTank.position.y, TANK_SIZE, TANK_SIZE);

    // 坦克履带效果
    ctx.fillStyle = '#1E40AF'; // blue-800
    ctx.fillRect(playerTank.position.x - 2, playerTank.position.y, 2, TANK_SIZE);
    ctx.fillRect(playerTank.position.x + TANK_SIZE, playerTank.position.y, 2, TANK_SIZE);
    ctx.fillRect(playerTank.position.x, playerTank.position.y - 2, TANK_SIZE, 2);
    ctx.fillRect(playerTank.position.x, playerTank.position.y + TANK_SIZE, TANK_SIZE, 2);

    // 绘制坦克炮管方向
    ctx.strokeStyle = '#1E40AF'; // blue-800
    ctx.lineWidth = 6;
    ctx.beginPath();
    switch (playerTank.direction) {
      case 'UP':
        ctx.moveTo(playerTank.position.x + TANK_SIZE / 2, playerTank.position.y);
        ctx.lineTo(playerTank.position.x + TANK_SIZE / 2, playerTank.position.y - 12);
        break;
      case 'DOWN':
        ctx.moveTo(playerTank.position.x + TANK_SIZE / 2, playerTank.position.y + TANK_SIZE);
        ctx.lineTo(playerTank.position.x + TANK_SIZE / 2, playerTank.position.y + TANK_SIZE + 12);
        break;
      case 'LEFT':
        ctx.moveTo(playerTank.position.x, playerTank.position.y + TANK_SIZE / 2);
        ctx.lineTo(playerTank.position.x - 12, playerTank.position.y + TANK_SIZE / 2);
        break;
      case 'RIGHT':
        ctx.moveTo(playerTank.position.x + TANK_SIZE, playerTank.position.y + TANK_SIZE / 2);
        ctx.lineTo(playerTank.position.x + TANK_SIZE + 12, playerTank.position.y + TANK_SIZE / 2);
        break;
    }
    ctx.stroke();

    // 绘制玩家坦克生命值条
    ctx.fillStyle = '#EF4444'; // red-500
    ctx.fillRect(playerTank.position.x - 2, playerTank.position.y - 15, TANK_SIZE + 4, 8);
    ctx.fillStyle = '#10B981'; // green-500
    ctx.fillRect(playerTank.position.x - 2, playerTank.position.y - 15, ((TANK_SIZE + 4) * playerTank.health) / 100, 8);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(playerTank.position.x - 2, playerTank.position.y - 15, TANK_SIZE + 4, 8);

    // 绘制敌方坦克
    enemyTanks.forEach(tank => {
      // 坦克主体
      ctx.fillStyle = tank.color;
      ctx.fillRect(tank.position.x, tank.position.y, TANK_SIZE, TANK_SIZE);

      // 坦克履带效果
      ctx.fillStyle = '#7F1D1D'; // red-800
      ctx.fillRect(tank.position.x - 2, tank.position.y, 2, TANK_SIZE);
      ctx.fillRect(tank.position.x + TANK_SIZE, tank.position.y, 2, TANK_SIZE);
      ctx.fillRect(tank.position.x, tank.position.y - 2, TANK_SIZE, 2);
      ctx.fillRect(tank.position.x, tank.position.y + TANK_SIZE, TANK_SIZE, 2);

      // 绘制坦克炮管方向
      ctx.strokeStyle = '#7F1D1D'; // red-800
      ctx.lineWidth = 6;
      ctx.beginPath();
      switch (tank.direction) {
        case 'UP':
          ctx.moveTo(tank.position.x + TANK_SIZE / 2, tank.position.y);
          ctx.lineTo(tank.position.x + TANK_SIZE / 2, tank.position.y - 12);
          break;
        case 'DOWN':
          ctx.moveTo(tank.position.x + TANK_SIZE / 2, tank.position.y + TANK_SIZE);
          ctx.lineTo(tank.position.x + TANK_SIZE / 2, tank.position.y + TANK_SIZE + 12);
          break;
        case 'LEFT':
          ctx.moveTo(tank.position.x, tank.position.y + TANK_SIZE / 2);
          ctx.lineTo(tank.position.x - 12, tank.position.y + TANK_SIZE / 2);
          break;
        case 'RIGHT':
          ctx.moveTo(tank.position.x + TANK_SIZE, tank.position.y + TANK_SIZE / 2);
          ctx.lineTo(tank.position.x + TANK_SIZE + 12, tank.position.y + TANK_SIZE / 2);
          break;
      }
      ctx.stroke();

      // 绘制敌方坦克生命值条
      ctx.fillStyle = '#EF4444'; // red-500
      ctx.fillRect(tank.position.x - 2, tank.position.y - 15, TANK_SIZE + 4, 8);
      ctx.fillStyle = '#10B981'; // green-500
      ctx.fillRect(tank.position.x - 2, tank.position.y - 15, ((TANK_SIZE + 4) * tank.health) / 100, 8);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(tank.position.x - 2, tank.position.y - 15, TANK_SIZE + 4, 8);
    });

    // 绘制子弹
    bullets.forEach(bullet => {
      // 玩家子弹是黄色，敌方子弹是红色
      const isPlayerBullet = bullet.id.includes('bullet-');
      const gradient = ctx.createRadialGradient(
        bullet.position.x + BULLET_SIZE / 2,
        bullet.position.y + BULLET_SIZE / 2,
        1,
        bullet.position.x + BULLET_SIZE / 2,
        bullet.position.y + BULLET_SIZE / 2,
        BULLET_SIZE / 2
      );
      
      if (isPlayerBullet) {
        gradient.addColorStop(0, '#FEF08A'); // yellow-200
        gradient.addColorStop(1, '#FBBF24'); // yellow-400
      } else {
        gradient.addColorStop(0, '#FCA5A5'); // red-300
        gradient.addColorStop(1, '#F87171'); // red-400
      }
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        bullet.position.x + BULLET_SIZE / 2,
        bullet.position.y + BULLET_SIZE / 2,
        BULLET_SIZE / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // 添加子弹光晕效果
      ctx.beginPath();
      ctx.arc(
        bullet.position.x + BULLET_SIZE / 2,
        bullet.position.y + BULLET_SIZE / 2,
        BULLET_SIZE,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = isPlayerBullet ? 'rgba(251, 191, 36, 0.3)' : 'rgba(248, 113, 113, 0.3)';
      ctx.fill();
    });
  }, [playerTank, bullets, enemyTanks, obstacles]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setPlayerTank({
      id: 'player',
      position: { x: 50, y: 50 },
      direction: 'RIGHT',
      color: '#3B82F6', // blue-500
      health: 100
    });
    setBullets([]);
    setEnemyTanks([
      {
        id: 'enemy1',
        position: { x: 300, y: 200 },
        direction: 'LEFT',
        color: '#EF4444', // red-500
        health: 100
      },
      {
        id: 'enemy2',
        position: { x: 500, y: 400 },
        direction: 'UP',
        color: '#EF4444', // red-500
        health: 100
      }
    ]);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-3xl font-bold text-white mb-4">坦克大战</h1>
      
      {!gameStarted ? (
        <div className="flex flex-col items-center">
          <button
            onClick={startGame}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            开始游戏
          </button>
          <div className="mt-6 text-white bg-gray-800 p-4 rounded-lg max-w-md">
            <h2 className="text-xl font-semibold mb-2">游戏说明</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>使用 W/A/S/D 或方向键控制坦克移动</li>
              <li>按空格键发射子弹</li>
              <li>击败敌方坦克获得分数</li>
              <li>避免被敌方子弹击中</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-2 text-white flex space-x-6">
            <span>得分: {score}</span>
            <span>生命值: {playerTank.health}</span>
            <span>敌方坦克: {enemyTanks.length}</span>
          </div>
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="border-2 border-gray-600 bg-gray-800 rounded"
          />
          {gameOver && (
            <div className="mt-4 p-6 bg-gray-800 text-white rounded-lg text-center">
              {gameWon ? (
                <>
                  <h2 className="text-2xl font-bold text-green-500 mb-2">恭喜获胜!</h2>
                  <p className="text-xl">最终得分: {score}</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-red-500 mb-2">游戏结束!</h2>
                  <p className="text-xl">最终得分: {score}</p>
                </>
              )}
              <button
                onClick={startGame}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                重新开始
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default TankGame;