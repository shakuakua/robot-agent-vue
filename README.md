 # 🦊 Robot Agent Vue — 数字人 3D 交互前端

 > **基于 Vue 3 + Three.js 的数字人前端 + Python FastAPI + WebSocket 后端**。与数字人后端连接，实现 3D 模型驱动、语音唤醒、实时对话与动作反馈。

 ## 项目概述

 一套完整的数字人对话系统。前端加载 3D 小狐狸模型（Three.js），通过 WebSocket 连接 Python 后端。用户通过语音或文字与数字人交互，后端基于大语言模型（Qwen）进行对话管理，驱动小狐狸做出摇尾巴、挥手、摆手等生动动作。

 ## 技术栈

 | 层级 | 技术 |
 |------|------|
 | **前端框架** | Vue 3 (Composition API) + Vite + Pinia |
 | **3D 渲染** | Three.js (GLTF 模型 + 骨骼动画) |
 | **后端框架** | Python FastAPI + Uvicorn + WebSocket |
 | **语音识别 (ASR)** | DashScope paraformer-realtime-v1 + VAD 静音检测 |
 | **语音合成 (TTS)** | DashScope qwen3-tts-flash |
 | **大语言模型** | Qwen (qwen-max / qwen-omni-flash) via OpenAI API |
 | **音频处理** | AlsaRecorder / AlsaPlayer（跨平台支持） |
 | **MCP 扩展** | MCP 协议支持外部工具调用 |

 ## 功能特性

 ### 前端（本仓库）
 - **3D 数字人模型**：GLB 小狐狸模型，支持骨骼动画
 - **状态驱动的动作反馈**：
   - 连接成功 → 摇尾巴
   - 唤醒成功 → 挥手（5 秒后恢复摇头待机）
   - 对话中 → 摆手
   - 告别 → 挥手 + 说再见
 - **WebSocket 实时通信**：心跳保活、状态同步
 - **语音唤醒与对话**：通过麦克风监听，检测唤醒词后开始对话
 - **文字输入兜底**：支持文字消息发送
 - **聊天界面**：对话气泡展示 + 连接状态指示

 ### 后端（[ZJR-FZD/srp_backend](https://github.com/ZJR-FZD/srp_backend)）
 - **FastAPI WebSocket 服务**：端口 8000，`/ws/conversation` 端点
 - **唤醒词系统**：支持「你好小狐狸」「小狐狸」「hey fox」唤醒
 - **对话状态机**：`waiting_wake → awakened → conversing → idle → goodbye`
 - **VAD 智能语音检测**：自动检测语音开始/结束（0.5 秒静音判定）
 - **语音对话流程**：ASR 识别 → LLM 理解 → 检索增强 → TTS 播报
 - **MCP 工具集成**：支持外部工具调用（如天气查询、信息检索）
 - **任务调度系统**：统一任务队列 + 优先级调度 + 超时重试
 - **永久待机**：对话结束后自动回到唤醒监听状态

 ## 交互流程

 ```
 1. 页面加载 → 加载 3D 模型 + 连接 WebSocket
 2. 连接成功 → 摇尾巴，开始麦克风监听
 3. 用户说「你好小狐狸」→ 唤醒成功，挥手，进入对话
 4. 用户提问 → 后端 ASR → LLM → TTS，小狐狸摆手
 5. 用户说「再见」/ 静默 30 秒 → 告别，回到待唤醒
 6. 循环回到步骤 3
 ```

 ## 快速开始

 ### 后端（[ZJR-FZD/srp_backend](https://github.com/ZJR-FZD/srp_backend)）
 ```bash
 git clone https://github.com/ZJR-FZD/srp_backend
 cd srp_backend

 # 安装依赖（推荐 uv）
 pip install -r requirements.txt
 # 或
 uv sync

 # 配置环境变量
 cp .env.example .env
 # 编辑 .env 填入 DASHSCOPE_API_KEY / OPENAI_API_KEY 等

 # 启动后端服务
 python main.py
 # 或
 python api/websocket_server.py
 # 默认 WebSocket 端口 8000
 ```

 ### 前端（本仓库）
 ```bash
 npm install
 npm run dev
 # 默认 http://localhost:5173
 ```

 ## 项目结构

 ```
 robot-agent-vue/              # ← 本仓库（前端）
 ├── src/
 │   ├── App.vue                        # 主页面布局
 │   ├── index.js                       # Three.js 场景初始化
 │   ├── model.js                       # 3D 模型加载与骨骼动画控制
 │   ├── components/
 │   │   ├── Model.vue                  # 3D 模型渲染容器
 │   │   └── ChatBox.vue               # 聊天对话界面
 │   └── stores/chatStore.js           # WebSocket + 对话状态管理
 └── package.json

 srp_backend/                  # ← 后端仓库 (ZJR-FZD/srp_backend)
 ├── main.py                          # 主入口（新架构）
 ├── config.py                        # 全局配置（模型/API/任务参数）
 ├── api/websocket_server.py          # FastAPI WebSocket 服务（端口 8000）
 ├── core/
 │   ├── agent.py                     # RobotAgent 核心（动作注册 + 任务调度）
 │   ├── action/
 │   │   ├── base.py                  # Action 基类
 │   │   ├── listen_action_vad.py     # VAD 语音识别 Action
 │   │   ├── speak_action.py          # TTS 语音合成 Action
 │   │   └── conversation_action_enhanced.py  # 增强版对话 Action
 │   ├── client/openai_client.py      # OpenAI API 统一客户端（Qwen）
 │   ├── server/                      # 通信服务器 + 消息路由 + 任务分发
 │   ├── task/                        # 任务模型 + 队列 + 调度器 + 执行器
 │   └── mcp_control/                 # MCP 协议集成（外部工具调用）
 └── util/audio.py                    # 跨平台音频录制/播放
 ```

 ## API 参考

 ### WebSocket (`ws://localhost:8000/ws/conversation`)
 | 消息类型 | 方向 | 说明 |
 |----------|------|------|
 | `connected` | 服务端→客户端 | 连接成功，包含唤醒词列表和当前状态 |
 | `state_change` | 服务端→客户端 | 状态变化通知（含 user_input / bot_response） |
 | `listening_started/stopped` | 服务端→客户端 | 麦克风监听状态变化 |
 | `messages_cleared` | 服务端→客户端 | 消息已清空 |
 | `ping` | 客户端→服务端 | 心跳请求 |
 | `pong` | 服务端→客户端 | 心跳响应 |
 | `get_state` | 客户端→服务端 | 查询当前状态 |
 | `current_state` | 服务端→客户端 | 当前状态回复 |

 ### HTTP 控制端点
 | 端点 | 方法 | 说明 |
 |------|------|------|
 | `POST /control/start` | HTTP | 启动麦克风监听 |
 | `POST /control/stop` | HTTP | 停止麦克风监听 |
 | `POST /messages/clear` | HTTP | 清空对话历史 |
 | `GET /status` | HTTP | 获取系统运行状态 |
 | `GET /messages` | HTTP | 获取消息列表 |

 ## 对话状态机

 ```
 ┌─────────────┐    唤醒词     ┌──────────┐    用户提问    ┌───────────┐
 │ waiting_wake │ ─────────→  │ awakened  │ ─────────→  │ conversing │
 └─────────────┘              └──────────┘              └───────────┘
       ↑                            │                        │
       │    "再见"                     │  5 秒后自动              │  无语音 30 秒
       │                            ↓                        │
       │                        ┌─────────┐                 │
       └────────────────────────│ goodbye │←────────────────┘
                                └─────────┘
 ```

 ## 环境变量

 ```env
 # API 配置（兼容 OpenAI 格式，推荐阿里云 DashScope）
 OPENAI_API_KEY=your-api-key
 OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

 # DashScope 密钥（ASR / TTS / Reranker）
 DASHSCOPE_API_KEY=your-dashscope-key
 DASHSCOPE_INTL_API_KEY=your-intl-key

 # 通信配置
 COMMUNICATION_HOST=0.0.0.0
 COMMUNICATION_PORT=8080
 MAX_WEBSOCKET_CONNECTIONS=100
 ```
