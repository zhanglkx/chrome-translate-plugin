# 🆘 DeepSeek 翻译插件 - 问题排查速查卡

**打印此文档！** 保存为参考卡

---

## ⚡ 3 秒诊断

问题发生时，按顺序检查：

```
1. 插件是否启用?
   → chrome://extensions/ 查找插件，确认已启用

2. API Key 是否设置?
   → 打开插件 → 输入框中有内容?

3. 是否点击了保存?
   → 点击"保存设置" → 应看到 "✓ 设置已保存"

4. 测试能否成功?
   → 点击"测试翻译" → 应显示成功消息
```

---

## 🎯 快速修复表

| 问题 | 症状 | 速查 |
|------|------|------|
| **API Key 未设置** | 弹窗显示"❌ 请先配置" | 复制 API Key 并保存 |
| **API Key 无效** | 测试显示"❌ 401" | 去 deepseek.com 验证 key |
| **网络问题** | 显示"❌ fetch failed" | 检查网络/禁用 VPN |
| **API 限速** | 显示"❌ 429" | 等待 1-2 分钟 |
| **没有翻译弹窗** | 选中文字无反应 | 检查 chrome://extensions 中插件是否启用 |

---

## 🔧 常用命令

### 在 Service Worker 控制台运行

**查看 API Key**:
```javascript
chrome.storage.local.get(['apiKey'], r => console.log(r.apiKey || '❌ 未设置'));
```

**查看所有设置**:
```javascript
chrome.storage.local.get(null, console.log);
```

**清空所有数据**:
```javascript
chrome.storage.local.clear(); console.log('✓ 已清空');
```

---

## 📍 关键位置

| 需要的东西 | 在哪里找 |
|-----------|---------|
| 插件管理 | `chrome://extensions/` |
| Service Worker 控制台 | 扩展页面 → 插件 → "Inspect views" |
| 浏览器控制台 | 按 F12 |
| API Key | https://platform.deepseek.com/api_keys |
| 文档 | 项目文件夹中的 .md 文件 |

---

## ✅ 验证清单

- [ ] 插件已启用
- [ ] API Key 页面已打开
- [ ] API Key 已复制
- [ ] API Key 已粘贴到设置
- [ ] 点击了"保存设置"
- [ ] 看到"✓ 设置已保存"
- [ ] 点击了"测试翻译"
- [ ] 看到测试成功消息
- [ ] 在网页上选中文字
- [ ] 看到翻译弹窗

## 🆘 仍有问题?

1. **查看浏览器控制台** - 按 F12，Console 选项卡中有错误吗?
2. **查看 Service Worker 日志** - chrome://extensions → "Inspect views"
3. **重新加载插件** - chrome://extensions → 禁用后重新启用
4. **完全重置** - 卸载后删除所有数据，然后重新加载

---

## 📞 获取帮助

1. **查看文档**:
   - `API_KEY_FIXES.md` - 技术细节
   - `QUICK_TEST.md` - 诊断指南
   - `VERIFY_CHECKLIST.md` - 完整清单

2. **检查错误信息**:
   - 浏览器控制台中看到什么错误?
   - 插件发出什么提示?

3. **最后手段**:
   - 完全卸载插件
   - 删除所有数据
   - 重新安装

---

**最后更新**: 2026-03-13  
**插件版本**: 2.0 ✅ 生产就绪
