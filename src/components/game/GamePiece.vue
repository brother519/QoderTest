<template>
  <div
    class="game-piece"
    :class="{
      selected: isSelected,
      matched: piece.isMatched,
      removing: piece.isRemoving,
      falling: piece.isFalling,
      new: piece.isNew,
      'special-stripe-h': piece.special === 'stripe_horizontal',
      'special-stripe-v': piece.special === 'stripe_vertical',
      'special-bomb': piece.special === 'bomb',
      'special-rainbow': piece.special === 'rainbow'
    }"
    :style="pieceStyle"
    @click="handleClick"
  >
    <div class="piece-inner" :style="{ backgroundColor: pieceColor }">
      <span v-if="piece.special === 'stripe_horizontal'" class="special-icon">━</span>
      <span v-else-if="piece.special === 'stripe_vertical'" class="special-icon">┃</span>
      <span v-else-if="piece.special === 'bomb'" class="special-icon">💣</span>
      <span v-else-if="piece.special === 'rainbow'" class="special-icon">🌈</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Piece } from '@/types'
import { PIECE_COLORS } from '@/types/piece'
import { CELL_SIZE, GAP_SIZE } from '@/constants/game'

const props = defineProps<{
  piece: Piece
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: [row: number, col: number]
}>()

const pieceColor = computed(() => PIECE_COLORS[props.piece.type])

const pieceStyle = computed(() => ({
  width: `${CELL_SIZE}px`,
  height: `${CELL_SIZE}px`,
  left: `${props.piece.col * (CELL_SIZE + GAP_SIZE)}px`,
  top: `${props.piece.row * (CELL_SIZE + GAP_SIZE)}px`
}))

function handleClick() {
  emit('select', props.piece.row, props.piece.col)
}
</script>

<style scoped>
.game-piece {
  position: absolute;
  cursor: pointer;
  transition: top 0.3s ease, left 0.15s ease, transform 0.15s ease;
  z-index: 1;
}

.piece-inner {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.15s ease;
}

.game-piece:hover .piece-inner {
  transform: scale(1.05);
}

.game-piece.selected .piece-inner {
  transform: scale(1.1);
  box-shadow: 0 0 0 3px #fff, 0 0 0 5px #3498db;
}

.game-piece.removing {
  animation: pop-out 0.2s ease-out forwards;
  z-index: 2;
}

.game-piece.falling {
  animation: drop-in 0.3s ease-in;
}

.game-piece.new {
  animation: fade-in 0.3s ease-out;
}

.special-icon {
  font-size: 20px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.special-stripe-h .piece-inner,
.special-stripe-v .piece-inner {
  background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%);
  background-size: 200% 200%;
  animation: shine 1.5s infinite;
}

.special-bomb .piece-inner {
  box-shadow: 0 0 10px 2px rgba(255, 100, 0, 0.5);
}

.special-rainbow .piece-inner {
  background: linear-gradient(135deg, #e74c3c, #f1c40f, #2ecc71, #3498db, #9b59b6) !important;
  animation: rainbow-shift 2s infinite;
}

@keyframes pop-out {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); }
  100% { transform: scale(0); opacity: 0; }
}

@keyframes drop-in {
  0% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
}

@keyframes fade-in {
  0% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes shine {
  0% { background-position: 200% 200%; }
  100% { background-position: -200% -200%; }
}

@keyframes rainbow-shift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(180deg); }
}
</style>
