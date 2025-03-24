# 构建阶段
FROM node:16-alpine as build

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制所有源代码
COPY . .

# 构建前端应用
RUN npm run build

# 运行阶段
FROM node:16-alpine

WORKDIR /app

# 复制依赖相关文件
COPY package*.json ./
# 只安装生产环境依赖
RUN npm install --only=production

# 复制后端服务器代码和构建好的前端文件
COPY server.js ./
COPY --from=build /app/dist ./dist

# 设置环境变量
ENV NODE_ENV=production \
    PORT=3001 \
    ELASTIC_URL=http://10.255.248.65:9200 \
    ELASTIC_USERNAME=elastic \
    ELASTIC_PASSWORD=H3JIfzF2Ic*dbRj4c5Kd

# 暴露服务器端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { hostname: 'localhost', port: 3001, path: '/api/health', timeout: 2000 }; const req = http.get(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1));"

# 启动后端服务器
CMD ["node", "server.js"] 