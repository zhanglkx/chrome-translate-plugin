# 🧪 快速诊断指南

## 如何检查 API Key 设置是否正常

### 方法 1️⃣：通过插件界面测试（推荐）

1. **打开插件设置**
   - 点击 Chrome 中的扩展图标
   - 找到"ARI 划词翻译"插件

2. **输入 API Key**
   - 在输入框中粘贴你的 DeepSeek API Key
   - 点击"保存设置"

3. **运行测试**
   - 点击"测试翻译"按钮
   - **成功**: 看到 `✓ 测试成功！翻译: ...`
   - **失败**: 看到 `❌ 测试失败 ...` 并显示具体错误

---

### 方法 2️⃣：通过浏览器控制台调试

1. **打开 Service Worker 控制台**
   ```
   Chrome 地址栏输入: chrome://extensions/
   ↓
   找到本插件 → 点击"Service Workers"下的"Inspect views"链接
   ↓
   在打开的控制台中复制下面的命令
   ```

2. **检查 API Key 是否保存**
   ```javascript
   // 在控制台中运行这段代码
   chrome.storage.local.get(['apiKey'], (result) => {
     console.log('API Key:', result.apiKey ? `✓ 已设置 (${result.apiKey.length} 字符)` : '❌ 未设置');
   });
   ```
   
   **预期输出**:
   - `✓ API Key已设置 (64 字符)` - 说明保存成功
   - `❌ API Key未设置` - 说明未保存或已删除

3. **检查其他设置**
   ```javascript
   chrome.storage.local.get(['enableCache', 'enableDictionary'], (result) => {
     console.log('用户设置:',{
       缓存: result.enableCache !== false ? '✓ 启用' : '❌ 禁用',
       词典: result.enableDictionary !== false ? '✓ 启用' : '❌ 禁用'
     });
   });
   ```

4. **检查缓存数据**
   ```javascript
   chrome.storage.local.get(['translationCache'], (result) => {
     const cache = result.translationCache || {};
     console.log(`缓存记录: ${Object.keys(cache).length} 条`);
     console.log('缓存示例:', Object.keys(cache).slice(0, 3));
   });
   ```

---

### 方法 3️⃣：通过实际翻译测试

1. **使用网页翻译**
   - 任意打开一个网站（如 Wikipedia）
   - 选中一个英文单词：`Hello`
   - **成功**: 应显示翻译弹窗
   - **失败**: 无反应或显示错误消息

2. **查看后台日志**
   - 按 `F12` 打开控制台
   - 尝试翻译
   - 查看是否显示以下日志顺序:
     ```
     📤 发送翻译请求到 DeepSeek API...
     📥 API 响应状态: 200
     ✓ 翻译成功: [翻译结果]
     ```

---

## 🚨 常见问题排查

### ❌ "API key 未设置"

**检查步骤**:
1. 确认 API Key 已粘贴到输入框
2. 点击"保存设置"
3. 刷新页面，检查输入框是否仍有值

```javascript
// 控制台验证
chrome.storage.local.get(['apiKey'], console.log);
```

### ❌ "API错误 401"

**原因**: API Key 无效或过期  
**解决**:
1. 访问 https://platform.deepseek.com/api_keys
2. 检查 API Key 是否仍然有效
3. 复制完整的 API Key（不要有多余空格）
4. 重新保存设置并测试

### ❌ "API错误 429"

**原因**: 请求过于频繁，触发速率限制  
**解决**:
1. 等待 1-2 分钟
2. 禁用缓存后再试（会调用 API，可验证是否为限制问题）

### ❌ "API返回格式异常"

**原因**: DeepSeek API 响应格式不符合预期  
**解决**:
1. 检查 API 是否在线：https://status.deepseek.com
2. 进 https://platform.deepseek.com/playground 测试 API
3. 尝试调整模型参数

### ❌ "Fetch failed"

**原因**: 网络连接问题  
**解决**:
1. 检查网络连接
2. 禁用 VPN 或代理测试
3. 检查是否使用了代理（部分公司网络）

---

## 📝 重置插件并重新配置

如果插件出现问题，可以重置：

```javascript
// 在 Service Worker 控制台运行以下代码清除所有数据
chrome.storage.local.clear(() => {
  console.log('✓ 所有数据已清空');
});

// 然后卸载并重新安装插件
// chrome://extensions/ → 删除插件 → 重新加载
```

---

## ✅ 验证成功的标志

当一切设置正确时，你应该看到：

✓ 设置界面显示您的 API Key（首 10 个字符）  
✓ "测试翻译"按钮返回成功结果  
✓ 在网页上选中文本时立即显示翻译  
✓ 浏览器控制台显示详细的操作日志  
✓ 缓存数据在 localStorage 中越来越多  

---

**需要帮助?** 检查浏览器控制台中的错误信息，通常会显示具体的问题原因。
