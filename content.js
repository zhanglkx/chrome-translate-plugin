// content.js - 内容脚本
let translationPopup = null;
let popupTimeout = null;

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
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    max-width: 300px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: none;
  `;
  
  translationPopup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h4 style="margin: 0; font-size: 14px; color: #333;">翻译结果</h4>
      <button id="close-popup" style="background: none; border: none; cursor: pointer; font-size: 16px; color: #666;">×</button>
    </div>
    <div id="original-text" style="font-size: 13px; color: #666; margin-bottom: 8px;"></div>
    <div id="translated-text" style="font-size: 14px; color: #333; line-height: 1.4;"></div>
    <div style="margin-top: 8px; display: flex; gap: 8px;">
      <button id="copy-btn" style="flex: 1; padding: 4px 8px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">复制</button>
      <button id="speak-btn" style="flex: 1; padding: 4px 8px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">朗读</button>
    </div>
  `;
  
  document.body.appendChild(translationPopup);
  
  // 事件监听
  document.getElementById('close-popup').addEventListener('click', () => {
    translationPopup.style.display = 'none';
  });
  
  document.getElementById('copy-btn').addEventListener('click', () => {
    const translatedText = document.getElementById('translated-text').textContent;
    navigator.clipboard.writeText(translatedText);
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
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  }
}

// 显示翻译结果
function showTranslation(text, translation, position) {
  if (!translationPopup) {
    createTranslationPopup();
  }
  
  document.getElementById('original-text').textContent = text;
  document.getElementById('translated-text').textContent = translation;
  
  translationPopup.style.left = `${position.x + 10}px`;
  translationPopup.style.top = `${position.y - translationPopup.offsetHeight - 10}px`;
  translationPopup.style.display = 'block';
  
  // 自动隐藏
  clearTimeout(popupTimeout);
  popupTimeout = setTimeout(() => {
    translationPopup.style.display = 'none';
  }, 5000);
}

// 监听选中文本
document.addEventListener('mouseup', async (e) => {
  const selection = window.getSelection();
  if (selection.toString().trim()) {
    const text = selection.toString().trim();
    
    // 发送消息到background script
    chrome.runtime.sendMessage({
      type: 'TRANSLATE_REQUEST',
      text: text,
      position: { x: e.clientX, y: e.clientY }
    }, (response) => {
      if (response && response.translation) {
        showTranslation(text, response.translation, response.position);
      }
    });
  }
});

// 命令触发翻译
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRIGGER_TRANSLATION') {
    const selection = window.getSelection();
    if (selection.toString().trim()) {
      const text = selection.toString().trim();
      
      chrome.runtime.sendMessage({
        type: 'TRANSLATE_REQUEST',
        text: text,
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      }, (response) => {
        if (response && response.translation) {
          showTranslation(text, response.translation, response.position);
        }
      });
    }
  }
});

// 页面加载时创建弹出框
window.addEventListener('load', () => {
  createTranslationPopup();
});
