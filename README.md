# LLM与蜜罐日志可视化系统

一个用于监控和分析大型语言模型(LLM)请求和蜜罐活动的可视化平台。系统从Elasticsearch收集日志数据，并提供直观的图表和分析功能。

## 项目概述

本系统旨在帮助安全分析师和开发人员监控和分析：
- LLM服务的使用情况和性能指标
- 蜜罐系统检测到的可疑活动和攻击尝试

系统通过直观的图表和详细的日志查询功能，帮助用户快速识别异常行为和潜在的安全威胁。

## 主要功能

### 仪表盘概览
- 系统整体情况概览
- LLM请求和蜜罐活动的关键指标统计
- 时间趋势图表展示
- 日志级别分布、请求类型分布等统计图表

### 蜜罐日志分析
- 蜜罐捕获的攻击尝试详细日志
- 可疑IP地址统计和分析
- 日志级别分布图表
- 支持时间范围筛选和关键词搜索

### LLM请求日志
- LLM模型使用情况统计
- 请求类型分布分析
- 详细的请求与响应内容查看
- 支持时间范围筛选和关键词搜索

## 技术栈

- **前端**：React、Ant Design、ECharts
- **后端**：Node.js、Express
- **数据存储**：Elasticsearch
- **构建工具**：Webpack

## 数据来源

系统数据来自于以下Elasticsearch索引：
- `llm-logs` - 存储LLM请求和响应的日志
- `honeypot-logs` - 存储蜜罐活动的日志

## 安装部署

### 环境要求
- Node.js 16+
- 已配置的Elasticsearch实例 (7.x或更高版本)

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/llm-honeypot-dashboard.git
cd llm-honeypot-dashboard
```

2. 安装依赖
```bash
npm install
```

3. 配置Elasticsearch连接
在`src/services/elasticService.js`中修改Elasticsearch配置：
```javascript
const elasticConfig = {
  baseUrl: 'http://localhost:3001/api/elasticsearch',
  elkUrl: 'your-elasticsearch-host:9200',
  username: 'your-username',
  password: 'your-password',
  honeypotIndex: 'honeypot-logs*',
  llmIndex: 'llm-logs*'
};
```

4. 启动开发服务器
```bash
npm run dev
```

5. 构建生产版本
```bash
npm run build
```

## 使用方法

1. 访问系统首页，默认显示系统介绍和总体仪表盘
2. 使用左侧导航菜单切换不同功能页面
3. 使用时间选择器选择特定时间范围的数据
4. 在日志页面使用搜索框进行关键词筛选
5. 点击日志条目可展开查看详细信息

## 开发说明

### 项目结构
```
llm-honeypot-dashboard/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── components/      # 通用组件
│   │   ├── charts/      # 图表组件
│   │   └── common/      # 通用UI组件
│   ├── pages/           # 页面组件
│   │   ├── dashboard/   # 仪表盘页面
│   │   ├── honeypot/    # 蜜罐日志页面
│   │   └── llm/         # LLM日志页面
│   ├── services/        # 数据服务
│   ├── App.js           # 应用入口
│   └── index.js         # 渲染入口
├── server.js            # 代理服务器
├── webpack.config.js    # Webpack配置
└── package.json         # 项目依赖
```

### 开发规范
- 遵循React函数式组件和Hooks编程风格
- 使用Ant Design组件库进行UI开发
- 使用ECharts进行数据可视化
- 保持代码简洁、注释清晰

## 许可证

MIT 