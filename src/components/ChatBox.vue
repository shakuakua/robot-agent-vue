<template>
  <div class="chat-container">
    <!-- 3D模型组件 -->
    <Model class="model-wrapper" />

    <!-- 聊天界面 -->
    <div class="chat-interface">
      <!-- 连接状态栏 -->
      <div class="status-bar">
        <span :class="['status-indicator', chatStore.connectionStatus]">
          状态: {{ connectionStatusText }}
        </span>
        <span class="digital-state">
          数字人: {{ digitalHumanStateText }}
        </span>
        <button class="connection-btn"  @click="chatStore.startListening">启动监听</button>
        <button class="connection-btn"  @click="chatStore.stopListening">停止监听</button>
        <button class="connection-btn"  @click="toggleConnection">
          {{ chatStore.isConnected ? '断开' : '连接' }}
        </button>
      </div>

      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainerRef">
        <div
          v-for="(msg, index) in chatStore.messages"
          :key="index"
          :class="['message', msg.sender]"
        >
          <div class="message-content">{{ msg.text }}</div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <input
          v-model="chatStore.inputMessage"
          @keyup.enter="sendMessage"
          placeholder="输入消息..."
          :disabled="!chatStore.isConnected"
        />
        <button
          @click="sendMessage"
          :disabled="!chatStore.isConnected || !chatStore.inputMessage.trim()"
        >
          发送
        </button>
      </div>
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

// 数字人状态文本
const digitalHumanStateText = computed(() => {
  switch (chatStore.digitalHumanState) {
    case 'waiting_wake': return '等待唤醒'
    case 'awakened': return '已唤醒'
    case 'listening': return '聆听中'
    case 'processing': return '处理中'
    case 'speaking': return '说话中'
    case 'idle': return '空闲'
    case 'goodbye': return '告别'
    default: return '未知'
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
  return new Date(date).toLocaleTimeString()
}

// 监听消息变化并滚动到底部
watch(() => chatStore.messages, scrollToBottom, { deep: true })

// 组件挂载时连接
onMounted(() => {
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 18px; /* 整体字体增大 */
}

.model-wrapper {
  flex: 1; /* 占据50%高度 */
  width: 100%;
  height: 50vh;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.chat-interface {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  height: 50vh; /* 占据50%高度 */
  display: flex;
  flex-direction: column;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
  border-radius: 20px 20px 0 0;
  font-size: 18px; /* 字体增大 */
}

.status-bar {
  padding: 15px 20px; /* 内边距增大 */
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-group {
  display: flex;
  gap: 15px; /* 间距增大 */
}

.status-indicator {
  padding: 6px 12px; /* 内边距增大 */
  border-radius: 18px;
  font-size: 16px; /* 字体增大 */
  font-weight: 500;
}

.status-indicator.connected {
  background: rgba(40, 167, 69, 0.3);
}

.status-indicator.connecting {
  background: rgba(255, 193, 7, 0.3);
}

.status-indicator.disconnected {
  background: rgba(220, 53, 69, 0.3);
}

.digital-state {
  font-size: 20px; /* 字体增大 */
  opacity: 0.9;
}

.connection-btn {
  padding: 8px 16px; /* 内边距增大 */
  border: none;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  font-size: 16px; /* 字体增大 */
  transition: all 0.3s ease;
}

.connection-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px; /* 内边距增大 */
  display: flex;
  flex-direction: column;
  gap: 15px; /* 间距增大 */
  background: rgba(248, 249, 250, 0.5);
}

.message {
  max-width: 80%;
  padding: 15px 20px; /* 内边距增大 */
  border-radius: 22px; /* 圆角增大 */
  position: relative;
  animation: fadeIn 0.3s ease;
  font-size: 18px; /* 字体增大 */
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-bottom-right-radius: 8px; /* 圆角增大 */
}

.message.ai {
  align-self: flex-start;
  background: white;
  color: #333;
  border: 1px solid #e9ecef;
  border-bottom-left-radius: 8px; /* 圆角增大 */
  font-size: 18px; /* 字体增大 */
}

.message-time {
  font-size: 14px; /* 字体增大 */
  color: #999;
  text-align: right;
  margin-top: 6px; /* 上边距增大 */
}

.input-area {
  display: flex;
  padding: 20px; /* 内边距增大 */
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: white;
}

.input-area input {
  flex: 1;
  padding: 14px 20px; /* 内边距增大 */
  border: 1px solid #e0e0e0;
  border-radius: 25px 0 0 25px; /* 圆角增大 */
  outline: none;
  font-size: 18px; /* 字体增大 */
  transition: border-color 0.3s;
}

.input-area input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.connection-btn{
  font-size: 20px;
}
.input-area input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.input-area button {
  padding: 14px 25px; /* 内边距增大 */
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 0 25px 25px 0; /* 圆角增大 */
  cursor: pointer;
  font-size: 18px; /* 字体增大 */
  transition: all 0.3s ease;
}

.input-area button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.input-area button:disabled {
  background: #ced4da;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    font-size: 16px; /* 移动端字体稍小 */
  }

  .model-wrapper,
  .chat-interface {
    height: 50vh;
  }

  .status-bar {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .status-group {
    gap: 10px;
  }

  .message {
    font-size: 16px;
    padding: 12px 16px;
  }

  .input-area input,
  .input-area button {
    font-size: 16px;
    padding: 12px 16px;
  }
}
</style>
