# static server via node

描述：这是用node搭建的静态服务器

## 启动

### 面向用户

1. 全局安装
```
yarn global add static-server-via-node
```

2. 命令行进入需要设置静态服务的根路径
```
cd public
```

3. 启动服务
```
static
```

支持配置自己想运行的目录

```
static public // 当前目录下的public文件夹
```

支持配置自己自定义的端口号

```
static -p 8080
// or
static --port 8080
```

更多内容可以输入命令 `static -h`了解

### 面向开发者

1. clone project
```
git clone https://github.com/adnabb/static-server-via-node.git
```

2. 全局安装 typescipt
```
yarn global add typescript
```

3. 全局安装 ts-node-dev
```
yarn global add ts-node-dev
```

4. 安装项目依赖
```
yarn
// 或
yarn install
```

5. 启动
```
yarn start
```