// popup.js - 弹出界面逻辑
document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const enableCache = document.getElementById('enableCache');
    const enableDictionary = document.getElementById('enableDictionary');
    const saveBtn = document.getElementById('saveBtn');
    const testBtn = document.getElementById('testBtn');
    const status = document.getElementById('status');
    
    // 加载保存的设置
    chrome.storage.local.get(['apiKey', 'enableCache', 'enableDictionary'], (result) => {
        apiKeyInput.value = result.apiKey || '';
        enableCache.checked = result.enableCache !== false;
        enableDictionary.checked = result.enableDictionary !== false;
    });
    
// 保存设置
saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const cacheEnabled = enableCache.checked;
    const dictionaryEnabled = enableDictionary.checked;
    
    if (!apiKey) {
        status.textContent = '❌ API Key 不能为空';
        status.style.background = '#f8d7da';
        status.style.color = '#721c24';
        return;
    }
    
    console.log('保存设置:', { 
        apiKey: apiKey ? `✓ (${apiKey.length} 字符)` : '✗', 
        cacheEnabled, 
        dictionaryEnabled 
    });
    
    chrome.storage.local.set({
        apiKey: apiKey,
        enableCache: cacheEnabled,
        enableDictionary: dictionaryEnabled
    }, () => {
        status.textContent = '✓ 设置已保存';
        status.style.background = '#d4edda';
        status.style.color = '#155724';
        
        setTimeout(() => {
            status.textContent = '状态：就绪';
            status.style.background = '#e8f4fd';
            status.style.color = '#666';
        }, 2000);
    });
});
    
// 测试翻译
testBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    console.log('测试翻译，API Key:', apiKey ? `✓ (${apiKey.length} 字符)` : '✗ 未设置');
    
    if (!apiKey) {
        status.textContent = '❌ 请先输入API Key';
        status.style.background = '#f8d7da';
        status.style.color = '#721c24';
        return;
    }
    
    status.textContent = '⏳ 正在测试翻译...';
    status.style.background = '#e8f4fd';
    status.style.color = '#666';
    
    try {
        console.log('📤 发送测试请求到:', 'https://api.deepseek.com/v1/chat/completions');
        console.log('📝 请求体:', {
            model: 'deepseek-chat',
            messages: [{role: 'user', content: 'Hello'}],
            temperature: 0.3,
            max_tokens: 20
        });
        
        const startTime = Date.now();
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{role: 'user', content: 'Hello, please translate this word: "Apple"'}],
                temperature: 0.3,
                max_tokens: 50
            })
        });
        
        const duration = Date.now() - startTime;
        console.log(`📥 API 响应状态: ${response.status} (耗时: ${duration}ms)`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✓ API 响应成功:', result);
            
            if (result.choices && result.choices[0] && result.choices[0].message) {
                const translation = result.choices[0].message.content;
                status.textContent = `✓ 测试成功！\n翻译: ${translation}`;
                status.style.background = '#d4edda';
                status.style.color = '#155724';
            } else {
                console.error('❌ API 返回格式错误');
                status.textContent = '❌ API 返回格式错误，请检查 API Key';
                status.style.background = '#f8d7da';
                status.style.color = '#721c24';
            }
        } else {
            let errorMsg = response.statusText;
            try {
                const error = await response.json();
                errorMsg = error.error?.message || JSON.stringify(error);
                console.error('❌ API 错误详情:', error);
            } catch (e) {
                console.error('❌ 无法解析错误信息');
            }
            
            status.textContent = `❌ 测试失败 ${response.status}\n${errorMsg}`;
            status.style.background = '#f8d7da';
            status.style.color = '#721c24';
        }
    } catch (error) {
        console.error('❌ 测试异常:', error);
        status.textContent = `❌ 测试失败：${error.message}`;
        status.style.background = '#f8d7da';
        status.style.color = '#721c24';
    }
});
});