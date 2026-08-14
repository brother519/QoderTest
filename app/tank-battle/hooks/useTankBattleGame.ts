/**
 * 坦克大战游戏核心逻辑 Hook
 *
 * 管理玩家坦克移动与射击、敌人 AI（随机方向移动+自动射击）、
 * 子弹碰撞检测（地图/坦克）、道具系统、爆炸动画和胜负判定。
 * 使用 requestAnimationFrame 驱动游戏主循环。
 *
 * @module tank-battle/hooks/useTankBattleGame
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Direction,
  GameStatus,
  TileType,
  Tank,
  Bullet,
  // Explosion, // 未使用的类型
  // PowerUp, // 未使用的类型
  PowerUpType,
  TankGameConfig,
  TankGameState,
} from '../types/game';
import {
  LEVEL_1,
  ENEMY_SPAWNS,
  PLAYER_SPAWN,
  SCORE_PER_ENEMY,
  SCORE_PER_POWERUP,
} from '../constants/config';
import { useHighScore } from '@/lib/hooks/useHighScore';

/** 全局自增 ID，用于唯一标识游戏对象 */
let nextId = 1;
const uid = () => nextId++;

/** 深拷贝地图（避免修改原始关卡数据） */
function cloneMap(m: TileType[][]) {
  return m.map((row) => [...row]);
}

/** 创建玩家坦克（根据出生点配置初始位置） */
function createPlayer(config: TankGameConfig): Tank {
  return {
    id: uid(),
    x: PLAYER_SPAWN.x * config.tileSize,
    y: PLAYER_SPAWN.y * config.tileSize,
    direction: 'UP',
    speed: config.playerSpeed,
    hp: 1,
    lastShot: 0,
    cooldown: config.playerCooldown,
  };
}

/** 创建敌人坦克（从预设出生点之一生成） */
function createEnemy(config: TankGameConfig, spawnIdx: number): Tank {
  const spawn = ENEMY_SPAWNS[spawnIdx % ENEMY_SPAWNS.length];
  return {
    id: uid(),
    x: spawn.x * config.tileSize,
    y: spawn.y * config.tileSize,
    direction: 'DOWN',
    speed: config.enemySpeed,
    hp: 1,
    lastShot: 0,
    cooldown: config.enemyCooldown,
  };
}

/** 方向到 X 轴增量的映射 */
const DIR_DX: Record<Direction, number> = { UP: 0, DOWN: 0, LEFT: -1, RIGHT: 1 };
/** 方向到 Y 轴增量的映射 */
const DIR_DY: Record<Direction, number> = { UP: -1, DOWN: 1, LEFT: 0, RIGHT: 0 };

/** 在指定位置添加爆炸效果到游戏状态 */
function addExplosionInternal(state: TankGameState, x: number, y: number) {
  state.explosions.push({
    id: uid(),
    x,
    y,
    frame: 0,
    maxFrames: 10,
  });
}

/** 在指定位置随机生成一个道具（星/盾/命） */
function spawnPowerUpInternal(state: TankGameState, x: number, y: number) {
  const types = [PowerUpType.STAR, PowerUpType.SHIELD, PowerUpType.LIFE];
  const type = types[Math.floor(Math.random() * types.length)];
  state.powerUps.push({
    id: uid(),
    x,
    y,
    type,
  });
}

/** 矩形碰撞检测（AABB） */
function rectOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/** 检测坦克是否与地图障碍物碰撞（砖墙/钢墙/水域/基地） */
function tankCollidesMap(
  tx: number, ty: number, size: number, map: TileType[][], tileSize: number,
): boolean {
  const startC = Math.floor(tx / tileSize);
  const endC = Math.floor((tx + size - 1) / tileSize);
  const startR = Math.floor(ty / tileSize);
  const endR = Math.floor((ty + size - 1) / tileSize);
  for (let r = startR; r <= endR; r++) {
    for (let c = startC; c <= endC; c++) {
      if (r < 0 || r >= map.length || c < 0 || c >= map[0].length) return true;
      const tile = map[r][c];
      if (tile === TileType.BRICK || tile === TileType.STEEL || tile === TileType.WATER || tile === TileType.BASE) {
        return true;
      }
    }
  }
  return false;
}

/** 检测坦克是否与其他坦克发生碰撞（排除自身） */
function tankCollidesOtherTanks(
  tx: number, ty: number, size: number, selfId: number, tanks: Tank[],
): boolean {
  for (const t of tanks) {
    if (t.id === selfId) continue;
    if (rectOverlap(tx, ty, size, size, t.x, t.y, size, size)) return true;
  }
  return false;
}

export function useTankBattleGame(config: TankGameConfig) {
  const tankSize = config.tileSize * 2; // 坦克占2x2格子
  const bulletSize = 4;
  const canvasW = config.cols * config.tileSize;
  const canvasH = config.rows * config.tileSize;

  const [highScore, updateHighScore] = useHighScore('tank-battle-high');

  const stateRef = useRef<TankGameState>(null!);
  const keysRef = useRef<Set<string>>(new Set());
  const loopRef = useRef<number>(0);
  const spawnTimerRef = useRef(0);
  const enemyMoveTimerRef = useRef(0);
  const [, forceRender] = useState(0);

  const rerender = useCallback(() => forceRender((n) => n + 1), []);

  const initState = useCallback((): TankGameState => {
    nextId = 1;
    return {
      status: 'idle',
      map: cloneMap(LEVEL_1),
      player: createPlayer(config),
      enemies: [],
      playerBullets: [],
      enemyBullets: [],
      explosions: [],
      powerUps: [],
      score: 0,
      lives: config.playerLives,
      level: 1,
      enemiesRemaining: config.totalEnemies,
      shieldTimer: 0,
    };
  }, [config]);

  if (!stateRef.current) {
    stateRef.current = initState();
  }

  const gs = () => stateRef.current;

  /* ---------- 子弹碰撞检测 ---------- */
  const processBullet = useCallback(
    (b: Bullet, state: TankGameState) => {
      // 移动
      b.x += DIR_DX[b.direction] * b.speed;
      b.y += DIR_DY[b.direction] * b.speed;

      // 边界
      if (b.x < 0 || b.y < 0 || b.x >= canvasW || b.y >= canvasH) return false;

      // 地图碰撞
      const col = Math.floor(b.x / config.tileSize);
      const row = Math.floor(b.y / config.tileSize);
      if (row >= 0 && row < config.rows && col >= 0 && col < config.cols) {
        const tile = state.map[row][col];
        if (tile === TileType.BRICK) {
          state.map[row][col] = TileType.EMPTY;
          addExplosionInternal(state, col * config.tileSize, row * config.tileSize);
          return false;
        }
        if (tile === TileType.STEEL) {
          addExplosionInternal(state, col * config.tileSize, row * config.tileSize);
          return false;
        }
        if (tile === TileType.BASE) {
          state.map[row][col] = TileType.EMPTY;
          addExplosionInternal(state, col * config.tileSize, row * config.tileSize);
          state.status = 'over';
          return false;
        }
      }

      // 坦克碰撞
      if (b.fromPlayer) {
        for (let i = state.enemies.length - 1; i >= 0; i--) {
          const e = state.enemies[i];
          if (rectOverlap(b.x, b.y, bulletSize, bulletSize, e.x, e.y, tankSize, tankSize)) {
            e.hp--;
            if (e.hp <= 0) {
              addExplosionInternal(state, e.x, e.y);
              state.enemies.splice(i, 1);
              state.score += SCORE_PER_ENEMY;
              // 概率掉落道具
              if (Math.random() < 0.2) {
                spawnPowerUpInternal(state, e.x, e.y);
              }
            }
            return false;
          }
        }
      } else {
        const p = state.player;
        if (rectOverlap(b.x, b.y, bulletSize, bulletSize, p.x, p.y, tankSize, tankSize)) {
          if (state.shieldTimer <= 0) {
            state.lives--;
            addExplosionInternal(state, p.x, p.y);
            if (state.lives <= 0) {
              state.status = 'over';
            } else {
              // 重生
              state.player = createPlayer(config);
              state.shieldTimer = 90; // ~3秒无敌
            }
          }
          return false;
        }
      }

      return true;
    },
    [canvasW, canvasH, config, tankSize, bulletSize]
  );

  /* ---------- 游戏主循环 ---------- */
  const tick = useCallback(() => {
    const state = gs();
    if (state.status !== 'playing') return;
    const now = Date.now();

    // 玩家移动
    const keys = keysRef.current;
    let pd: Direction | null = null;
    if (keys.has('UP')) pd = 'UP';
    else if (keys.has('DOWN')) pd = 'DOWN';
    else if (keys.has('LEFT')) pd = 'LEFT';
    else if (keys.has('RIGHT')) pd = 'RIGHT';

    if (pd) {
      state.player.direction = pd;
      const nx = state.player.x + DIR_DX[pd] * config.playerSpeed;
      const ny = state.player.y + DIR_DY[pd] * config.playerSpeed;
      // 边界检查
      if (
        nx >= 0 && ny >= 0 &&
        nx + tankSize <= canvasW &&
        ny + tankSize <= canvasH &&
        !tankCollidesMap(nx, ny, tankSize, state.map, config.tileSize) &&
        !tankCollidesOtherTanks(nx, ny, tankSize, state.player.id, state.enemies)
      ) {
        state.player.x = nx;
        state.player.y = ny;
      }
    }

    // 玩家射击
    if (keys.has('SHOOT') && now - state.player.lastShot >= state.player.cooldown) {
      state.player.lastShot = now;
      const bx = state.player.x + tankSize / 2 - bulletSize / 2;
      const by = state.player.y + tankSize / 2 - bulletSize / 2;
      state.playerBullets.push({
        id: uid(),
        x: bx + DIR_DX[state.player.direction] * tankSize / 2,
        y: by + DIR_DY[state.player.direction] * tankSize / 2,
        direction: state.player.direction,
        speed: config.bulletSpeed,
        fromPlayer: true,
      });
    }

    // 敌人AI
    enemyMoveTimerRef.current++;
    const enemyShouldMove = enemyMoveTimerRef.current % 2 === 0; // 敌人每2帧移动1次
    for (const enemy of state.enemies) {
      // 随机换方向
      if (Math.random() < 0.02) {
        const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        enemy.direction = dirs[Math.floor(Math.random() * dirs.length)];
      }

      if (enemyShouldMove) {
        const ex = enemy.x + DIR_DX[enemy.direction] * config.enemySpeed;
        const ey = enemy.y + DIR_DY[enemy.direction] * config.enemySpeed;
        if (
          ex >= 0 && ey >= 0 &&
          ex + tankSize <= canvasW &&
          ey + tankSize <= canvasH &&
          !tankCollidesMap(ex, ey, tankSize, state.map, config.tileSize) &&
          !tankCollidesOtherTanks(ex, ey, tankSize, enemy.id, [
            state.player,
            ...state.enemies,
          ])
        ) {
          enemy.x = ex;
          enemy.y = ey;
        } else {
          const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
          enemy.direction = dirs[Math.floor(Math.random() * dirs.length)];
        }
      }

      // 敌人射击
      if (now - enemy.lastShot >= enemy.cooldown) {
        enemy.lastShot = now;
        const bx = enemy.x + tankSize / 2 - bulletSize / 2;
        const by = enemy.y + tankSize / 2 - bulletSize / 2;
        state.enemyBullets.push({
          id: uid(),
          x: bx + DIR_DX[enemy.direction] * tankSize / 2,
          y: by + DIR_DY[enemy.direction] * tankSize / 2,
          direction: enemy.direction,
          speed: config.bulletSpeed,
          fromPlayer: false,
        });
      }
    }

    // 生成敌人
    spawnTimerRef.current++;
    if (
      spawnTimerRef.current % 90 === 0 &&
      state.enemies.length < config.maxEnemiesOnScreen &&
      state.enemiesRemaining > 0
    ) {
      const spawnIdx = Math.floor(Math.random() * ENEMY_SPAWNS.length);
      const spawn = ENEMY_SPAWNS[spawnIdx];
      const sx = spawn.x * config.tileSize;
      const sy = spawn.y * config.tileSize;
      // 检查出生点是否被占用
      const blocked = [state.player, ...state.enemies].some((t) =>
        rectOverlap(sx, sy, tankSize, tankSize, t.x, t.y, tankSize, tankSize)
      );
      if (!blocked) {
        state.enemies.push(createEnemy(config, spawnIdx));
        state.enemiesRemaining--;
      }
    }

    // 移动子弹并检测碰撞
    state.playerBullets = state.playerBullets.filter((b) => processBullet(b, state));
    state.enemyBullets = state.enemyBullets.filter((b) => processBullet(b, state));

    // 玩家拾取道具
    for (let i = state.powerUps.length - 1; i >= 0; i--) {
      const pu = state.powerUps[i];
      if (rectOverlap(state.player.x, state.player.y, tankSize, tankSize, pu.x, pu.y, tankSize, tankSize)) {
        state.score += SCORE_PER_POWERUP;
        if (pu.type === PowerUpType.LIFE) state.lives++;
        if (pu.type === PowerUpType.SHIELD) state.shieldTimer = 150;
        state.powerUps.splice(i, 1);
      }
    }

    // 护盾倒计时
    if (state.shieldTimer > 0) state.shieldTimer--;

    // 爆炸动画
    state.explosions = state.explosions.filter((e) => {
      e.frame++;
      return e.frame < e.maxFrames;
    });

    // 失败时更新高分
    const currentStatus = state.status as GameStatus;
    if (currentStatus === 'over') {
      updateHighScore(state.score);
    }

    // 胜利检查
    if (currentStatus === 'playing' && state.enemies.length === 0 && state.enemiesRemaining <= 0) {
      state.status = 'won';
      updateHighScore(state.score);
    }

    rerender();
  }, [config, canvasW, canvasH, tankSize, bulletSize, processBullet, rerender, updateHighScore]);

  /* ---------- 游戏循环管理 ---------- */
  const startLoop = useCallback(() => {
    if (loopRef.current) cancelAnimationFrame(loopRef.current);
    const run = () => {
      tick();
      loopRef.current = requestAnimationFrame(run);
    };
    loopRef.current = requestAnimationFrame(run);
  }, [tick]);

  const stopLoop = useCallback(() => {
    if (loopRef.current) {
      cancelAnimationFrame(loopRef.current);
      loopRef.current = 0;
    }
  }, []);

  useEffect(() => () => stopLoop(), [stopLoop]);

  /* ---------- 对外 API ---------- */
  const start = useCallback(() => {
    const state = gs();
    state.status = 'playing';
    state.shieldTimer = 90;
    spawnTimerRef.current = 80; // 让敌人很快出现
    enemyMoveTimerRef.current = 0;
    startLoop();
    rerender();
  }, [startLoop, rerender]);

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
      startLoop();
    }
    rerender();
  }, [stopLoop, startLoop, rerender]);

  const setKey = useCallback((dir: string, pressed: boolean) => {
    if (pressed) keysRef.current.add(dir);
    else keysRef.current.delete(dir);
  }, []);

  const state = stateRef.current;

  return {
    status: state.status,
    map: state.map,
    player: state.player,
    enemies: state.enemies,
    playerBullets: state.playerBullets,
    enemyBullets: state.enemyBullets,
    explosions: state.explosions,
    powerUps: state.powerUps,
    score: state.score,
    highScore,
    lives: state.lives,
    level: state.level,
    enemiesRemaining: state.enemiesRemaining,
    shieldTimer: state.shieldTimer,
    tankSize,
    bulletSize,
    canvasW,
    canvasH,
    start,
    restart,
    togglePause,
    setKey,
  };
}
