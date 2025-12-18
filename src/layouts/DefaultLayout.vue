<script setup lang="ts">
import { ref } from 'vue'
import Watermark from '@/components/business/Watermark/index.vue'

const isCollapse = ref(false)
</script>

<template>
  <Watermark text="商品管理系统">
    <el-container class="layout-container">
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="logo">
          <span v-show="!isCollapse">商品后台</span>
        </div>
        <el-menu
          default-active="1"
          :collapse="isCollapse"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
        >
          <el-menu-item index="1">
            <el-icon><Goods /></el-icon>
            <template #title>商品管理</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <el-icon
            class="collapse-btn"
            @click="isCollapse = !isCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <span class="header-title">商品后台管理系统</span>
        </el-header>
        <el-main>
          <slot />
        </el-main>
      </el-container>
    </el-container>
  </Watermark>
</template>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    background-color: #263445;
  }
}

.el-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  padding: 0 20px;

  .collapse-btn {
    cursor: pointer;
    font-size: 20px;
  }

  .header-title {
    margin-left: 20px;
    font-size: 18px;
    font-weight: 500;
  }
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
