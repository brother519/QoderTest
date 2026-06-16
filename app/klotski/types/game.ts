import { GridPosition } from '@/lib/types/game';

export type KlotskiStatus = 'selecting' | 'playing' | 'won';

export type BlockType = 'caocao' | 'guanyu' | 'vertical' | 'soldier';

export interface BlockSize {
  width: number;
  height: number;
}

export interface Block {
  id: string;
  type: BlockType;
  size: BlockSize;
  position: GridPosition;
  label: string;
}

export interface Level {
  id: string;
  name: string;
  blocks: Block[];
  parSteps: number;
}

export interface KlotskiGameState {
  status: KlotskiStatus;
  blocks: Block[];
  steps: number;
  history: Block[][];
  selectedBlockId: string | null;
  currentLevelId: string | null;
}
