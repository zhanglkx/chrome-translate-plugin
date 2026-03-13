// content.js - 非侵入式翻译界面 (划词→小点→点击翻译)
let translationPopup = null;
let popupTimeout = null;
let indicatorDot = null;
let pendingTranslation = null; // 存储待翻译的文本信息

// 创建小点指示符
function createIndicatorDot() {
  if (indicatorDot) {
    indicatorDot.remove();
  }
  
  indicatorDot = document.createElement('div');
  indicatorDot.id = 'translation-indicator';
  indicatorDot.style.cssText = `
    position: fixed;
    width: 12px;
    height: 12px;
    background: linear-gradient(135deg, #4CAF50, #45a049);
    border-radius: 50%;
    cursor: pointer;
    z-index: 999998;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.35);
    transition: all 0.2s ease;
    display: none;
  `;
  
  // 悬停效果
  indicatorDot.addEventListener('mouseover', () => {
    indicatorDot.style.transform = 'scale(1.3)';
    indicatorDot.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.5)';
  });
  
  indicatorDot.addEventListener('mouseout', () => {
    indicatorDot.style.transform = 'scale(1)';
    indicatorDot.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.35)';
  });
  
  // 点击事件 - 发送翻译请求（带重试机制）
  indicatorDot.addEventListener('click', async (e) => {
    e.stopPropagation();
    
    if (!pendingTranslation) {
      console.log('❌ 没有待翻译的文本');
      return;
    }
    
    console.log('🎯 点击翻译小点，发送翻译请求');
    
    const { text, position } = pendingTranslation;
    let retryCount = 0;
    const maxRetries = 3;
    
    // 带重试的消息发送
    const sendTranslationRequest = () => {
      try {
        // 验证 chrome.runtime 是否可用
        if (!chrome || !chrome.runtime) {
          console.error('❌ Chrome Runtime 不可用');
          showTranslation(text, '❌ 扩展程序上下文失效，请刷新页面', position);
          return;
        }
        
        console.log(`📤 发送翻译请求 (尝试 ${retryCount + 1}/${maxRetries})`);
        
        chrome.runtime.sendMessage({
          type: 'TRANSLATE_REQUEST',
          text: text,
          position: position
        }, (response) => {
          console.log('📥 background 响应:', response);
          
          // 检查上下文是否失效
          if (chrome.runtime.lastError) {
            const errorMsg = chrome.runtime.lastError.message;
            console.error('❌ 消息错误:', errorMsg);
            
            // 如果是 context invalidated，尝试重试
            if (errorMsg.includes('context invalidated') && retryCount < maxRetries) {
              retryCount++;
              console.log(`⏳ Context 失效，${500}ms 后重试...`);
              setTimeout(sendTranslationRequest, 500);
              return;
            }
            
            // 重试次数已尽
            showTranslation(text, `❌ 通信失败: ${errorMsg}`, position);
            return;
          }
          
          if (!response) {
            console.error('❌ 收到空响应');
            showTranslation(text, '❌ 无响应，请稍后重试', position);
            return;
          }
          
          // 验证响应格式
          if (typeof response !== 'object' || !('translation' in response)) {
            console.error('❌ 响应格式错误:', response);
            showTranslation(text, '❌ 返回格式错误', position);
            return;
          }
          
          if (response.translation) {
            console.log('✓ 成功显示翻译');
            showTranslation(text, response.translation, response.position || position);
            hideIndicatorDot(); // 隐藏小点
          } else {
            console.error('❌ 获取翻译为空:', response);
            showTranslation(text, '❌ 获取翻译失败', position);
          }
        });
      } catch (error) {
        console.error('❌ 发送消息异常:', error);
        
        // 重试机制
        if (retryCount < maxRetries && error.message.includes('context')) {
          retryCount++;
          console.log(`⏳ 异常类型需要重试，${500}ms 后重试...`);
          setTimeout(sendTranslationRequest, 500);
          return;
        }
        
        showTranslation(text, `❌ 通信异常: ${error.message}`, position);
      }
    };
    
    // 启动消息发送
    sendTranslationRequest();
  });
  
  document.body.appendChild(indicatorDot);
}

// 显示指示符小点
function showIndicatorDot(position) {
  if (!indicatorDot) {
    createIndicatorDot();
  }
  
  indicatorDot.style.left = `${position.x - 6}px`;
  indicatorDot.style.top = `${position.y - 6}px`;
  indicatorDot.style.display = 'block';
  
  console.log(`✨ 显示翻译小点 @ (${position.x}, ${position.y})`);
}

// 隐藏指示符小点
function hideIndicatorDot() {
  if (indicatorDot) {
    indicatorDot.style.display = 'none';
  }
  pendingTranslation = null;
}

// 创建翻译弹出框
function createTranslationPopup() {
  if (translationPopup) {
    translationPopup.remove();
  }
  
  translationPopup = document.createElement('div');
  translationPopup.id = 'translation-popup';
  translationPopup.style.cssText = `
    position: fixed;
    background: white;
    border: 2px solid #4CAF50;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    z-index: 999999;
    max-width: 320px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: none;
    animation: slideIn 0.3s ease-out;
  `;
  
  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    #translation-popup button:hover {
      background: #e8e8e8 !important;
    }
    
    #translation-popup button:active {
      transform: scale(0.98);
    }
  `;
  document.head.appendChild(style);
  
  translationPopup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
      <div style="flex: 1;">
        <span style="display: inline-block; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">翻译结果</span>
      </div>
      <button id="close-popup" style="background: none; border: none; cursor: pointer; font-size: 18px; color: #999; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">×</button>
    </div>
    <div id="original-text" style="font-size: 12px; color: #888; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;"></div>
    <div id="translated-text" style="font-size: 15px; color: #333; line-height: 1.5; margin-bottom: 12px;"></div>
    <div style="display: flex; gap: 8px;">
      <button id="copy-btn" style="flex: 1; padding: 8px; background: #f5f5f5; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; color: #666; transition: all 0.2s;">复制翻译</button>
      <button id="speak-btn" style="flex: 1; padding: 8px; background: #f5f5f5; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; color: #666; transition: all 0.2s;">朗读</button>
    </div>
  `;
  
  document.body.appendChild(translationPopup);
  
  // 事件监听
  document.getElementById('close-popup').addEventListener('click', () => {
    translationPopup.style.display = 'none';
  });
  
  document.getElementById('copy-btn').addEventListener('click', () => {
    const translatedText = document.getElementById('translated-text').textContent;
    navigator.clipboard.writeText(translatedText).then(() => {
      const btn = document.getElementById('copy-btn');
      const originalText = btn.textContent;
      btn.textContent = '已复制 ✓';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  });
  
  document.getElementById('speak-btn').addEventListener('click', () => {
    const translatedText = document.getElementById('translated-text').textContent;
    speakText(translatedText);
  });
}

// 朗读文本
function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 检测语言（简单判断）
    const hasChinese = /[\u4e00-\u9fff]/.test(text);
    utterance.lang = hasChinese ? 'zh-CN' : 'en-US';
    
    window.speechSynthesis.speak(utterance);
  }
}

// 显示翻译结果
function showTranslation(text, translation, position) {
  if (!translationPopup) {
    createTranslationPopup();
  }
  
  document.getElementById('original-text').textContent = `原文: ${text}`;
  document.getElementById('translated-text').textContent = translation;
  
  // 弹窗位置优化：避免超出屏幕
  let left = position.x + 15;
  let top = position.y - translationPopup.offsetHeight - 15;
  
  // 确保不超出右边界
  const maxLeft = window.innerWidth - 340;
  if (left > maxLeft) {
    left = maxLeft;
  }
  
  // 确保不超出上边界
  if (top < 10) {
    top = position.y + 15;
  }
  
  translationPopup.style.left = `${left}px`;
  translationPopup.style.top = `${top}px`;
  translationPopup.style.display = 'block';
  
  console.log('✓ 翻译弹窗已显示:', translation);
  
  // 自动隐藏
  clearTimeout(popupTimeout);
  popupTimeout = setTimeout(() => {
    translationPopup.style.display = 'none';
  }, translation.startsWith('❌') ? 3000 : 6000);
}

// 监听选中文本 - 显示小点，不直接翻译
document.addEventListener('mouseup', async (e) => {
  const selection = window.getSelection();
  
  if (selection.toString().trim()) {
    const text = selection.toString().trim();
    
    console.log('📝 用户选中文本:', text);
    
    // 保存待翻译的文本信息
    pendingTranslation = {
      text: text,
      position: { x: e.clientX, y: e.clientY }
    };
    
    // 显示小点，等待用户点击
    showIndicatorDot({ x: e.clientX, y: e.clientY });
  } else {
    // 没有选中文本，隐藏小点
    hideIndicatorDot();
  }
});

// 点击页面其他地方隐藏小点
document.addEventListener('click', (e) => {
  if (e.target !== indicatorDot && !e.target.closest('#translation-popup')) {
    hideIndicatorDot();
  }
});

// 键盘事件：ESC 关闭弹窗
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (translationPopup && translationPopup.style.display !== 'none') {
      translationPopup.style.display = 'none';
    }
    hideIndicatorDot();
  }
});

// 命令触发翻译（快捷键）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRIGGER_TRANSLATION') {
    const selection = window.getSelection();
    if (selection.toString().trim()) {
      const text = selection.toString().trim();
      
      // 快捷键直接翻译，不显示小点
      chrome.runtime.sendMessage({
        type: 'TRANSLATE_REQUEST',
        text: text,
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      }, (response) => {
        if (response && response.translation) {
          showTranslation(text, response.translation, response.position || { x: window.innerWidth / 2, y: window.innerHeight / 2 });
        }
      });
    }
  }
});

// 初始化
console.log('✓ ARI 划词翻译 Content Script 已加载 (非侵入式模式)');
