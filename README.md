# ARI 划词翻译插件

一个使用DeepSeek API的Chrome划词翻译插件，支持本地词典缓存和智能翻译策略。

## 功能特点

- ✅ 划词翻译：选中文字自动翻译
- ✅ 本地词典：简单单词直接查词典，无需API调用
- ✅ 智能缓存：自动缓存翻译结果，减少API调用
- ✅ 快速响应：非深度思考模型，降低延迟
- ✅ 轻量UI：最小化网页侵入
- ✅ 配置选项：可自定义API Key和缓存设置

## 安装方法

1. 下载本插件文件夹
2. 在Chrome中打开 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本插件文件夹

## 使用方法

1. 在网页上选中要翻译的文字
2. 翻译结果会自动显示在鼠标附近
3. 可通过右键菜单或快捷键 `Ctrl+Shift+Y` 触发翻译
4. 在插件图标中配置API Key和设置

## 技术架构

- **Manifest V3**：最新Chrome插件规范
- **DeepSeek API**：使用chatglm-3-turbo模型
- **本地缓存**：localStorage存储翻译结果
- **智能策略**：简单单词查词典，复杂文本调用API

## 配置说明

- **API Key**：在插件设置中输入您的DeepSeek API Key
- **启用缓存**：开启后自动缓存翻译结果
- **启用词典**：开启后简单单词直接查词典

## 开发说明

### 文件结构

```
chrome-translate-plugin/
├── manifest.json          # 插件配置
├── background.js         # 后台逻辑
├── content.js           # 划词检测
├── popup.html           # 弹出界面
├── popup.js             # 弹出逻辑
├── styles.css           # 样式文件
├── dictionary/          # 词库文件
│   └── words.json       # 本地词典
├── cache/               # 缓存数据
└── utils/               # 工具函数
    ├── cacheManager.js  # 缓存管理
    └── dictionary.js   # 词库查询
```

### 核心功能

#### 划词检测
```javascript
document.addEventListener('mouseup', async (e) => {
  const selection = window.getSelection();
  if (selection.toString().trim()) {
    // 发送翻译请求
  }
});
```

#### 智能翻译策略
```javascript
async function smartTranslate(text) {
  if (dictionary.isSimpleWord(text)) {
    return dictionary.lookup(text);
  }
  return await translateWithDeepSeek(text);
}
```

#### 缓存管理
```javascript
class CacheManager {
  async get(key) { /* 获取缓存 */ }
  async set(key, data) { /* 设置缓存 */ }
}
```

## 性能优化

- **API优化**：非深度思考模型，temperature=0.3
- **缓存策略**：24小时过期，LRU算法
- **词典优化**：简单单词直接查询
- **UI优化**：轻量级DOM，自动隐藏

## 注意事项

- 需要有效的DeepSeek API Key
- 网络连接正常才能使用翻译功能
- 本地词典仅支持基础单词，复杂翻译需要API

## 贡献

欢迎提交Issue和Pull Request来改进此插件。