<template>
  <div id="app">
    <!-- 页面切换按钮 -->
    <button @click="togglePage" class="toggle-button">
      {{ currentPage === 'model' ? '切换到对话页' : '切换到模型页' }}
    </button>

    <!-- 模型页面 -->
    <div v-show="currentPage === 'model'" class="page model-page">
      <Model ref="modelRef" />
    </div>

    <!-- 对话页面 -->
    <div v-show="currentPage === 'chat'" class="page chat-page">
      <ChatBox @new-message="handleNewMessage" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Model from './components/Model.vue'
import ChatBox from './components/ChatBox.vue'

// 当前页面状态
const currentPage = ref('model')
const modelRef = ref(null)

// 切换页面
const togglePage = () => {
  currentPage.value = currentPage.value === 'model' ? 'chat' : 'model'
}

// 处理来自 ChatBox 的新消息
const handleNewMessage = (message) => {
  if (modelRef.value) {
    modelRef.value.updateBubbleText(message)
  }
}
</script>

<style scoped>
#app {
  height: 100vh;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  overflow: hidden;

}

.toggle-button {
  position: absolute;
  top: 100px;
  right: 20px;
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  z-index: 100;
  font-size: 35px;
  transition: all 0.3s ease;
}

.toggle-button:hover {
  background: #764ba2;
  transform: scale(1.05);
}

.page {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  transition: opacity 0.5s ease;
}

/* .model-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
} */

.chat-page {
  background: linear-gradient(135deg, #0a0e1a 0%, #050810 100%);
}
</style>
