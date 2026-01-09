<template>
  <div id="app">
    <el-container style="height: 100vh">
      <el-header style="background: #545c64; color: #fff; padding: 0 20px; display: flex; align-items: center">
        <h2 style="margin: 0">日志中央化平台</h2>
        <el-menu
          mode="horizontal"
          :default-active="$route.path"
          style="flex: 1; margin-left: 50px"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          router
        >
          <el-menu-item index="/search">日志搜索</el-menu-item>
          <el-menu-item index="/realtime">实时日志</el-menu-item>
          <el-menu-item index="/alerts">告警规则</el-menu-item>
        </el-menu>
      </el-header>
      <el-main style="padding: 20px">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100%;
}
</style>
