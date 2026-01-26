<template>
  <!-- 应用根容器 -->
  <div id="app">
    <!-- 聊天盒子组件 -->
    <ChatBox />
  </div>
</template>

<script setup>
// 导入聊天盒子组件
import ChatBox from './components/ChatBox.vue'
</script>

<style scoped>
#app {
  height: 100vh;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2, #667eea);
}

/* 动画过渡效果 */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #app {
    height: 100vh;
    overflow: hidden;
  }
}
</style>
