<template>
  <div class="level-selector">
    <h2>选择关卡</h2>
    <div class="levels-grid">
      <div
        v-for="level in levels"
        :key="level.id"
        class="level-card"
        :class="{ locked: !isUnlocked(level.id), completed: getStars(level.id) > 0 }"
        @click="selectLevel(level.id)"
      >
        <div class="level-number">{{ level.id }}</div>
        <div class="level-name">{{ level.name }}</div>
        <div class="level-stars">
          <span v-for="i in 3" :key="i" class="star" :class="{ active: i <= getStars(level.id) }">
            ★
          </span>
        </div>
        <div v-if="!isUnlocked(level.id)" class="lock-overlay">
          🔒
        </div>
      </div>
    </div>
    <button class="btn-back" @click="$emit('back')">返回</button>
  </div>
</template>

<script setup lang="ts">
import { useLevelStore } from '@/stores'
import { LEVELS } from '@/constants/levels'

const levelStore = useLevelStore()
const levels = LEVELS

const emit = defineEmits<{
  select: [levelId: number]
  back: []
}>()

function isUnlocked(levelId: number) {
  return levelStore.isLevelUnlocked(levelId)
}

function getStars(levelId: number) {
  return levelStore.getLevelStars(levelId)
}

function selectLevel(levelId: number) {
  if (isUnlocked(levelId)) {
    emit('select', levelId)
  }
}
</script>

<style scoped>
.level-selector {
  padding: 20px;
  text-align: center;
}

h2 {
  color: #ecf0f1;
  margin-bottom: 30px;
  font-size: 28px;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  max-width: 600px;
  margin: 0 auto 30px;
}

.level-card {
  position: relative;
  background: linear-gradient(145deg, #34495e, #2c3e50);
  border-radius: 12px;
  padding: 20px 15px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.level-card:not(.locked):hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.level-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.level-card.completed {
  border: 2px solid #27ae60;
}

.level-number {
  font-size: 32px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
}

.level-name {
  font-size: 14px;
  color: #95a5a6;
  margin-bottom: 10px;
}

.level-stars {
  font-size: 18px;
}

.star {
  color: #34495e;
  margin: 0 2px;
}

.star.active {
  color: #f1c40f;
}

.lock-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 30px;
}

.btn-back {
  padding: 12px 30px;
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-back:hover {
  transform: translateY(-2px);
}
</style>
