// Cloudflare Worker - AI 圖片與影片生成站（含靜態資源）
// 這個 Worker 直接回傳 index.html、style.css、script.js，
// 並保留先前的 /api/generate API 端點。

// --- 靜態資源（內嵌） ---------------------------------------------------
const INDEX_HTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 圖片與影片生成站</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div class="container">
        <h1>AI 圖片 & 影片 生成</h1>
        <form id="genForm">
            <label for="prompt">描述文字 (Prompt)：</label>
            <textarea id="prompt" name="prompt" rows="3" required placeholder="例如：a futuristic city at night"></textarea>
            
            <label for="type">生成類型：</label>
            <select id="type" name="type">
                <option value="image">圖片</option>
                <option value="video">影片</option>
            </select>
            
            <!-- 影片進階選項 -->
            <div id="videoOptions" class="advanced-options" style="display: none;">
                <h3>影片進階選項</h3>
                
                <label for="videoDuration">影片長度：</label>
                <select id="videoDuration" name="videoDuration">
                    <option value="5" selected>5 秒</option>
                </select>
                
                <label for="videoResolution">解析度：</label>
                <select id="videoResolution" name="videoResolution">
                    <option value="480p" selected>480p (推薦)</option>
                </select>
                
                <label for="videoStyle">影片風格：</label>
                <select id="videoStyle" name="videoStyle">
                    <option value="" selected>預設</option>
                    <option value="cinematic">電影感</option>
                    <option value="vlog">Vlog</option>
                    <option value="animation">動畫</option>
                </select>
            </div>
            
            <!-- 圖片進階選項 -->
            <div id="imageOptions" class="advanced-options">
                <h3>圖片進階選項</h3>
                
                <label for="imageSize">圖片尺寸：</label>
                <select id="imageSize" name="imageSize">
                    <option value="1024x1024" selected>1024x1024 (正方形)</option>
                    <option value="1792x1024">1792x1024 (橫向)</option>
                    <option value="1024x1792">1024x1792 (直向)</option>
                </select>
                
                <label for="imageCount">生成數量：</label>
                <select id="imageCount" name="imageCount">
                    <option value="1" selected>1 張</option>
                    <option value="2">2 張</option>
                    <option value="3">3 張</option>
                    <option value="4">4 張</option>
                </select>
            </div>
            
            <!-- 圖片生圖功能 -->
            <div id="imageToImageSection" class="image-to-image-section">
                <h3>圖片生圖 (Image-to-Image)</h3>
                <p class="hint">上傳一張參考圖片，AI 將基於該圖片進行風格轉換或修改</p>
                
                <label class="upload-label" for="referenceImage">
                    <span id="uploadText">📁 選擇參考圖片</span>
                    <input type="file" id="referenceImage" name="referenceImage" accept="image/*">
                </label>
                <div id="imagePreview" class="image-preview"></div>
                <button type="button" id="clearImage" class="clear-btn" style="display: none;">清除圖片</button>
            </div>
            
            <button type="submit" id="submitBtn">產生</button>
        </form>
        <div id="result" class="result"></div>
    </div>
    <script src="/script.js"></script>
</body>
</html>`;

const STYLE_CSS = `* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    padding: 40px;
    max-width: 650px;
    width: 100%;
}

h1 {
    text-align: center;
    color: #1a1a2e;
    margin-bottom: 30px;
    font-size: 2rem;
    font-weight: 700;
}

form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

label {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

textarea, select {
    padding: 14px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.3s;
    width: 100%;
    font-family: inherit;
}

textarea:focus, select:focus {
    outline: none;
    border-color: #0f3460;
    box-shadow: 0 0 0 3px rgba(15, 52, 96, 0.15);
}

textarea {
    resize: vertical;
    min-height: 100px;
}

select {
    cursor: pointer;
    background: white;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 40px;
}

button {
    background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    margin-top: 10px;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(15, 52, 96, 0.3);
}

button:active { transform: translateY(0); }

button:disabled {
    background: #999;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.result { margin-top: 30px; text-align: center; }
.result img, .result video { max-width: 100%; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); margin-top: 15px; }
.result .loading { color: #0f3460; font-size: 1.1rem; padding: 40px; }
.result .loading::after { content: ''; animation: dots 1.5s infinite; }
@keyframes dots { 0%,20% { content: '.'; } 40% { content: '..'; } 60%,100% { content: '...'; } }
.result .error { color: #dc3545; background: #ffe6e6; padding: 15px 20px; border-radius: 10px; margin-top: 15px; }
.result .success { color: #28a745; margin-top: 10px; font-weight: 500; }
.advanced-options { background: #f8f9fa; border-radius: 12px; padding: 20px; margin-top: 10px; border: 1px solid #e9ecef; }
.advanced-options h3 { color: #1a1a2e; font-size: 1rem; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #0f3460; }
.image-to-image-section { background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%); border-radius: 12px; padding: 20px; margin-top: 15px; border: 2px dashed #0f3460; }
.image-to-image-section h3 { color: #0f3460; font-size: 1rem; margin-bottom: 10px; }
.hint { color: #666; font-size: 0.85rem; margin-bottom: 15px; }
.upload-label { display: inline-block; background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%); color: white; padding: 12px 24px; border-radius: 10px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; font-weight: 500; }
.upload-label:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(15,52,96,0.3); }
.upload-label input[type="file"] { display: none; }
.image-preview { margin-top: 15px; text-align: center; }
.preview-img { max-width: 200px; max-height: 200px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.clear-btn { background: #dc3545; margin-top: 10px; padding: 8px 16px; font-size: 0.9rem; }
.clear-btn:hover { background: #c82333; }
@media (max-width: 480px) { .container { padding: 25px; } h1 { font-size: 1.5rem; } button { padding: 14px 24px; font-size: 1rem; } .advanced-options, .image-to-image-section { padding: 15px; } }`;

const SCRIPT_JS = `document.getElementById('type').addEventListener('change', function () {
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

if (document.getElementById('type').value === 'video') {
    document.getElementById('videoOptions').style.display = 'block';
    document.getElementById('imageOptions').style.display = 'none';
    document.getElementById('imageToImageSection').style.display = 'none';
}

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
        uploadText.textContent = '已選擇圖片';
    };
    reader.readAsDataURL(file);
});

clearBtn.addEventListener('click', function () {
    referenceInput.value = '';
    previewDiv.innerHTML = '';
    this.style.display = 'none';
    uploadText.textContent = '📁 選擇參考圖片';
});

document.getElementById('genForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const prompt = document.getElementById('prompt').value.trim();
    const type = document.getElementById('type').value;
    const resultDiv = document.getElementById('result');
    const submitBtn = document.getElementById('submitBtn');
    if (!prompt) { resultDiv.innerHTML = '<div class="error">請輸入描述文字</div>'; return; }
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
    resultDiv.innerHTML = '<div class="loading">正在生成' + (type === 'video' ? '影片' : '圖片') + '，請稍候</div>';
    submitBtn.disabled = true;
    submitBtn.textContent = '生成中...';
    try {
        const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '生成失敗');
        const url = data.data && data.data[0] && data.data[0].url;
        if (!url) throw new Error('無法取得生成結果');
        if (type === 'video') {
            resultDiv.innerHTML = '<div class="success">影片生成成功！</div><video controls autoplay muted loop><source src="' + url + '" type="video/mp4">您的瀏覽器不支援影片播放</video>';
        } else {
            resultDiv.innerHTML = '<div class="success">圖片生成成功！</div><img src="' + url + '" alt="生成的圖片" />';
        }
    } catch (err) {
        resultDiv.innerHTML = '<div class="error">錯誤：' + err.message + '</div>';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '產生';
    }
    });`;

// --- Worker 主體 -------------------------------------------------------
const API_BASE = 'https://connector-consulting-solution-beginner.trycloudflare.com/v1';

export default {
    async fetch(request, env, ctx) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        const url = new URL(request.url);
        const path = url.pathname;
        // 靜態檔案路由
        if (request.method === 'GET') {
            if (path === '/' || path === '/index.html') {
                return new Response(INDEX_HTML, { headers: { 'Content-Type': 'text/html', ...corsHeaders } });
            }
            if (path === '/style.css') {
                return new Response(STYLE_CSS, { headers: { 'Content-Type': 'text/css', ...corsHeaders } });
            }
            if (path === '/script.js') {
                return new Response(SCRIPT_JS, { headers: { 'Content-Type': 'application/javascript', ...corsHeaders } });
            }
        }
        // API 路由
        if (path === '/api/generate' && request.method === 'POST') {
            return handleGenerate(request, env, corsHeaders);
        }
        // 未匹配路徑
        return new Response('Not Found', { status: 404, headers: corsHeaders });
    },
};

async function handleGenerate(request, env, corsHeaders) {
    try {
        const body = await request.json();
        const { prompt, type, duration, resolution, style, size, n, reference_image } = body;
        if (!prompt) return jsonResponse({ error: '缺少 prompt 參數' }, 400, corsHeaders);
        const apiKey = env.API_KEY;
        if (!apiKey) return jsonResponse({ error: 'API Key 未設定' }, 500, corsHeaders);
        let endpoint, payload;
        if (type === 'video') {
            endpoint = `${API_BASE}/videos/generations`;
            payload = { prompt, model: 'grok-imagine-video', duration: duration || 5 };
            if (resolution) payload.resolution = resolution;
            if (style) {
                const styleMap = { cinematic: 'cinematic style, film look, dramatic lighting', vlog: 'vlog style, casual, handheld camera feel', animation: 'animated style, cartoon, vibrant colors' };
                if (styleMap[style]) payload.prompt = `${prompt}, ${styleMap[style]}`;
            }
        } else {
            endpoint = `${API_BASE}/images/generations`;
            payload = { prompt, n: n || 1, model: 'grok-imagine-image' };
            if (size) payload.size = size;
            if (reference_image) {
                // 若 API 支援，取消註解以下行即可
                // payload.image = reference_image;
            }
        }
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            console.error('API Error:', data);
            return jsonResponse({ error: data.error?.message || 'API 請求失敗' }, response.status, corsHeaders);
        }
        return jsonResponse(data, 200, corsHeaders);
    } catch (e) {
        console.error('Handler Error:', e);
        return jsonResponse({ error: e.message || '伺服器錯誤' }, 500, corsHeaders);
    }
}

function jsonResponse(data, status, headers) {
    return new Response(JSON.stringify(data), { status: status, headers: { 'Content-Type': 'application/json', ...headers } });
}