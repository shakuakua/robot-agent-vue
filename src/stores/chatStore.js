// 导入Pinia状态管理
import { defineStore } from 'pinia'
import { reset ,activeheadAction,activetailAction} from'../model.js'
// 定义聊天状态管理
export const useChatStore = defineStore('chat', {
  // 状态定义
  state: () => ({
    // 消息列表
    messages: [
      { text: '你好！我是数字人小狸，有什么可以帮助你的吗？', sender: 'ai', timestamp: new Date() }
    ],
    // 用户输入消息
    inputMessage: '',
    // WebSocket连接
    wsConnection: null,
    // 是否连接
    isConnected: false,
    // 连接状态
    connectionStatus: 'disconnected',
    // 数字人状态
    digitalHumanState: 'idle',
    // 状态文本
    statusText: '等待连接...',
    // 唤醒词
    wakeWords: ['你好小狐狸', '小狐狸', 'hey fox']
  }),

  // 计算属性
  getters: {
    // 用户消息
    userMessages: (state) => state.messages.filter(msg => msg.sender === 'user'),
    // AI消息
    aiMessages: (state) => state.messages.filter(msg => msg.sender === 'ai'),
    // 最后一条消息
    lastMessage: (state) => state.messages[state.messages.length - 1]
  },

  // 动作定义
  actions: {
    // 初始化WebSocket连接
    initWebSocket() {
      // 如果已连接则返回
      if (this.wsConnection && this.isConnected) {
        return
      }

      // 设置连接状态
      this.connectionStatus = 'connecting'

      try {
        // 创建WebSocket连接
        const wsUrl = 'ws://localhost:8000/ws/conversation'
        this.wsConnection = new WebSocket(wsUrl)

        // 连接打开时
        this.wsConnection.onopen = () => {
          console.log('✅ 已连接到数字人服务器')
          this.isConnected = true
          this.connectionStatus = 'connected'
          this.statusText = '已连接'
        }

        // 收到消息时
        this.wsConnection.onmessage = (event) => {
          console.log('收到消息:', event.data)
          const data = JSON.parse(event.data)
          this.handleWsMessage(data)
        }

        // 连接错误时
        this.wsConnection.onerror = (error) => {
          console.error('WebSocket错误:', error)
          this.connectionStatus = 'disconnected'
        }

        // 连接关闭时
        this.wsConnection.onclose = () => {
          console.log('WebSocket连接已关闭')
          this.isConnected = false
          this.connectionStatus = 'disconnected'
          this.statusText = '连接已断开'
          // 尝试重连
          setTimeout(() => {
            if (this.connectionStatus !== 'connecting') {
              this.initWebSocket()
            }
          }, 3000)
        }

      } catch (error) {
        console.error('WebSocket连接失败:', error)
        this.connectionStatus = 'disconnected'
      }
    },

    // 处理WebSocket消息
    handleWsMessage(data) {
      switch (data.type) {
        case 'connected':
          // 处理连接成功消息
          console.log('连接详情:', data)
          this.statusText = data.message
          this.wakeWords = data.wake_words || this.wakeWords
          this.digitalHumanState = data.current_state || 'waiting_wake'
          activetailAction()
          break

        case 'state_change':
          // 处理状态变化
          this.handleStateChange(data.state, data.data)
          break

        case 'current_state':
          // 处理当前状态查询响应
          console.log('当前状态:', data)
          this.digitalHumanState = data.state
          break

        case 'pong':
          // 处理心跳响应
          console.log('收到心跳响应')
          break

        default:
          // 未知消息类型
          console.log('未知消息类型:', data)
          break
      }
    },

    // 处理状态变化
    handleStateChange(state, data) {
      // 更新数字人状态
      this.digitalHumanState = state

      switch (state) {
        case 'waiting_wake':
          // 等待唤醒状态
          this.statusText = data?.message || '等待唤醒...'
          reset()
          break

        case 'awakened':
          // 唤醒成功
          this.statusText = '我在！'
          activetailAction()
          break

        case 'listening':
          // 正在聆听
          this.statusText = '在听...'
          break

        case 'processing':
          // 正在处理
          this.statusText = '正在思考...'
          break

        case 'speaking':
          // 正在说话
          if (data?.response) {
            this.addMessage(data.response, 'ai')
          }
          activeheadAction()
          break

        case 'idle':
          // 空闲状态
          this.statusText = '空闲中...'
          break

        case 'goodbye':
          // 告别状态
          this.statusText = '再见！'
          setTimeout(() => {
        reset();
      }, 2000);
      break;

        default:
          console.log('未知状态:', state)
          break
      }
    },

    // 添加消息
    addMessage(text, sender) {
      if (!text) return
      this.messages.push({
        text,
        sender,
        timestamp: new Date()
      })
    },

    // 发送消息
    sendMessage() {
      // 检查输入和连接状态
      if (!this.inputMessage.trim() || !this.isConnected) {
        return
      }

      // 添加用户消息
      const userMessage = this.inputMessage
      this.addMessage(userMessage, 'user')
      this.inputMessage = ''

      // 发送消息到服务器
      try {
        const messageData = {
          type: 'user_input',
          content: userMessage,
          timestamp: new Date().toISOString()
        }
        this.wsConnection.send(JSON.stringify(messageData))
      } catch (error) {
        console.error('发送消息失败:', error)
        this.addMessage('发送消息失败', 'system')
      }
    },

    // 获取当前状态
    getCurrentState() {
      if (this.wsConnection && this.isConnected) {
        const stateRequest = { type: 'get_state' }
        this.wsConnection.send(JSON.stringify(stateRequest))
      }
    },

    // 发送心跳
    sendHeartbeat() {
      if (this.wsConnection && this.isConnected) {
        this.wsConnection.send(JSON.stringify({ type: 'ping' }))
      }
    },

    // 断开连接
    disconnect() {
      if (this.wsConnection) {
        this.wsConnection.close()
        this.wsConnection = null
        this.isConnected = false
        this.connectionStatus = 'disconnected'
        reset();
      }
    }
  }
})
