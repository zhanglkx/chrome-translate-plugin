// utils/dictionary.js - 词典管理模块 (支持双向翻译)
class Dictionary {
    constructor() {
        this.englishToChinese = {};  // 英文→中文
        this.chineseToEnglish = {};  // 中文→英文
        this.loadDictionary();
    }

    loadDictionary() {
        try {
            // 英文→中文词典
            this.englishToChinese = {
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
                'love': '爱',
                'happy': '开心',
                'sad': '伤心',
                'beautiful': '漂亮',
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
                'help': '帮助',
                'work': '工作',
                'play': '玩',
                'eat': '吃',
                'drink': '喝',
                'laugh': '笑',
                'cry': '哭'
            };
            
            // 构建双向词典
            this.buildReverseDict();
        } catch (e) {
            console.error('加载词典失败:', e);
        }
    }

    buildReverseDict() {
        // 从英文→中文词典构建中文→英文反向词典
        for (const [english, chinese] of Object.entries(this.englishToChinese)) {
            this.chineseToEnglish[chinese] = english;
        }
    }

    /**
     * 查询词典（支持双向）
     * @param {string} word - 查询的单词或汉字
     * @returns {string|null} - 翻译结果或 null
     */
    lookup(word) {
        const lowerWord = word.toLowerCase();
        
        // 先尝试英文→中文
        if (this.englishToChinese[lowerWord]) {
            return this.englishToChinese[lowerWord];
        }
        
        // 再尝试中文→英文（反向查询）
        if (this.chineseToEnglish[word]) {
            return this.chineseToEnglish[word];
        }
        
        return null;
    }

    /**
     * 判断是否为简单单词或短词
     * @param {string} text - 待判断的文本
     * @returns {boolean}
     */
    isSimpleWord(text) {
        // 英文单词数不超过3个
        const englishWords = text.split(' ');
        if (englishWords.length <= 3) {
            return true;
        }
        
        // 或者中文字符不超过3个
        const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []);
        if (chineseChars.length <= 3 && chineseChars.length > 0) {
            return true;
        }
        
        return false;
    }

    /**
     * 获取词典统计信息
     * @returns {object} - 词典统计数据
     */
    getStats() {
        return {
            englishToChinese: Object.keys(this.englishToChinese).length,
            chineseToEnglish: Object.keys(this.chineseToEnglish).length,
            total: Object.keys(this.englishToChinese).length + Object.keys(this.chineseToEnglish).length
        };
    }
}

// 导出单例实例
const dictionary = new Dictionary();
