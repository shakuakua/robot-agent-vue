<template>
  <div ref="modelContainerRef" class="model-container" id>
    <!-- Three.js 渲染的模型将在这里显示 -->
  </div>
</template>

<script setup>
import { ref, onMounted,  } from 'vue'
import renderer from '../index.js'
import model from '@/model.js'


const modelContainerRef = ref(null)



onMounted(() => {

  console.log('onMounted')
  // setContainer(modelContainerRef.value)
  modelContainerRef.value.appendChild(renderer.domElement);
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

/* 添加3D模型加载动画 */
.model-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, transparent 60%, rgba(0, 0, 0, 0.1) 100%);
  pointer-events: none;
}
</style>
