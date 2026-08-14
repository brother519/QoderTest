/**
 * 飞机大战游戏核心逻辑 Hook
 *
 * 管理玩家飞机移动、自动射击、敌机生成与AI、碰撞检测、
 * 道具系统、爆炸动画、难度递增和游戏循环（requestAnimationFrame）。
 * 使用 Ref 模式管理可变状态，避免频繁 re-render。
 *
 * @module aircraft-battle/hooks/useAircraftBattleGame
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  AircraftGameStatus,
  Aircraft,
  Enemy,
  Bullet,
  PowerUp,
  Explosion,
  Star,
  AircraftGameState,
  EnemyType,
  BulletType,
  PowerUpType,
} from '../types/game';
import {
  AIRCRAFT_CONFIG,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  POWERUP_WIDTH,
  POWERUP_HEIGHT,
  EXPLOSION_MAX_FRAMES,
  EXPLOSION_BASE_RADIUS,
  STAR_COUNT,
  STAR_SPEED_MIN,
  STAR_SPEED_MAX,
  BULLET_DAMAGE,
  POWERUP_EFFECTS,
} from '../constants/config';
import { useHighScore } from '../../../lib/hooks/useHighScore';

/** 全局自增 ID，用于唯一标识游戏对象 */
let nextId = 1;
const uid = () => nextId++;

/**
 * 矩形碰撞检测（AABB）
 *
 * @returns true 表示两矩形有重叠
 */
function rectOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/** 创建玩家飞机（初始位置底部居中） */
function createPlayer(): Aircraft {
  return {
    x: (AIRCRAFT_CONFIG.width - PLAYER_WIDTH) / 2,
    y: AIRCRAFT_CONFIG.height - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: AIRCRAFT_CONFIG.playerSpeed,
    lives: AIRCRAFT_CONFIG.initialLives,
    fireRate: AIRCRAFT_CONFIG.baseFireRate,
    bulletType: 'normal',
    fireCooldown: 0,
    invincible: false,
    invincibleTimer: 0,
  };
}

/** 创建背景星星（随机位置、速度、大小） */
function createStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * AIRCRAFT_CONFIG.width,
    y: Math.random() * AIRCRAFT_CONFIG.height,
    speed: STAR_SPEED_MIN + Math.random() * (STAR_SPEED_MAX - STAR_SPEED_MIN),
    size: 1 + Math.random() * 2,
    brightness: 0.3 + Math.random() * 0.7,
  }));
}

/**
 * 根据权重随机选择敌机类型
 *
 * Boss 受分数门槛限制，每 5000 分最多生成一次
 */
function randomEnemyType(difficultyLevel: number, score: number, lastBossSpawnScore: number): EnemyType {
  const types: EnemyType[] = ['small', 'medium', 'large', 'boss'];
  const weights = [
    AIRCRAFT_CONFIG.enemyTypes.small.spawnWeight,
    AIRCRAFT_CONFIG.enemyTypes.medium.spawnWeight,
    AIRCRAFT_CONFIG.enemyTypes.large.spawnWeight,
  ];

  // Boss只在分数达到阈值后出现，且每5000分最多出现一次
  const canSpawnBoss =
    score >= AIRCRAFT_CONFIG.bossScoreThreshold &&
    score - lastBossSpawnScore >= AIRCRAFT_CONFIG.bossScoreThreshold;

  if (canSpawnBoss) {
    weights.push(AIRCRAFT_CONFIG.enemyTypes.boss.spawnWeight);
  } else {
    weights.push(0);
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < types.length; i++) {
    random -= weights[i];
    if (random <= 0) return types[i];
  }

  return 'small';
}

/** 创建敌机（根据类型配置尺寸、速度、血量和移动模式） */
function createEnemy(
  type: EnemyType,
  speedMultiplier: number,
  score: number
): Enemy {
  const config = AIRCRAFT_CONFIG.enemyTypes[type];
  const baseSpeed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);

  let movePattern: Enemy['movePattern'] = 'straight';
  if (type === 'medium') movePattern = 'sine';
  if (type === 'boss') movePattern = 'cruise';

  return {
    id: uid(),
    x: Math.random() * (AIRCRAFT_CONFIG.width - config.width),
    y: -config.height,
    width: config.width,
    height: config.height,
    speed: baseSpeed * speedMultiplier,
    hp: config.hp,
    maxHp: config.hp,
    type,
    shootTimer: 0,
    shootInterval: config.shootInterval,
    points: config.points,
    movePattern,
    movePhase: Math.random() * Math.PI * 2,
  };
}

/** 创建子弹（区分玩家子弹和敌机子弹，方向和伤害不同） */
function createBullet(
  x: number,
  y: number,
  isPlayerBullet: boolean,
  bulletType: BulletType = 'normal'
): Bullet {
  const config = AIRCRAFT_CONFIG;

  if (isPlayerBullet) {
    const size = config.playerBulletSize;
    return {
      id: uid(),
      x: x - size.w / 2,
      y,
      width: size.w,
      height: size.h,
      speed: config.playerBulletSpeed,
      dx: 0,
      dy: -1,
      isPlayerBullet: true,
      damage: BULLET_DAMAGE[bulletType],
    };
  } else {
    const size = config.enemyBulletSize;
    return {
      id: uid(),
      x: x - size.w / 2,
      y,
      width: size.w,
      height: size.h,
      speed: config.enemyBulletSpeed,
      dx: 0,
      dy: 1,
      isPlayerBullet: false,
      damage: BULLET_DAMAGE.enemy,
    };
  }
}

/** 创建扇形子弹（散射武器，左中右三个方向） */
function createSpreadBullets(x: number, y: number): Bullet[] {
  const angles = [-0.3, 0, 0.3]; // 左中右三个方向
  return angles.map((angle) => {
    const size = AIRCRAFT_CONFIG.playerBulletSize;
    return {
      id: uid(),
      x: x - size.w / 2,
      y,
      width: size.w,
      height: size.h,
      speed: AIRCRAFT_CONFIG.playerBulletSpeed,
      dx: Math.sin(angle),
      dy: -Math.cos(angle),
      isPlayerBullet: true,
      damage: BULLET_DAMAGE.spread,
    };
  });
}

/** 创建道具（随机类型：生命/射速/散射/炸弹） */
function createPowerUp(x: number, y: number): PowerUp {
  const types: PowerUpType[] = ['life', 'fireRate', 'spread', 'bomb'];
  const type = types[Math.floor(Math.random() * types.length)];

  return {
    id: uid(),
    x: x - POWERUP_WIDTH / 2,
    y,
    width: POWERUP_WIDTH,
    height: POWERUP_HEIGHT,
    speed: 1.5,
    type,
  };
}

/** 创建爆炸效果（逐帧扩散动画） */
function createExplosion(x: number, y: number, radius: number = EXPLOSION_BASE_RADIUS): Explosion {
  return {
    id: uid(),
    x,
    y,
    radius,
    frame: 0,
    maxFrames: EXPLOSION_MAX_FRAMES,
  };
}

export function useAircraftBattleGame() {
  const [highScore, updateHighScore] = useHighScore('aircraft-battle-high-score');

  const stateRef = useRef<AircraftGameState>(null!);
  const keysRef = useRef<Set<string>>(new Set());
  const loopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const tickRef = useRef<(currentTime: number) => void>(() => {});
  const [, setRenderTick] = useState(0);

  const rerender = useCallback(() => setRenderTick((n) => n + 1), []);

  const initState = useCallback((): AircraftGameState => {
    nextId = 1;
    return {
      status: 'idle',
      player: createPlayer(),
      enemies: [],
      bullets: [],
      powerUps: [],
      explosions: [],
      stars: createStars(),
      score: 0,
      difficultyLevel: 1,
      speedMultiplier: 1,
      spawnInterval: AIRCRAFT_CONFIG.baseSpawnInterval,
      lastSpawnTime: 0,
      lastBossSpawnScore: 0,
    };
  }, []);

  if (!stateRef.current) {
    stateRef.current = initState();
  }

  const gs = () => stateRef.current;

  // 游戏主循环
  const tick = useCallback((currentTime: number) => {
    const state = gs();
    if (state.status !== 'playing') return;

    // 处理 lastTimeRef：如果是 0，说明是第一帧或刚恢复，跳过该帧
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = currentTime;
      return;
    }

    // 计算 deltaTime
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    const keys = keysRef.current;
    const player = state.player;

    // 1. 玩家移动
    let dx = 0;
    let dy = 0;
    if (keys.has('UP')) dy -= 1;
    if (keys.has('DOWN')) dy += 1;
    if (keys.has('LEFT')) dx -= 1;
    if (keys.has('RIGHT')) dx += 1;

    // 归一化对角线移动
    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }

    // 应用移动并限制在画布内
    player.x += dx * player.speed * (deltaTime / 16.67);
    player.y += dy * player.speed * (deltaTime / 16.67);
    player.x = Math.max(0, Math.min(AIRCRAFT_CONFIG.width - player.width, player.x));
    player.y = Math.max(0, Math.min(AIRCRAFT_CONFIG.height - player.height, player.y));

    // 2. 玩家射击（自动射击）
    player.fireCooldown -= deltaTime;
    const wantToShoot = keys.has('SHOOT');
    const fireInterval = wantToShoot ? player.fireRate * 0.6 : player.fireRate;

    if (player.fireCooldown <= 0) {
      player.fireCooldown = fireInterval;

      const bulletX = player.x + player.width / 2;
      const bulletY = player.y;

      if (player.bulletType === 'spread') {
        state.bullets.push(...createSpreadBullets(bulletX, bulletY));
      } else if (player.bulletType === 'laser') {
        const bullet = createBullet(bulletX, bulletY, true, 'laser');
        bullet.height *= 2; // 激光更长
        state.bullets.push(bullet);
      } else {
        state.bullets.push(createBullet(bulletX, bulletY, true, 'normal'));
      }
    }

    // 3. 敌机生成
    state.lastSpawnTime += deltaTime;
    if (state.lastSpawnTime >= state.spawnInterval) {
      state.lastSpawnTime = 0;
      const enemyType = randomEnemyType(state.difficultyLevel, state.score, state.lastBossSpawnScore);
      const enemy = createEnemy(enemyType, state.speedMultiplier, state.score);
      state.enemies.push(enemy);

      if (enemyType === 'boss') {
        state.lastBossSpawnScore = state.score;
      }
    }

    // 4. 敌机移动和射击
    for (const enemy of state.enemies) {
      // 移动
      if (enemy.movePattern === 'sine') {
        enemy.movePhase = (enemy.movePhase || 0) + 0.05;
        enemy.x += Math.sin(enemy.movePhase) * 2;
        enemy.y += enemy.speed * (deltaTime / 16.67);
      } else if (enemy.movePattern === 'cruise') {
        enemy.movePhase = (enemy.movePhase || 0) + 0.02;
        enemy.x += Math.sin(enemy.movePhase) * 1.5;
        enemy.y += enemy.speed * (deltaTime / 16.67);
        // Boss保持在画面上方区域
        if (enemy.y > AIRCRAFT_CONFIG.height * 0.4) {
          enemy.y = AIRCRAFT_CONFIG.height * 0.4;
        }
      } else {
        enemy.y += enemy.speed * (deltaTime / 16.67);
      }

      // 限制在画布范围内
      enemy.x = Math.max(0, Math.min(AIRCRAFT_CONFIG.width - enemy.width, enemy.x));

      // 射击
      if (enemy.shootInterval > 0) {
        enemy.shootTimer += deltaTime;
        if (enemy.shootTimer >= enemy.shootInterval) {
          enemy.shootTimer = 0;
          const bulletX = enemy.x + enemy.width / 2;
          const bulletY = enemy.y + enemy.height;
          state.bullets.push(createBullet(bulletX, bulletY, false));
        }
      }
    }

    // 5. 子弹移动
    for (const bullet of state.bullets) {
      if (bullet.dx !== 0 || bullet.dy !== 0) {
        bullet.x += bullet.dx * bullet.speed * (deltaTime / 16.67);
        bullet.y += bullet.dy * bullet.speed * (deltaTime / 16.67);
      } else {
        // 垂直子弹
        const direction = bullet.isPlayerBullet ? -1 : 1;
        bullet.y += direction * bullet.speed * (deltaTime / 16.67);
      }
    }

    // 6. 道具移动
    for (const powerUp of state.powerUps) {
      powerUp.y += powerUp.speed * (deltaTime / 16.67);
    }

    // 7. 背景星星移动
    for (const star of state.stars) {
      star.y += star.speed * (deltaTime / 16.67);
      if (star.y > AIRCRAFT_CONFIG.height) {
        star.y = 0;
        star.x = Math.random() * AIRCRAFT_CONFIG.width;
      }
    }

    // 8. 碰撞检测
    // 玩家子弹 vs 敌机
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const bullet = state.bullets[i];
      if (!bullet.isPlayerBullet) continue;

      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const enemy = state.enemies[j];
        if (
          rectOverlap(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
          )
        ) {
          enemy.hp -= bullet.damage;
          state.bullets.splice(i, 1);

          if (enemy.hp <= 0) {
            // 击毁敌机
            state.explosions.push(
              createExplosion(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2,
                Math.max(enemy.width, enemy.height)
              )
            );
            state.score += enemy.points;
            state.enemies.splice(j, 1);

            // 概率掉落道具
            if (Math.random() < AIRCRAFT_CONFIG.powerUpDropRate) {
              state.powerUps.push(
                createPowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2)
              );
            }
          }
          break;
        }
      }
    }

    // 敌机子弹 vs 玩家
    if (!player.invincible) {
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const bullet = state.bullets[i];
        if (bullet.isPlayerBullet) continue;

        if (
          rectOverlap(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height,
            player.x,
            player.y,
            player.width,
            player.height
          )
        ) {
          state.bullets.splice(i, 1);
          player.lives--;
          player.invincible = true;
          player.invincibleTimer = AIRCRAFT_CONFIG.invincibleDuration;
          state.explosions.push(
            createExplosion(
              player.x + player.width / 2,
              player.y + player.height / 2,
              Math.max(player.width, player.height)
            )
          );

          if (player.lives <= 0) {
            state.status = 'over';
            updateHighScore(state.score);
          }
          break;
        }
      }

      // 敌机碰撞玩家
      for (const enemy of state.enemies) {
        if (
          rectOverlap(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height,
            player.x,
            player.y,
            player.width,
            player.height
          )
        ) {
          player.lives--;
          player.invincible = true;
          player.invincibleTimer = AIRCRAFT_CONFIG.invincibleDuration;
          state.explosions.push(
            createExplosion(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              Math.max(enemy.width, enemy.height)
            )
          );

          // 移除碰撞的敌机
          const idx = state.enemies.indexOf(enemy);
          if (idx > -1) state.enemies.splice(idx, 1);

          if (player.lives <= 0) {
            state.status = 'over';
            updateHighScore(state.score);
          }
          break;
        }
      }
    }

    // 玩家拾取道具
    for (let i = state.powerUps.length - 1; i >= 0; i--) {
      const powerUp = state.powerUps[i];
      if (
        rectOverlap(
          powerUp.x,
          powerUp.y,
          powerUp.width,
          powerUp.height,
          player.x,
          player.y,
          player.width,
          player.height
        )
      ) {
        // 应用道具效果
        switch (powerUp.type) {
          case 'life':
            player.lives += POWERUP_EFFECTS.life.lives;
            break;
          case 'fireRate':
            player.fireRate *= POWERUP_EFFECTS.fireRate.fireRateMultiplier;
            break;
          case 'spread':
            player.bulletType = POWERUP_EFFECTS.spread.bulletType;
            break;
          case 'bomb':
            // 清屏：销毁所有敌机
            for (const enemy of state.enemies) {
              state.explosions.push(
                createExplosion(
                  enemy.x + enemy.width / 2,
                  enemy.y + enemy.height / 2,
                  Math.max(enemy.width, enemy.height)
                )
              );
              state.score += enemy.points;
            }
            state.enemies = [];
            // 清除所有敌机子弹
            state.bullets = state.bullets.filter((b) => b.isPlayerBullet);
            break;
        }
        state.powerUps.splice(i, 1);
      }
    }

    // 9. 清理出界对象
    state.bullets = state.bullets.filter(
      (b) => b.y > -b.height && b.y < AIRCRAFT_CONFIG.height + b.height
    );
    state.enemies = state.enemies.filter((e) => e.y < AIRCRAFT_CONFIG.height + e.height);
    state.powerUps = state.powerUps.filter((p) => p.y < AIRCRAFT_CONFIG.height + p.height);

    // 10. 爆炸动画更新
    for (const explosion of state.explosions) {
      explosion.frame++;
    }
    state.explosions = state.explosions.filter((e) => e.frame < e.maxFrames);

    // 11. 无敌帧计时
    if (player.invincible) {
      player.invincibleTimer -= deltaTime;
      if (player.invincibleTimer <= 0) {
        player.invincible = false;
        player.invincibleTimer = 0;
      }
    }

    // 12. 难度递增检查
    const newDifficultyLevel =
      Math.floor(state.score / AIRCRAFT_CONFIG.difficultyScoreThreshold) + 1;
    if (newDifficultyLevel > state.difficultyLevel) {
      state.difficultyLevel = newDifficultyLevel;
      state.speedMultiplier = 1 + (state.difficultyLevel - 1) * AIRCRAFT_CONFIG.difficultyStep;
      state.spawnInterval = Math.max(
        300,
        AIRCRAFT_CONFIG.baseSpawnInterval * Math.pow(0.95, state.difficultyLevel - 1)
      );
    }

    rerender();
  }, [rerender, updateHighScore]);

  // 更新 tickRef，确保 RAF 循环始终调用最新的 tick
  tickRef.current = tick;

  // 游戏循环管理
  const startLoop = useCallback(() => {
    // 先停止现有循环，防止多个 RAF 循环同时运行
    if (loopRef.current) {
      cancelAnimationFrame(loopRef.current);
      loopRef.current = 0;
    }
    lastTimeRef.current = 0;

    // 使用稳定的 run 函数，通过 tickRef 调用 tick
    const run = (time: number) => {
      tickRef.current(time);
      loopRef.current = requestAnimationFrame(run);
    };
    loopRef.current = requestAnimationFrame(run);
  }, []);

  const stopLoop = useCallback(() => {
    if (loopRef.current) {
      cancelAnimationFrame(loopRef.current);
      loopRef.current = 0;
    }
    lastTimeRef.current = 0;
  }, []);

  // 重置游戏状态（用于 start 时重置关键状态）
  const resetGameState = useCallback(() => {
    const state = gs();
    // 重置玩家位置和状态
    state.player = createPlayer();
    // 清空游戏对象
    state.enemies = [];
    state.bullets = [];
    state.powerUps = [];
    state.explosions = [];
    // 重置分数和难度
    state.score = 0;
    state.difficultyLevel = 1;
    state.speedMultiplier = 1;
    state.spawnInterval = AIRCRAFT_CONFIG.baseSpawnInterval;
    state.lastSpawnTime = 0;
    state.lastBossSpawnScore = 0;
    // 重置计时器
    lastTimeRef.current = 0;
  }, []);

  useEffect(() => () => stopLoop(), [stopLoop]);

  // 对外 API
  const start = useCallback(() => {
    resetGameState();
    const state = gs();
    state.status = 'playing';
    state.player.invincible = true;
    state.player.invincibleTimer = AIRCRAFT_CONFIG.invincibleDuration;
    startLoop();
    rerender();
  }, [resetGameState, startLoop, rerender]);

  const restart = useCallback(() => {
    stopLoop();
    stateRef.current = initState();
    rerender();
  }, [stopLoop, initState, rerender]);

  const togglePause = useCallback(() => {
    const state = gs();
    if (state.status === 'playing') {
      state.status = 'paused';
      stopLoop();
    } else if (state.status === 'paused') {
      state.status = 'playing';
      lastTimeRef.current = 0; // 恢复时重置时间，避免巨大的 deltaTime
      startLoop();
    }
    rerender();
  }, [stopLoop, startLoop, rerender]);

  const setKey = useCallback((action: string, pressed: boolean) => {
    if (pressed) keysRef.current.add(action);
    else keysRef.current.delete(action);
  }, []);

  return {
    state: stateRef.current,
    highScore,
    start,
    restart,
    togglePause,
    setKey,
  };
}
