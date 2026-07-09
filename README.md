 # 🦊 Robot Agent Vue — 数字人 3D 交互前端

 > **基于 Vue 3 + Three.js + WebSocket 的数字人交互页面**，与数字人后端连接，实现 3D 模型驱动、语音唤醒与实时对话。

 ## 项目概述

 一个 3D 数字人（「小狸」小狐狸）的前端交互界面。项目启动后自动加载 3D 模型并尝试连接后端 WebSocket 服务，连接成功后即可通过语音或文本与数字人进行对话。小狐狸会根据对话状态做出摇尾巴、挥手、摆手等生动动作。

 ## 技术栈

 | 层级 | 技术 |
 |------|------|
 | **前端框架** | Vue 3 (Composition API) |
 | **构建工具** | Vite |
 | **3D 渲染** | Three.js (GLTF 模型) |
 | **状态管理** | Pinia |
 | **通信协议** | WebSocket |
 | **音频输入** | 浏览器麦克风 API |

 ## 功能特性

 - **3D 数字人模型**：加载 GLB 格式的小狐狸模型，支持骨骼动画
 - **WebSocket 实时通信**：与数字人后端保持长连接，支持心跳保活
 - **语音唤醒与对话**：通过麦克风监听语音，检测唤醒词后唤醒数字人开始对话
 - **动作反馈**：
   - 连接成功 → 摇尾巴
   - 唤醒成功 → 挥手
   - 回复问题 → 摆手
   - 告别 → 挥手说再见
 - **聊天界面**：对话气泡展示用户与 AI 的交流内容
 - **连接状态指示**：实时显示 WebSocket 连接状态
 - **文字输入兜底**：除语音外也支持文本消息发送

 ## 交互流程

 1. 页面加载 → 自动加载 3D 模型并连接后端
 2. 连接成功 → 小狐狸摇尾巴，开始监听麦克风
 3. 用户说出唤醒词（如「你好小狐狸」）→ 小狐狸挥手，进入对话状态
 4. 用户提问 → 小狐狸处理并回复，回复时摆手
 5. 用户说「再见」→ 小狐狸挥手告别，回到待唤醒状态

 ## 快速开始

 ```bash
 npm install
 npm run dev
 ```

 默认运行在 `http://localhost:5173`

 > 需要同时运行配套的数字人后端服务（WebSocket 端口 8000）才能实现完整交互。

 ## 项目结构

 ```
 robot-agent-vue/
 ├── src/
 │   ├── App.vue               # 主页面布局
 │   ├── main.js               # 入口
 │   ├── index.js              # Three.js 场景初始化
 │   ├── model.js              # 3D 模型加载与骨骼动画控制
 │   ├── components/
 │   │   ├── Model.vue         # 3D 模型渲染容器
 │   │   └── ChatBox.vue       # 聊天对话界面
 │   ├── stores/
 │   │   └── chatStore.js      # WebSocket + 对话状态管理
 │   └── assets/
 │       └── public/
 │           └── 模型.glb      # 小狐狸 3D 模型文件
 └── package.json
 ```

 ## 后端 API 参考

 | 端点 | 方法 | 说明 |
 |------|------|------|
 | `ws://localhost:8000/ws/conversation` | WebSocket | 对话通信 |
 | `POST /control/start` | HTTP | 启动麦克风监听 |
 | `POST /control/stop` | HTTP | 停止麦克风监听 |
 | `POST /messages/clear` | HTTP | 清空对话历史 |
 | `GET /state` | HTTP | 查询当前状态 |
