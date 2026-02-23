<template>
  <div class="chat-container">
    <!-- 3D模型组件 -->
    <!-- <Model class="model-wrapper" /> -->

    <!-- 聊天界面 -->
    <div class="chat-interface">
      <!-- 连接状态栏 -->
      <div class="status-bar">
        <div class="status-indicators">
          <div class="status-item">
            <div :class="['status-dot', chatStore.connectionStatus]"></div>
            <span>连接: {{ connectionStatusText }}</span>
          </div>
          <div class="status-item">
            <div :class="['status-dot', listeningStatusClass]"></div>
            <span>监听: {{ listeningStatusText }}</span>
          </div>
          <!-- <div class="status-item">
            <span>状态: {{ digitalHumanStateText }}</span>
          </div> -->
        </div>

        <div class="control-buttons">
          <!-- <button
            class="control-btn start-btn"
            @click="chatStore.startListening"
            :disabled="chatStore.listeningActive"
          >
            🎤 启动监听
          </button>
          <button
            class="control-btn stop-btn"
            @click="chatStore.stopListening"
            :disabled="!chatStore.listeningActive"
          >
            🛑 停止监听
          </button> -->
          <button
            class="control-btn connect-btn"
            @click="toggleConnection"
          >
            {{ chatStore.isConnected ? '🔌 断开连接' : '📡 连接服务器' }}
          </button>
          <button
            class="control-btn clear-btn"
            @click="chatStore.clearMessages"
          >
            🗑️ 清空消息
          </button>
        </div>
      </div>

      <!-- 统计信息 -->
      <!-- <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-value">{{ chatStore.conversationCount }}</div>
          <div class="stat-label">唤醒次数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ chatStore.messages.length }}</div>
          <div class="stat-label">消息数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ chatStore.connectionCount }}</div>
          <div class="stat-label">连接数</div>
        </div>
      </div> -->

      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainerRef">
        <div
          v-for="(msg, index) in chatStore.messages"
          :key="index"
          :class="['message', msg.sender]"
        >
          <div class="message-header">
            <div class="message-avatar">
              {{ msg.sender === 'user' ? '👤' : '🦊' }}
            </div>
            <div class="message-role">
              {{ msg.sender === 'user' ? '我' : '小狸' }}
            </div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
          <div class="message-content">{{ msg.text }}</div>
        </div>

        <!-- 空状态 -->
        <div v-if="chatStore.messages.length === 0" class="empty-state">
          <div class="empty-icon">😴</div>
          <div class="empty-text">等待对话开始...</div>
        </div>
      </div>

      <!-- 输入区域 -->
      <!-- <div class="input-area">
        <input
          v-model="chatStore.inputMessage"
          @keyup.enter="sendMessage"
          placeholder="输入消息与数字人对话..."
          :disabled="!chatStore.isConnected"
        />
        <button
          @click="sendMessage"
          :disabled="!chatStore.isConnected || !chatStore.inputMessage.trim()"
        >
          发送
        </button>
      </div> -->
    </div>
  </div>
</template>

<script setup>
// 导入Vue 3 API
import { ref, onMounted, nextTick, watch, computed } from 'vue'
// 导入状态管理
import { useChatStore } from '@/stores/chatStore'
// 导入3D模型组件
import Model from './Model.vue'

// 使用聊天状态
const chatStore = useChatStore()
// 消息容器引用
const messagesContainerRef = ref(null)

// 连接状态文本
const connectionStatusText = computed(() => {
  switch (chatStore.connectionStatus) {
    case 'connected': return '已连接'
    case 'connecting': return '连接中...'
    case 'disconnected': return '未连接'
    default: return '未知'
  }
})

// 监听状态类
const listeningStatusClass = computed(() => {
  return chatStore.listeningActive ? 'active' : 'inactive'
})

// 监听状态文本
const listeningStatusText = computed(() => {
  return chatStore.listeningActive ? '监听中' : '未监听'
})

// 数字人状态文本
const digitalHumanStateText = computed(() => {
  switch (chatStore.digitalHumanState) {
    case 'waiting_wake': return '💤 等待唤醒'
    case 'awakened': return '✨ 已唤醒'
    case 'listening': return '🎤 聆听中'
    case 'processing': return '⚙️ 处理中'
    case 'speaking': return '💬 对话中'
    case 'idle': return '⏳ 空闲'
    case 'goodbye': return '👋 再见'
    default: return '未知状态'
  }
})

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
  }
}

// 发送消息
const sendMessage = () => {
  chatStore.sendMessage()
}

// 切换连接状态
const toggleConnection = () => {
  if (chatStore.isConnected) {
    chatStore.disconnect()
  } else {
    chatStore.initWebSocket()
  }
}

// 格式化时间
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 监听消息变化并滚动到底部
watch(() => chatStore.messages, scrollToBottom, { deep: true })

// 组件挂载时连接
onMounted(() => {
  chatStore.startListening()
  chatStore.initWebSocket()
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #0a0e1a 0%, #050810 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

/* 网格背景效果 */
.chat-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(180deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

/* .model-wrapper {
  flex: 1;
  width: 100%;
  height: 50vh;
  position: relative;
  z-index: 1;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
} */

.chat-interface {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(20, 25, 45, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 240, 255, 0.2);
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -5px 30px rgba(0, 0, 0, 0.3);
  border-radius: 20px 20px 0 0;
  z-index: 2;
}

.status-bar {
  padding: 15px 20px;
  background: rgba(0, 240, 255, 0.1);
  border-bottom: 1px solid rgba(0, 240, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicators {
  display: flex;
  gap: 20px;
  align-items: center;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a0aec0;
  font-size: 30px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #a0aec0;
  box-shadow: 0 0 10px currentColor;
}

.status-dot.connected {
  background: #10ff85;
  box-shadow: 0 0 15px #10ff85;
}

.status-dot.connecting {
  background: #ffaa00;
  box-shadow: 0 0 15px #ffaa00;
  animation: pulse 1.5s ease-in-out infinite;
}

.status-dot.disconnected {
  background: #ff3366;
  box-shadow: 0 0 15px #ff3366;
}

.status-dot.active {
  background: #00f0ff;
  box-shadow: 0 0 15px #00f0ff;
}

.status-dot.inactive {
  background: #a0aec0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.control-buttons {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.control-btn.start-btn {
  background: linear-gradient(135deg, #00f0ff, #00a8b8);
  border-color: #00f0ff;
  color: #0a0e1a;
}

.control-btn.start-btn:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
  transform: translateY(-2px);
}

.control-btn.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.stop-btn {
  background: linear-gradient(135deg, #ff3366, #cc2850);
  border-color: #ff3366;
  color: white;
}

.control-btn.stop-btn:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(255, 51, 102, 0.5);
  transform: translateY(-2px);
}

.control-btn.stop-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.connect-btn {
  background: transparent;
  border-color: #a0aec0;
  color: #a0aec0;
}

.control-btn.connect-btn:hover {
  border-color: #00f0ff;
  color: #00f0ff;
}

.control-btn.clear-btn {
  background: transparent;
  border-color: #a0aec0;
  color: #a0aec0;
}

.control-btn.clear-btn:hover {
  border-color: #ffaa00;
  color: #ffaa00;
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 15px 20px;
  background: rgba(0, 240, 255, 0.05);
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-family: 'Orbitron', monospace;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #00f0ff, white);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: white;
}

.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgba(0, 240, 255, 0.05);
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.3);
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.5);
}

.message {
  max-width: 85%;
  animation: slideIn 0.3s ease-out;
  color: black;
  font-size: 30px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  align-self: flex-end;
}

.message.ai {
  align-self: flex-start;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  background: linear-gradient(135deg, #00f0ff, #00a8b8);
}

.message.ai .message-avatar {
  background: linear-gradient(135deg, #ff00ff, #cc00cc);
}

.message-role {
  font-weight: 600;
  font-size: 40px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.message.user .message-role {
  color: #00f0ff;
}

.message.ai .message-role {
  color: #ff00ff;
}

.message-time {
  margin-left: auto;
  font-size: 40px;
  color: #a0aec0;
}

.message-content {
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid;
  padding: 15px;
  border-radius: 0 10px 10px 0;
  font-size: 50px;
  line-height: 1.5;
}

.message.user .message-content {
  border-color: #00f0ff;
  background: rgba(0, 240, 255, 0.1);
}

.message.ai .message-content {
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #a0aec0;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-text {
  font-size: 18px;
}

.input-area {
  display: flex;
  padding: 20px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
}

.input-area input {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 25px 0 0 25px;
  outline: none;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  transition: all 0.3s;
}

.input-area input:focus {
  border-color: #00f0ff;
  box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.2);
}

.input-area input:disabled {
  background: rgba(255, 255, 255, 0.02);
  color: #a0aec0;
  cursor: not-allowed;
}

.input-area input::placeholder {
  color: #a0aec0;
}

.input-area button {
  padding: 14px 25px;
  background: linear-gradient(135deg, #00f0ff, #00a8b8);
  color: #0a0e1a;
  border: none;
  border-radius: 0 25px 25px 0;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-area button:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
  transform: translateY(-2px);
}

.input-area button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-bar {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .status-indicators {
    justify-content: space-between;
  }

  .control-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .control-btn {
    font-size: 11px;
    padding: 6px 12px;
  }

  .stats-bar {
    padding: 10px 15px;
  }

  .stat-value {
    font-size: 20px;
  }

  .message {
    max-width: 90%;
  }

  .message-content {
    font-size: 14px;
    padding: 12px;
  }
}
</style>
