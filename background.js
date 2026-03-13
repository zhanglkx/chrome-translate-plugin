// background.js - 双向翻译后台脚本 (支持英译汉、汉译英)
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
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['enableCache', 'enableDictionary'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('❌ 获取设置失败:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      
      const settings = {
        enableCache: result.enableCache !== false,
        enableDictionary: result.enableDictionary !== false
      };
      console.log('✓ 获取用户设置成功:', settings);
      resolve(settings);
    });
  });
}

// 初始化缓存
(async () => {
  await cacheManager.loadCache();
  console.log('✓ 双向翻译插件后台脚本已初始化');
})();

// 字典管理 - 支持双向翻译
const dictionary = {
  words: {},        // 英文→中文
  reverseWords: {}, // 中文→英文
  
  loadDictionary() {
    try {
      // 英文→中文词典
      this.words = {
        'hello': '你好',
        'world': '世界',
        'thank': '谢谢',
        'you': '你',
        'good': '好',
        'morning': '早上',
        'evening': '晚上',
        'night': '夜晚',
        'yes': '是',
        'no': '否',
        'ok': '好的',
        'bye': '再见',
        'see': '看见',
        'later': '以后',
        'how': '如何',
        'are': '是',
        'what': '什么',
        'where': '哪里',
        'when': '何时',
        'why': '为什么',
        'who': '谁',
        'which': '哪个',
        'this': '这个',
        'that': '那个',
        'it': '它',
        'is': '是',
        'love': '爱',
        'happy': '开心',
        'sad': '伤心',
        'beautiful': '漂亮',
        'food': '食物',
        'water': '水',
        'sun': '太阳',
        'moon': '月亮',
        'star': '星星',
        'sky': '天空',
        'tree': '树',
        'flower': '花',
        'bird': '鸟',
        'cat': '猫',
        'dog': '狗',
        'fish': '鱼',
        'school': '学校',
        'book': '书',
        'friend': '朋友',
        'family': '家庭',
        'mother': '妈妈',
        'father': '爸爸',
        'sister': '姐姐',
        'brother': '哥哥',
        'apple': '苹果',
        'orange': '橙子',
        'banana': '香蕉',
        'red': '红色',
        'blue': '蓝色',
        'green': '绿色',
        'yellow': '黄色',
        'big': '大',
        'small': '小',
        'hot': '热',
        'cold': '冷',
        'fast': '快',
        'slow': '慢',
        'new': '新',
        'old': '旧',
        'clean': '干净',
        'dirty': '脏',
        'right': '对',
        'wrong': '错',
        'help': '帮助',
        'work': '工作',
        'play': '玩',
        'run': '跑',
        'walk': '走',
        'sleep': '睡觉',
        'eat': '吃',
        'drink': '喝',
        'laugh': '笑',
        'cry': '哭'
      };
      
      // 构建反向词典（中文→英文）
      this.buildReverseDict();
    } catch (e) {
      console.error('加载词典失败:', e);
    }
  },
  
  buildReverseDict() {
    // 从英文→中文词典构建中文→英文反向词典
    for (const [english, chinese] of Object.entries(this.words)) {
      this.reverseWords[chinese] = english;
    }
    console.log('✓ 反向词典已构建:', Object.keys(this.reverseWords).length, '条记录');
  },
  
  lookup(word) {
    const lowerWord = word.toLowerCase();
    
    // 先尝试英文→中文
    if (this.words[lowerWord]) {
      return this.words[lowerWord];
    }
    
    // 再尝试中文→英文（反向查询）
    if (this.reverseWords[word]) {
      return this.reverseWords[word];
    }
    
    return null;
  },
  
  isSimpleWord(text) {
    // 判断是否为简单单词（1-3个单词或1-3个汉字）
    const wordCount = text.split(' ').length;
    const chineseCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    return wordCount <= 3 || (chineseCount <= 3 && chineseCount > 0);
  }
};

dictionary.loadDictionary();

// 语言检测函数
function detectLanguage(text) {
  // 检查是否包含中文字符（包括简体、繁体、假名）
  const chineseRegex = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g;
  const chineseMatches = text.match(chineseRegex) || [];
  
  // 如果中文字符超过文本长度的30%，判定为中文
  if (chineseMatches.length / text.length > 0.3) {
    return 'chinese';
  }
  
  return 'english';
}

// DeepSeek API翻译 - 支持双向翻译
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
    
    // 自动检测输入文本的语言
    const language = detectLanguage(text);
    const targetLanguage = language === 'chinese' ? 'English' : 'Chinese';
    const sourceLanguage = language === 'chinese' ? 'Chinese (中文)' : 'English (英文)';
    
    console.log(`📝 自动检测语言: ${sourceLanguage} → 翻译目标: ${targetLanguage}`);
    console.log('📤 发送翻译请求到 DeepSeek API...');
    
    const prompt = `请将以下${sourceLanguage}文本翻译为${targetLanguage}。只返回翻译结果，不要添加任何解释或备注。\n\n${text}`;
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{role: 'user', content: prompt}],
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
    const detectedLang = detectLanguage(text);
    const arrow = detectedLang === 'chinese' ? '汉→英' : '英→汉';
    
    console.log(`🌐 翻译成功 (${arrow}):`, translation);
    
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

// 智能翻译策略 - 支持双向翻译
async function smartTranslate(text) {
  try {
    const settings = await getUserSettings();
    const language = detectLanguage(text);
    
    console.log('🔧 当前设置:', { enableDictionary: settings.enableDictionary, enableCache: settings.enableCache });
    console.log(`🌐 自动检测语言: ${language === 'chinese' ? '中文' : '英文'}`);
    
    // 简单词且字典启用时直接查词典（支持双向查询）
    if (settings.enableDictionary && dictionary.isSimpleWord(text)) {
      const result = dictionary.lookup(text);
      if (result) {
        const dir = language === 'english' ? '英→汉' : '汉→英';
        console.log(`💡 使用离线词典 (${dir})：${text} → ${result}`);
        return result;
      }
    }
    
    // 复杂文本或禁用字典时调用API（自动双向翻译）
    const direction = language === 'chinese' ? '汉→英' : '英→汉';
    console.log(`📞 调用 DeepSeek API (${direction}): ${text}`);
    const result = await translateWithDeepSeek(text);
    console.log('✓ API 返回结果:', result);
    
    return result;
  } catch (error) {
    console.error('❌ smartTranslate 异常:', error);
    throw error;
  }
}

// 消息处理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 background 收到消息:', { type: request.type, text: request.text });
  
  if (request.type === 'TRANSLATE_REQUEST') {
    // 创建异步处理函数
    const handleTranslation = async () => {
      try {
        console.log('⏳ 开始翻译处理...');
        const translation = await smartTranslate(request.text);
        console.log('✓ 翻译完成:', translation);
        
        const response = {
          translation: translation,
          position: request.position,
          success: true
        };
        
        console.log('📤 sendResponse 发送:', response);
        sendResponse(response);
      } catch (error) {
        console.error('❌ 翻译处理异常:', error);
        const errorResponse = {
          translation: `❌ 翻译异常: ${error.message}`,
          position: request.position,
          success: false,
          error: error.message
        };
        console.log('📤 sendResponse 发送错误:', errorResponse);
        sendResponse(errorResponse);
      }
    };
    
    // 启动异步处理
    handleTranslation();
    
    // 返回 true 表示异步响应
    return true;
  }
});

// 命令处理（可选的快捷键支持）
chrome.commands.onCommand.addListener((command) => {
  if (command === 'translate-selection') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'TRIGGER_TRANSLATION'
      });
    });
  }
});
