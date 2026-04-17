// 語言切換
let currentLang = 'zh';

const translations = {
    zh: {
        title: 'AI 圖片 & 影片 生成',
        labelPrompt: '描述文字 (Prompt)：',
        labelType: '生成類型：',
        image: '圖片',
        video: '影片',
        videoOptionsTitle: '影片進階選項',
        labelVideoDuration: '影片長度：',
        labelVideoResolution: '解析度：',
        labelVideoStyle: '影片風格：',
        default: '預設',
        cinematic: '電影感',
        vlog: 'Vlog',
        animation: '動畫',
        imageOptionsTitle: '圖片進階選項',
        labelImageSize: '圖片尺寸：',
        labelImageCount: '生成數量：',
        i2iTitle: '圖片生圖 (Image-to-Image)',
        i2iHint: '上傳一張參考圖片，AI 將基於該圖片進行風格轉換或修改',
        uploadText: '📁 選擇參考圖片',
        clearImage: '清除圖片',
        submitBtn: '產生',
        historyTitle: '生成記錄',
        clearHistory: '清除記錄',
        loadingImage: '正在生成圖片，請稍候',
        loadingVideo: '正在生成影片，請稍候',
        successImage: '圖片生成成功！',
        successVideo: '影片生成成功！',
        errorNoPrompt: '請輸入描述文字',
        errorGenerate: '生成失敗',
        errorNoResult: '無法取得生成結果',
        historyEmpty: '尚無生成記錄',
        sec: '秒',
        images: '張'
    },
    en: {
        title: 'AI Image & Video Generator',
        labelPrompt: 'Prompt:',
        labelType: 'Type:',
        image: 'Image',
        video: 'Video',
        videoOptionsTitle: 'Video Options',
        labelVideoDuration: 'Duration:',
        labelVideoResolution: 'Resolution:',
        labelVideoStyle: 'Style:',
        default: 'Default',
        cinematic: 'Cinematic',
        vlog: 'Vlog',
        animation: 'Animation',
        imageOptionsTitle: 'Image Options',
        labelImageSize: 'Size:',
        labelImageCount: 'Count:',
        i2iTitle: 'Image-to-Image',
        i2iHint: 'Upload a reference image for style transfer or modification',
        uploadText: '📁 Select Reference Image',
        clearImage: 'Clear',
        submitBtn: 'Generate',
        historyTitle: 'History',
        clearHistory: 'Clear History',
        loadingImage: 'Generating image, please wait',
        loadingVideo: 'Generating video, please wait',
        successImage: 'Image generated successfully!',
        successVideo: 'Video generated successfully!',
        errorNoPrompt: 'Please enter a prompt',
        errorGenerate: 'Generation failed',
        errorNoResult: 'Unable to get result',
        historyEmpty: 'No history yet',
        sec: 'sec',
        images: 'images'
    }
};

function updateLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    // 更新標題和標籤
    document.getElementById('title').textContent = t.title;
    document.getElementById('labelPrompt').textContent = t.labelPrompt;
    document.getElementById('labelType').textContent = t.labelType;
    document.getElementById('videoOptionsTitle').textContent = t.videoOptionsTitle;
    document.getElementById('labelVideoDuration').textContent = t.labelVideoDuration;
    document.getElementById('labelVideoResolution').textContent = t.labelVideoResolution;
    document.getElementById('labelVideoStyle').textContent = t.labelVideoStyle;
    document.getElementById('imageOptionsTitle').textContent = t.imageOptionsTitle;
    document.getElementById('labelImageSize').textContent = t.labelImageSize;
    document.getElementById('labelImageCount').textContent = t.labelImageCount;
    document.getElementById('i2iTitle').textContent = t.i2iTitle;
    document.getElementById('i2iHint').textContent = t.i2iHint;
    document.getElementById('uploadText').textContent = t.uploadText;
    document.getElementById('clearImage').textContent = t.clearImage;
    document.getElementById('submitBtn').textContent = t.submitBtn;
    document.getElementById('historyTitle').textContent = t.historyTitle;
    document.getElementById('clearHistory').textContent = t.clearHistory;
    
    // 更新下拉選單選項
    const typeSelect = document.getElementById('type');
    typeSelect.options[0].text = t.image;
    typeSelect.options[1].text = t.video;
    
    const videoStyleSelect = document.getElementById('videoStyle');
    videoStyleSelect.options[0].text = t.default;
    videoStyleSelect.options[1].text = t.cinematic;
    videoStyleSelect.options[2].text = t.vlog;
    videoStyleSelect.options[3].text = t.animation;
    
    const imageCountSelect = document.getElementById('imageCount');
    for (let i = 0; i < 4; i++) {
        imageCountSelect.options[i].text = `${i + 1} ${t.images}`;
    }
    
    // 更新按鈕狀態
    document.getElementById('langZh').classList.toggle('active', lang === 'zh');
    document.getElementById('langEn').classList.toggle('active', lang === 'en');
    
    // 重新渲染歷史記錄
    renderHistory();
}

// 語言切換按鈕事件
document.getElementById('langZh').addEventListener('click', () => updateLanguage('zh'));
document.getElementById('langEn').addEventListener('click', () => updateLanguage('en'));

// 類型切換
document.getElementById('type').addEventListener('change', function () {
    const videoOpts = document.getElementById('videoOptions');
    const imageOpts = document.getElementById('imageOptions');
    const imgToImg = document.getElementById('imageToImageSection');
    if (this.value === 'video') {
        videoOpts.style.display = 'block';
        imageOpts.style.display = 'none';
        imgToImg.style.display = 'none';
    } else {
        videoOpts.style.display = 'none';
        imageOpts.style.display = 'block';
        imgToImg.style.display = 'block';
    }
});

// 初始顯示根據預設類型
if (document.getElementById('type').value === 'video') {
    document.getElementById('videoOptions').style.display = 'block';
    document.getElementById('imageOptions').style.display = 'none';
    document.getElementById('imageToImageSection').style.display = 'none';
}

// 圖片預覽與清除
const referenceInput = document.getElementById('referenceImage');
const previewDiv = document.getElementById('imagePreview');
const clearBtn = document.getElementById('clearImage');
const uploadText = document.getElementById('uploadText');

referenceInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        previewDiv.innerHTML = '<img src="' + e.target.result + '" alt="Reference" class="preview-img" />';
        clearBtn.style.display = 'inline-block';
        uploadText.textContent = currentLang === 'zh' ? '已選擇圖片' : 'Image selected';
    };
    reader.readAsDataURL(file);
});

clearBtn.addEventListener('click', function () {
    referenceInput.value = '';
    previewDiv.innerHTML = '';
    this.style.display = 'none';
    uploadText.textContent = translations[currentLang].uploadText;
});

// 歷史記錄管理
const HISTORY_KEY = 'ai_generator_history';

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
        return [];
    }
}

function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addToHistory(item) {
    const history = getHistory();
    history.unshift(item);
    // 最多保留 50 筆
    if (history.length > 50) history.pop();
    saveHistory(history);
    renderHistory();
}

function clearAllHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    const history = getHistory();
    const t = translations[currentLang];
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">' + t.historyEmpty + '</div>';
        return;
    }
    
    historyList.innerHTML = history.map((item, index) => {
        const typeLabel = item.type === 'video' ? t.video : t.image;
        const typeClass = item.type === 'video' ? 'video' : 'image';
        const timeStr = new Date(item.timestamp).toLocaleString(currentLang === 'zh' ? 'zh-TW' : 'en-US');
        
        let contentHtml = '';
        if (item.type === 'video') {
            contentHtml = '<video controls muted style="max-width:100%;max-height:200px;border-radius:8px;"><source src="' + item.url + '" type="video/mp4"></video>';
        } else {
            contentHtml = '<img src="' + item.url + '" alt="Generated" style="max-width:100%;max-height:200px;border-radius:8px;cursor:pointer;" onclick="window.open(\'' + item.url + '\', \'_blank\')" />';
        }
        
        return '<div class="history-item">' +
            '<div class="history-item-header">' +
            '<span class="history-item-type ' + typeClass + '">' + typeLabel + '</span>' +
            '<span class="history-item-time">' + timeStr + '</span>' +
            '</div>' +
            '<div class="history-item-prompt">' + item.prompt + '</div>' +
            '<div class="history-item-content">' + contentHtml + '</div>' +
            '</div>';
    }).join('');
}

// 清除歷史記錄按鈕
document.getElementById('clearHistory').addEventListener('click', clearAllHistory);

// 初始渲染歷史記錄
renderHistory();

// 表單提交
document.getElementById('genForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const prompt = document.getElementById('prompt').value.trim();
    const type = document.getElementById('type').value;
    const resultDiv = document.getElementById('result');
    const submitBtn = document.getElementById('submitBtn');
    const t = translations[currentLang];
    
    if (!prompt) {
        resultDiv.innerHTML = '<div class="error">' + t.errorNoPrompt + '</div>';
        return;
    }
    
    // 取得進階參數
    const payload = { prompt, type };
    if (type === 'video') {
        payload.duration = parseInt(document.getElementById('videoDuration').value, 10);
        payload.resolution = document.getElementById('videoResolution').value;
        payload.style = document.getElementById('videoStyle').value;
    } else {
        payload.size = document.getElementById('imageSize').value;
        payload.n = parseInt(document.getElementById('imageCount').value, 10);
        if (referenceInput.files[0]) {
            const file = referenceInput.files[0];
            const base64 = await new Promise((res) => {
                const r = new FileReader();
                r.onload = () => res(r.result.split(',')[1]);
                r.readAsDataURL(file);
            });
            payload.reference_image = base64;
        }
    }
    
    // 顯示載入中
    const loadingMsg = type === 'video' ? t.loadingVideo : t.loadingImage;
    resultDiv.innerHTML = '<div class="loading">' + loadingMsg + '</div>';
    submitBtn.disabled = true;
    submitBtn.textContent = currentLang === 'zh' ? '生成中...' : 'Generating...';
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || t.errorGenerate);
        const url = data.data && data.data[0] && data.data[0].url;
        if (!url) throw new Error(t.errorNoResult);
        
        // 加入歷史記錄
        addToHistory({
            type: type,
            prompt: prompt,
            url: url,
            timestamp: Date.now()
        });
        
        if (type === 'video') {
            resultDiv.innerHTML = '<div class="success">' + t.successVideo + '</div><video controls autoplay muted loop><source src="' + url + '" type="video/mp4">' + (currentLang === 'zh' ? '您的瀏覽器不支援影片播放' : 'Your browser does not support video playback') + '</video>';
        } else {
            resultDiv.innerHTML = '<div class="success">' + t.successImage + '</div><img src="' + url + '" alt="Generated" style="cursor:pointer;" onclick="window.open(\'' + url + '\', \'_blank\')" />';
        }
    } catch (err) {
        resultDiv.innerHTML = '<div class="error">' + (currentLang === 'zh' ? '錯誤：' : 'Error: ') + err.message + '</div>';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t.submitBtn;
    }
});