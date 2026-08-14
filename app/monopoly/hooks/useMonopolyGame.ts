'use client';

/**
 * 大富翁游戏核心逻辑 Hook
 */

import { useState, useCallback } from 'react';
import {
  MonopolyGameState,
  Player,
  PlayerColor,
  PropertyState,
  DiceResult,
  ChanceCard,
  GamePhase,
} from '../types/game';
import {
  BOARD_CELLS,
  CHANCE_CARDS,
  COMMUNITY_CARDS,
  TOTAL_CELLS,
  INITIAL_MONEY,
  GO_SALARY,
  JAIL_BAIL,
  MAX_JAIL_TURNS,
  JAIL_CELL,
  GO_JAIL_CELL,
} from '../constants/config';

// ─── 辅助函数 ───────────────────────────────────────────────────────────────

/** 掷单个骰子 */
function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/** 掷两个骰子 */
function rollDice(): DiceResult {
  const die1 = rollDie();
  const die2 = rollDie();
  return { die1, die2, total: die1 + die2, isDouble: die1 === die2 };
}

/** 从数组中随机取一个元素 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 统一扣款逻辑
 * @returns 更新后的 players 数组（可能触发破产）
 */
function chargeMoney(
  players: Player[],
  payerId: string,
  amount: number,
  receiverId?: string
): Player[] {
  return players.map((p) => {
    if (p.id === payerId) {
      const newMoney = p.money - amount;
      if (newMoney < 0) {
        // 破产
        return { ...p, money: 0, bankrupt: true };
      }
      return { ...p, money: newMoney };
    }
    if (receiverId && p.id === receiverId) {
      return { ...p, money: p.money + amount };
    }
    return p;
  });
}

/**
 * 检查胜利者（仅剩 1 名未破产玩家）
 */
function checkWinner(players: Player[]): string | null {
  const active = players.filter((p) => !p.bankrupt);
  if (active.length === 1) return active[0].id;
  return null;
}

/**
 * 推进到下一位未破产玩家，重置 phase 为 waiting
 */
function nextTurn(state: MonopolyGameState): MonopolyGameState {
  const total = state.players.length;
  let next = (state.currentPlayerIndex + 1) % total;
  let tries = 0;
  while (state.players[next].bankrupt && tries < total) {
    next = (next + 1) % total;
    tries++;
  }
  return {
    ...state,
    currentPlayerIndex: next,
    phase: 'waiting',
    lastDice: null,
    currentCard: null,
    doubleCount: 0,
  };
}

/**
 * 处理棋子到达新格子的逻辑
 * 返回更新后的游戏状态（不含 players 数组更新，那部分由调用方处理）
 */
function processLanding(
  state: MonopolyGameState,
  playerIndex: number,
  newPosition: number
): MonopolyGameState {
  const cell = BOARD_CELLS[newPosition];
  const players = [...state.players];
  const player = { ...players[playerIndex] };
  players[playerIndex] = player;
  let updatedState: MonopolyGameState = { ...state, players };

  switch (cell.type) {
    case 'start':
    case 'free': {
      // 免费停留
      return nextTurn({
        ...updatedState,
        message: `${player.name} 停在 ${cell.name}，休息一下！`,
      });
    }

    case 'jail': {
      // 探视，不坐牢
      return nextTurn({
        ...updatedState,
        message: `${player.name} 只是探视监狱，安全！`,
      });
    }

    case 'go_jail': {
      // 去监狱
      const jailedPlayer = {
        ...player,
        position: JAIL_CELL,
        inJail: true,
        jailTurns: 0,
      };
      const newPlayers = [...players];
      newPlayers[playerIndex] = jailedPlayer;
      return nextTurn({
        ...updatedState,
        players: newPlayers,
        message: `${player.name} 被送进监狱！`,
      });
    }

    case 'tax': {
      const tax = cell.taxAmount ?? 0;
      const newPlayers = chargeMoney(players, player.id, tax);
      const winner = checkWinner(newPlayers);
      return nextTurn({
        ...updatedState,
        players: newPlayers,
        message: `${player.name} 缴纳税款 $${tax}！`,
        winnerId: winner,
        status: winner ? 'won' : updatedState.status,
      });
    }

    case 'chance': {
      const card = pickRandom(CHANCE_CARDS);
      return {
        ...updatedState,
        phase: 'chance',
        currentCard: card,
        message: `${player.name} 抽到机会卡：${card.text}`,
      };
    }

    case 'community': {
      const card = pickRandom(COMMUNITY_CARDS);
      return {
        ...updatedState,
        phase: 'chance',
        currentCard: card,
        message: `${player.name} 抽到命运卡：${card.text}`,
      };
    }

    case 'utility':
    case 'property': {
      const propState = updatedState.properties[newPosition];
      if (!propState || !propState.ownerId) {
        // 无主，可购买
        return {
          ...updatedState,
          phase: 'buying',
          message: `${player.name} 到达 ${cell.name}（$${cell.price}），是否购买？`,
        };
      }
      if (propState.ownerId === player.id) {
        // 自己的地产，可升级（公共设施不可升级）
        if (cell.type === 'utility' || propState.houseLevel >= 3) {
          return nextTurn({
            ...updatedState,
            message: `${player.name} 停在自己的 ${cell.name}。`,
          });
        }
        return {
          ...updatedState,
          phase: 'upgrading',
          message: `${player.name} 停在自己的 ${cell.name}，可花 $${cell.upgradeCost} 升级！`,
        };
      }
      // 别人的地产，缴租
      const owner = players.find((p) => p.id === propState.ownerId);
      if (!owner || owner.bankrupt) {
        return nextTurn({
          ...updatedState,
          message: `${player.name} 停在 ${cell.name}，地主已破产，无需缴租！`,
        });
      }
      const rent = (cell.rents ?? [0, 0, 0, 0])[propState.houseLevel];
      const newPlayers = chargeMoney(players, player.id, rent, propState.ownerId);
      const winner = checkWinner(newPlayers);
      return nextTurn({
        ...updatedState,
        players: newPlayers,
        message: `${player.name} 停在 ${owner.name} 的 ${cell.name}，缴租 $${rent}！`,
        winnerId: winner,
        status: winner ? 'won' : updatedState.status,
      });
    }

    default:
      return nextTurn({ ...updatedState, message: `${player.name} 移动完毕。` });
  }
}

// ─── 初始化 ──────────────────────────────────────────────────────────────────

const PLAYER_NAMES = ['玩家1', '玩家2', '玩家3', '玩家4'];
const PLAYER_COLORS: PlayerColor[] = ['cyan', 'rose', 'amber', 'violet'];

function createInitialState(playerCount: number): MonopolyGameState {
  const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
    id: `player${i + 1}`,
    name: PLAYER_NAMES[i],
    color: PLAYER_COLORS[i],
    position: 0,
    money: INITIAL_MONEY,
    bankrupt: false,
    inJail: false,
    jailTurns: 0,
  }));

  return {
    status: 'playing',
    phase: 'waiting',
    players,
    currentPlayerIndex: 0,
    properties: {},
    lastDice: null,
    currentCard: null,
    message: `游戏开始！${players[0].name} 先行。`,
    winnerId: null,
    doubleCount: 0,
  };
}

// ─── Hook 返回类型 ────────────────────────────────────────────────────────────

export interface UseMonopolyGameReturn {
  state: MonopolyGameState;
  currentPlayer: Player;
  startGame: (playerCount: number) => void;
  restartGame: () => void;
  rollDice: () => void;
  buyProperty: () => void;
  skipBuy: () => void;
  upgradeProperty: (cellIndex: number) => void;
  confirm: () => void;
  payBail: () => void;
}

// ─── 空占位 state（游戏未开始时使用）────────────────────────────────────────

const IDLE_STATE: MonopolyGameState = {
  status: 'idle',
  phase: 'waiting',
  players: [],
  currentPlayerIndex: 0,
  properties: {},
  lastDice: null,
  currentCard: null,
  message: '',
  winnerId: null,
  doubleCount: 0,
};

// ─── 主 Hook ─────────────────────────────────────────────────────────────────

export function useMonopolyGame(): UseMonopolyGameReturn {
  const [state, setState] = useState<MonopolyGameState>(IDLE_STATE);

  /** 获取当前玩家（保证存在） */
  const currentPlayer: Player =
    state.players[state.currentPlayerIndex] ??
    ({
      id: '',
      name: '',
      color: 'cyan',
      position: 0,
      money: 0,
      bankrupt: false,
      inJail: false,
      jailTurns: 0,
    } as Player);

  // ── 开始游戏 ──
  const startGame = useCallback((playerCount: number) => {
    setState(createInitialState(playerCount));
  }, []);

  // ── 重新开始 ──
  const restartGame = useCallback(() => {
    setState(IDLE_STATE);
  }, []);

  // ── 掷骰子 ──
  const handleRollDice = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'waiting' || prev.status !== 'playing') return prev;

      const playerIndex = prev.currentPlayerIndex;
      const player = prev.players[playerIndex];
      const dice = rollDice();
      let newDoubleCount = prev.doubleCount;

      // 坐牢逻辑
      if (player.inJail) {
        if (dice.isDouble) {
          // 掷双数出狱
          const freedPlayer = { ...player, inJail: false, jailTurns: 0 };
          const players = [...prev.players];
          players[playerIndex] = freedPlayer;
          const rawPos = (freedPlayer.position + dice.total) % TOTAL_CELLS;
          // 检查经过起点
          const passedGo = rawPos < freedPlayer.position || (rawPos === 0);
          const finalPlayers = passedGo
            ? players.map((p, i) =>
                i === playerIndex ? { ...p, money: p.money + GO_SALARY } : p
              )
            : players;
          const passMsg = passedGo ? `经过起点获得 $${GO_SALARY}！` : '';
          const movedPlayer = { ...finalPlayers[playerIndex], position: rawPos };
          finalPlayers[playerIndex] = movedPlayer;

          return processLanding(
            {
              ...prev,
              players: finalPlayers,
              lastDice: dice,
              doubleCount: 0,
              message: `${player.name} 掷出双数 ${dice.die1}+${dice.die2}，出狱！${passMsg}`,
            },
            playerIndex,
            rawPos
          );
        } else {
          // 未出狱
          const newJailTurns = player.jailTurns + 1;
          if (newJailTurns >= MAX_JAIL_TURNS) {
            // 强制缴保释金出狱
            const players = [...prev.players];
            players[playerIndex] = {
              ...player,
              money: player.money - JAIL_BAIL,
              inJail: false,
              jailTurns: 0,
            };
            const rawPos = (player.position + dice.total) % TOTAL_CELLS;
            const passedGo = rawPos < player.position || rawPos === 0;
            if (passedGo) players[playerIndex].money += GO_SALARY;
            players[playerIndex].position = rawPos;
            return processLanding(
              {
                ...prev,
                players,
                lastDice: dice,
                doubleCount: 0,
                message: `${player.name} 坐牢已满 ${MAX_JAIL_TURNS} 回合，强制缴 $${JAIL_BAIL} 保释金出狱！`,
              },
              playerIndex,
              rawPos
            );
          } else {
            // 继续坐牢
            const players = [...prev.players];
            players[playerIndex] = { ...player, jailTurns: newJailTurns };
            return nextTurn({
              ...prev,
              players,
              lastDice: dice,
              message: `${player.name} 未掷出双数，继续坐牢（第 ${newJailTurns} 回合）。`,
            });
          }
        }
      }

      // 连续三次双数 → 入狱
      if (dice.isDouble) {
        newDoubleCount += 1;
        if (newDoubleCount >= 3) {
          const players = [...prev.players];
          players[playerIndex] = {
            ...player,
            position: JAIL_CELL,
            inJail: true,
            jailTurns: 0,
          };
          return nextTurn({
            ...prev,
            players,
            lastDice: dice,
            doubleCount: 0,
            message: `${player.name} 连续三次掷双数，被送进监狱！`,
          });
        }
      } else {
        newDoubleCount = 0;
      }

      // 正常移动
      const rawPos = (player.position + dice.total) % TOTAL_CELLS;
      const passedGo =
        player.position + dice.total >= TOTAL_CELLS && player.position !== 0;
      const players = [...prev.players];
      let updatedPlayer = { ...player, position: rawPos };
      if (passedGo) {
        updatedPlayer = { ...updatedPlayer, money: updatedPlayer.money + GO_SALARY };
      }
      players[playerIndex] = updatedPlayer;

      const passMsg = passedGo ? `经过起点获得 $${GO_SALARY}！` : '';

      return processLanding(
        {
          ...prev,
          players,
          lastDice: dice,
          doubleCount: newDoubleCount,
          message: `${player.name} 掷出 ${dice.die1}+${dice.die2}=${dice.total}。${passMsg}`,
        },
        playerIndex,
        rawPos
      );
    });
  }, []);

  // ── 购买地产 ──
  const buyProperty = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'buying') return prev;
      const playerIndex = prev.currentPlayerIndex;
      const player = prev.players[playerIndex];
      const cell = BOARD_CELLS[player.position];
      if (!cell.price || player.money < cell.price) {
        // 钱不够，跳过
        return nextTurn({
          ...prev,
          message: `${player.name} 资金不足，无法购买 ${cell.name}！`,
        });
      }
      const newPlayers = prev.players.map((p, i) =>
        i === playerIndex ? { ...p, money: p.money - cell.price! } : p
      );
      const newProperties: Record<number, PropertyState> = {
        ...prev.properties,
        [player.position]: {
          cellIndex: player.position,
          ownerId: player.id,
          houseLevel: 0,
        },
      };
      return nextTurn({
        ...prev,
        players: newPlayers,
        properties: newProperties,
        message: `${player.name} 购买了 ${cell.name}，花费 $${cell.price}！`,
      });
    });
  }, []);

  // ── 跳过购买/升级 ──
  const skipBuy = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'buying' && prev.phase !== 'upgrading') return prev;
      return nextTurn({
        ...prev,
        message: `${prev.players[prev.currentPlayerIndex].name} 放弃操作。`,
      });
    });
  }, []);

  // ── 升级地产 ──
  const upgradeProperty = useCallback((cellIndex: number) => {
    setState((prev) => {
      if (prev.phase !== 'upgrading') return prev;
      const playerIndex = prev.currentPlayerIndex;
      const player = prev.players[playerIndex];
      const cell = BOARD_CELLS[cellIndex];
      const propState = prev.properties[cellIndex];

      if (!propState || propState.ownerId !== player.id) return prev;
      if (!cell.upgradeCost || (cell.upgradeCost > 0 && player.money < cell.upgradeCost)) {
        return nextTurn({
          ...prev,
          message: `${player.name} 资金不足，无法升级 ${cell.name}！`,
        });
      }
      if (propState.houseLevel >= 3) {
        return nextTurn({
          ...prev,
          message: `${cell.name} 已达最高等级！`,
        });
      }

      const newLevel = (propState.houseLevel + 1) as 0 | 1 | 2 | 3;
      const newPlayers = prev.players.map((p, i) =>
        i === playerIndex ? { ...p, money: p.money - (cell.upgradeCost ?? 0) } : p
      );
      const newProperties = {
        ...prev.properties,
        [cellIndex]: { ...propState, houseLevel: newLevel },
      };
      return nextTurn({
        ...prev,
        players: newPlayers,
        properties: newProperties,
        message: `${player.name} 将 ${cell.name} 升级至 ${newLevel} 栋！`,
      });
    });
  }, []);

  // ── 确认机会/命运卡效果 ──
  const confirm = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'chance' || !prev.currentCard) return prev;
      const playerIndex = prev.currentPlayerIndex;
      const player = prev.players[playerIndex];
      const effect = prev.currentCard.effect;
      let players = [...prev.players];
      let message = prev.message;

      switch (effect.type) {
        case 'money': {
          if (effect.amount >= 0) {
            players = players.map((p, i) =>
              i === playerIndex ? { ...p, money: p.money + effect.amount } : p
            );
          } else {
            players = chargeMoney(players, player.id, -effect.amount);
          }
          break;
        }
        case 'move': {
          const target = effect.target;
          const passedGo = target < player.position;
          players = players.map((p, i) => {
            if (i !== playerIndex) return p;
            return {
              ...p,
              position: target,
              money: passedGo ? p.money + GO_SALARY : p.money,
            };
          });
          const winner = checkWinner(players);
          const landState = processLanding(
            {
              ...prev,
              players,
              currentCard: null,
              winnerId: winner,
              status: winner ? 'won' : prev.status,
            },
            playerIndex,
            target
          );
          return landState;
        }
        case 'move_relative': {
          const newPos =
            ((player.position + effect.steps) % TOTAL_CELLS + TOTAL_CELLS) % TOTAL_CELLS;
          players = players.map((p, i) =>
            i === playerIndex ? { ...p, position: newPos } : p
          );
          const winner = checkWinner(players);
          return processLanding(
            {
              ...prev,
              players,
              currentCard: null,
              winnerId: winner,
              status: winner ? 'won' : prev.status,
            },
            playerIndex,
            newPos
          );
        }
        case 'go_jail': {
          players = players.map((p, i) =>
            i === playerIndex
              ? { ...p, position: JAIL_CELL, inJail: true, jailTurns: 0 }
              : p
          );
          message = `${player.name} 被送进监狱！`;
          return nextTurn({ ...prev, players, currentCard: null, message });
        }
        case 'free_jail': {
          // 免出监狱卡：记录为直接出狱
          players = players.map((p, i) =>
            i === playerIndex ? { ...p, inJail: false, jailTurns: 0 } : p
          );
          message = `${player.name} 获得免出监狱卡，已使用！`;
          return nextTurn({ ...prev, players, currentCard: null, message });
        }
        case 'collect_from_all': {
          const amount = effect.amount;
          const others = players.filter(
            (p) => p.id !== player.id && !p.bankrupt
          );
          let collected = 0;
          players = players.map((p) => {
            if (p.id === player.id) return p;
            if (p.bankrupt) return p;
            const pay = Math.min(p.money, amount);
            collected += pay;
            return { ...p, money: p.money - pay };
          });
          players = players.map((p) =>
            p.id === player.id ? { ...p, money: p.money + collected } : p
          );
          message = `${player.name} 向 ${others.length} 位玩家各收取 $${amount}，共 $${collected}！`;
          break;
        }
      }

      const winner = checkWinner(players);
      return nextTurn({
        ...prev,
        players,
        currentCard: null,
        message,
        winnerId: winner,
        status: winner ? 'won' : prev.status,
      });
    });
  }, []);

  // ── 缴保释金 ──
  const payBail = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'waiting') return prev;
      const playerIndex = prev.currentPlayerIndex;
      const player = prev.players[playerIndex];
      if (!player.inJail) return prev;
      if (player.money < JAIL_BAIL) {
        return {
          ...prev,
          message: `${player.name} 资金不足，无法缴保释金！`,
        };
      }
      const players = prev.players.map((p, i) =>
        i === playerIndex
          ? { ...p, money: p.money - JAIL_BAIL, inJail: false, jailTurns: 0 }
          : p
      );
      return {
        ...prev,
        players,
        message: `${player.name} 缴纳 $${JAIL_BAIL} 保释金，出狱！现在掷骰子。`,
      };
    });
  }, []);

  return {
    state,
    currentPlayer,
    startGame,
    restartGame,
    rollDice: handleRollDice,
    buyProperty,
    skipBuy,
    upgradeProperty,
    confirm,
    payBail,
  };
}
