export interface LevelData {
  levelId: number;
  name: string;
  gridSize: number;
  tileSize: number;
  playerSpawns: PlayerSpawn[];
  basePosition: Position;
  terrain: number[][];
  enemies: EnemyConfig[];
  enemySpawnPoints: Position[];
}

export interface PlayerSpawn {
  x: number;
  y: number;
  player: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface EnemyConfig {
  type: string;
  count: number;
}
