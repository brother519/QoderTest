<template>
  <div class="game-board-container">
    <div class="game-board" :style="boardStyle">
      <GamePiece
        v-for="piece in flatBoard"
        :key="piece.id"
        :piece="piece"
        :is-selected="isSelected(piece)"
        @select="handleSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores'
import GamePiece from './GamePiece.vue'
import { BOARD_SIZE, CELL_SIZE, GAP_SIZE } from '@/constants/game'

const gameStore = useGameStore()

const flatBoard = computed(() => {
  const pieces = []
  for (const row of gameStore.board) {
    for (const piece of row) {
      if (piece) {
        pieces.push(piece)
      }
    }
  }
  return pieces
})

const boardStyle = computed(() => ({
  width: `${BOARD_SIZE * (CELL_SIZE + GAP_SIZE) - GAP_SIZE}px`,
  height: `${BOARD_SIZE * (CELL_SIZE + GAP_SIZE) - GAP_SIZE}px`
}))

function isSelected(piece: { row: number; col: number }) {
  const selected = gameStore.selectedPiece
  return selected?.row === piece.row && selected?.col === piece.col
}

function handleSelect(row: number, col: number) {
  gameStore.selectPiece({ row, col })
}
</script>

<style scoped>
.game-board-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.game-board {
  position: relative;
  background: linear-gradient(145deg, #2c3e50, #34495e);
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
</style>
