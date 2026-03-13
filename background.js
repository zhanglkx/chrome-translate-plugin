// background.js - 后台脚本
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时

// 缓存管理 - 使用 chrome.storage.local 替代 localStorage
const cacheManager = {
  cache: {},
  
  loadCache() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['translationCache'], (result) => {
        try {
          if (result.translationCache) {
            this.cache = result.translationCache;
            console.log('缓存加载成功:', Object.keys(this.cache).length, '条记录');
          }
          resolve();
        } catch (e) {
          console.error('加载缓存失败:', e);
          resolve();
        }
      });
    });
  },
  
  saveCache() {
    chrome.storage.local.set({ translationCache: this.cache }, () => {
      if (chrome.runtime.lastError) {
        console.error('保存缓存失败:', chrome.runtime.lastError);
      }
    });
  },
  
  async get(key) {
    const item = this.cache[key];
    if (item && Date.now() - item.timestamp < CACHE_EXPIRY) {
      console.log('✓ 缓存命中:', key);
      return item.data;
    }
    if (item) {
      delete this.cache[key]; // 删除过期缓存
    }
    return null;
  },
  
  async set(key, data) {
    this.cache[key] = {
      data: data,
      timestamp: Date.now()
    };
    this.saveCache();
  },

  async clear() {
    this.cache = {};
    chrome.storage.local.set({ translationCache: {} });
  }
};

// 获取 API Key 和设置
async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiKey'], (result) => {
      const key = result.apiKey || '';
      console.log('获取API Key:', key ? `已设置 [${key.substring(0, 10)}...]` : '未设置');
      resolve(key);
    });
  });
}

// 获取用户设置
async function getUserSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['enableCache', 'enableDictionary'], (result) => {
      resolve({
        enableCache: result.enableCache !== false,
        enableDictionary: result.enableDictionary !== false
      });
    });
  });
}

// 初始化缓存
(async () => {
  await cacheManager.loadCache();
  console.log('✓ 翻译插件后台脚本已初始化');
})();

// 字典管理
const dictionary = {
  words: {},
  
  loadDictionary() {
    try {
      // 这里可以加载本地词典，暂时使用简单示例
      this.words = {
        'hello': '你好',
        'world': '世界',
        'thank': '谢谢',
        'you': '你',
        'good': '好',
        'morning': '早上',
        'evening': '晚上',
        'night': '夜晚'
      };
    } catch (e) {
      console.error('加载词典失败:', e);
    }
  },
  
  lookup(word) {
    return this.words[word.toLowerCase()] || null;
  },
  
  isSimpleWord(text) {
    return text.split(' ').length <= 3;
  }
};

dictionary.loadDictionary();

// DeepSeek API翻译
async function translateWithDeepSeek(text) {
  const settings = await getUserSettings();
  
  // 检查缓存是否启用
  if (settings.enableCache) {
    const cacheKey = `deepseek_${btoa(text)}`;
    const cached = await cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }
  }
  
  try {
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      console.error('❌ API Key未设置');
      return '❌ 请先在设置中配置API Key';
    }
    
    console.log('📤 发送翻译请求到 DeepSeek API...');
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{role: 'user', content: `翻译以下文本为中文（如果已是中文则翻译为英文）：${text}`}],
        temperature: 0.3,
        max_tokens: 100
      })
    });
    
    console.log('📥 API 响应状态:', response.status);
    
    if (!response.ok) {
      let errorMessage = '未知错误';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || JSON.stringify(errorData);
      } catch (e) {
        errorMessage = response.statusText;
      }
      
      console.error('❌ API请求失败:', response.status, errorMessage);
      throw new Error(`API错误 ${response.status}: ${errorMessage}`);
    }
    
    const result = await response.json();
    
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      console.error('❌ API 响应格式错误:', result);
      throw new Error('API 返回格式异常');
    }
    
    const translation = result.choices[0].message.content.trim();
    console.log('✓ 翻译成功:', translation);
    
    // 如果缓存启用，保存结果
    if (settings.enableCache) {
      const cacheKey = `deepseek_${btoa(text)}`;
      await cacheManager.set(cacheKey, translation);
    }
    
    return translation;
  } catch (error) {
    console.error('❌ DeepSeek API错误:', error.message);
    return `❌ 翻译失败: ${error.message}`;
  }
}

// 智能翻译策略
async function smartTranslate(text) {
  const settings = await getUserSettings();
  
  // 简单词且字典启用时直接查词典
  if (settings.enableDictionary && dictionary.isSimpleWord(text)) {
    const result = dictionary.lookup(text);
    if (result) {
      console.log('💡 使用词典：', text, '->', result);
      return result;
    }
  }
  
  // 复杂文本或禁用字典时调用API
  return await translateWithDeepSeek(text);
}

// 消息处理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到翻译请求:', request.type, request.text);
  
  if (request.type === 'TRANSLATE_REQUEST') {
    smartTranslate(request.text).then(translation => {
      console.log('翻译完成:', translation);
      sendResponse({ translation, position: request.position });
    }).catch(error => {
      console.error('翻译错误:', error);
      sendResponse({ translation: '翻译失败，请重试', position: request.position });
    });
    return true; // 保持消息通道打开
  }
});

// 命令处理
chrome.commands.onCommand.addListener((command) => {
  if (command === 'translate-selection') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'TRIGGER_TRANSLATION'
      });
    });
  }
});