<template>
  <div ref="modelContainerRef" class="model-container">
    <!-- Three.js 渲染的模型将在这里显示 -->
  </div>

  <!-- 气泡框 -->
  <div
    v-if="latestAIMessage"
    class="speech-bubble"
    :style="bubbleStyle"
  >
    {{ latestAIMessage }}
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch,onUnmounted } from 'vue'
import * as THREE from 'three'
import renderer, { camera, scene } from '../index.js' // 导入 camera 和 scene
import model from '@/model.js'
import { useChatStore } from '@/stores/chatStore' // 导入聊天状态管理

const modelContainerRef = ref(null)
const chatStore = useChatStore() // 使用聊天状态

// 计算属性：获取最新的 AI 消息
const latestAIMessage = computed(() => {
  const aiMessages = chatStore.messages.filter(msg => msg.sender === 'ai')
  return aiMessages.length > 0 ? aiMessages[aiMessages.length - 1].text : ''
})

// 气泡样式（动态绑定位置）
const bubbleStyle = ref({
  position: 'absolute',
  left: '50%',
  top: '20%',
  transform: 'translate(-50%, -50%)',
  background: 'white',
  padding: '15px 25px',
  borderRadius: '20px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  fontSize: '25px',
  color: '#333',
  maxWidth: '650px',
  textAlign: 'center',
  zIndex: 100,
  pointerEvents: 'none'
})

// 更新气泡位置（绑定到模型头部）
const updateBubblePosition = () => {
  if (!model) return

  // 获取模型头部位置（假设模型中心为 (0, 0, 0)，头部偏移为 (0, 4.5, 0)）
  const anchorPoint = new THREE.Vector3(2.5, 2, 0)
  anchorPoint.project(camera) // 转换为标准化设备坐标 (NDC)

  // 转换为屏幕像素坐标
  const container = modelContainerRef.value
  const widthHalf = container.clientWidth / 2
  const heightHalf = container.clientHeight / 2

  const x = anchorPoint.x * widthHalf + widthHalf
  const y = -anchorPoint.y * heightHalf + heightHalf - 50 // 向上偏移避免遮挡

  bubbleStyle.value.left = `${x}px`
  bubbleStyle.value.top = `${y}px`
}

onMounted(() => {
  console.log('onMounted')
  modelContainerRef.value.appendChild(renderer.domElement)

  // 初始化气泡位置
  updateBubblePosition()

  // 监听消息变化，更新气泡内容和位置
  watch(
    () => chatStore.messages,
    () => {
      console.log('消息更新:', latestAIMessage.value)
      updateBubblePosition() // 动态调整气泡位置
    },
    { deep: true }
  )

  // 监听窗口大小变化，重新计算气泡位置
  window.addEventListener('resize', updateBubblePosition)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', updateBubblePosition)
})

// 暴露方法给父组件调用（如果需要手动更新气泡）
defineExpose({
  updateBubbleText: (text) => {
    console.log('手动更新气泡文本:', text)
  }
})
</script>

<style scoped>
.model-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px 12px 0 0;
}

/* 豆包风格气泡样式 */
.speech-bubble {
  position: absolute;
  background: white;
  padding: 12px 20px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  color: #333;
  max-width: 650px;
  text-align: center;
  z-index: 100;
  pointer-events: none;
}

/* 气泡尾部箭头 */
.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -10px; /* 箭头位于气泡底部 */
  left: 10px; /* 箭头靠左 */
  width: 0;
  height: 0;
  border-top: 15px solid transparent; /* 顶部透明 */
  border-bottom: 15px solid transparent; /* 底部透明 */
  border-left: 15px solid white; /* 右侧为白色，形成向左的箭头 */

}
</style>
