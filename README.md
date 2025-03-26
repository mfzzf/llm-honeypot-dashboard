# LLM蜜罐日志可视化系统技术文档

## 1. 项目概述

LLM蜜罐日志可视化系统是一个用于监控和分析蜜罐系统与LLM（大型语言模型）服务日志的Web应用程序。系统通过可视化方式展示蜜罐攻击数据和LLM使用情况，同时提供GPU资源监控功能。

## 2. 系统架构

### 2.1 前端架构

- **框架**：React 19.0.0
- **UI库**：Ant Design 5.24.4
- **路由**：React Router Dom 7.4.0
- **图表库**：
  - ECharts 5.6.0
  - ECharts-for-React 3.0.3
  - @ant-design/charts 2.2.7
- **HTTP客户端**：Axios 1.8.4
- **日期处理**：Moment 2.30.1

### 2.2 后端架构

- **服务器**：Express 4.21.2
- **中间件**：
  - CORS 2.8.5
  - Body Parser 1.20.3
- **数据源**：
  - Elasticsearch 8.17.1（存储日志数据）
  - NVIDIA GPU Metrics Exporter（监控GPU状态）

### 2.3 构建工具

- **打包工具**：Webpack 5.98.0
- **转译器**：Babel 7.26.10
- **开发服务器**：Webpack Dev Server 5.2.0

## 3. 数据流

```
用户界面 <-> 前端服务层 <-> Express代理服务器 <-> Elasticsearch/GPU Metrics
```

## 4. 主要功能模块

### 4.1 仪表盘模块

- 系统介绍页面
- 数据统计概览
- 时间序列图表展示蜜罐访问和LLM请求趋势
- 日志级别分布图
- LLM请求类型分布图
- 蜜罐IP访问统计图
- LLM模型使用统计图

### 4.2 蜜罐日志模块

- 蜜罐日志查询和展示
- 过滤和搜索功能
- 日志详情查看

### 4.3 LLM日志模块

- LLM请求日志查询和展示
- 按模型、状态等条件过滤
- 请求详情查看

### 4.4 GPU监控模块

- 实时GPU使用情况监控
- 多GPU支持
- 关键指标展示：
  - GPU温度
  - 内存使用情况（总量、已用、可用）
  - 功耗数据（当前功耗、功耗限制）
  - 利用率（GPU计算利用率、显存利用率）

## 5. 核心服务层

### 5.1 Elasticsearch服务

- `elasticService.js`提供与Elasticsearch交互的功能：
  - 获取蜜罐和LLM日志
  - 聚合分析生成统计信息
  - 支持时间范围查询和过滤

### 5.2 可视化服务

- `visualizationService.js`处理数据转换和可视化准备：
  - 处理时间序列数据
  - 生成各类统计图表所需数据格式
  - 数据预处理和规范化

### 5.3 GPU监控服务

- `gpuService.js`管理GPU监控：
  - 从NVIDIA GPU Metrics Exporter获取原始指标
  - 解析Prometheus格式的GPU指标数据
  - 提取关键性能参数

## 6. 代理服务器

Express代理服务器（server.js）处理：
- 跨域资源共享问题
- Elasticsearch API安全访问
- GPU指标收集
- 请求路由和转发

## 7. 数据模型

### 7.1 蜜罐日志数据

蜜罐日志存储在Elasticsearch的`honeypot-logs*`索引中，主要字段包括：
- 时间戳
- 远程地址
- 日志级别
- 事件类型
- 协议
- 路径
- 用户名
- 类型

### 7.2 LLM日志数据

LLM日志存储在Elasticsearch的`llm-logs*`索引中，主要字段包括：
- 时间戳
- 模型名称
- 请求状态
- 响应时间
- 请求内容
- 响应内容

## 8. 开发和部署

### 8.1 开发环境

- **开发命令**：`npm run dev`（同时启动前端和后端）
  - 前端：`npm run start`（Webpack开发服务器）
  - 后端：`npm run server`（Node.js Express服务器）

### 8.2 构建和生产环境

- **构建命令**：`npm run build`（生成生产环境静态文件）
- **服务启动**：`npm run server`（启动生产环境服务器）

### 8.3 容器化支持

- 项目包含Docker配置文件：
  - `.dockerignore`：排除不需要的文件
  - Webpack配置适配容器环境

## 9. 安全配置

- 使用代理服务器避免直接在前端暴露Elasticsearch凭证
- API请求认证和鉴权
- 数据传输加密

## 10. 系统配置

### 10.1 Elasticsearch配置

```javascript
// Elasticsearch配置
const elasticConfig = {
  node: 'http://10.255.248.65:9200',
  auth: {
    username: 'elastic',
    password: 'H3JIfzF2Ic*dbRj4c5Kd'
  },
  indices: {
    honeypot: 'honeypot-logs*',
    llm: 'llm-logs*'
  }
};
```

### 10.2 GPU监控配置

```javascript
// GPU 监控配置
const gpuConfig = {
  metricsUrl: 'http://10.255.248.65:9835/metrics'
};
```

## 11. 前端路由结构

- `/` - 重定向到仪表板
- `/dashboard` - 系统仪表板
- `/honeypot-logs` - 蜜罐日志查询
- `/llm-logs` - LLM日志查询
- `/gpu-metrics` - GPU监控

## 12. 项目依赖关系

前端项目主要依赖于：
- 核心库：React、React DOM、React Router
- UI组件：Ant Design
- 图表库：ECharts、Ant Design Charts
- 数据处理：Axios、Moment

后端项目主要依赖于：
- 服务器：Express
- Elasticsearch客户端
- 中间件：CORS、Body Parser

## 13. 总结

LLM蜜罐日志可视化系统是一个现代化的Web应用，结合了前端React框架和后端Express服务，通过Elasticsearch进行数据存储和分析，并提供GPU监控功能。系统采用了组件化设计，清晰的服务层结构，使得数据的收集、处理和可视化变得高效而直观。
