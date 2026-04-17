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
        previewDiv.innerHTML = `<img src="${e.target.result}" alt="Reference" class="preview-img" />`;
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

// 表單提交
document.getElementById('genForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const prompt = document.getElementById('prompt').value.trim();
    const type = document.getElementById('type').value;
    const resultDiv = document.getElementById('result');
    const submitBtn = document.getElementById('submitBtn');

    if (!prompt) {
        resultDiv.innerHTML = '<div class="error">請輸入描述文字</div>';
        return;
    }

    // 取得進階參數
    const payload = { prompt, type };
    if (type === 'video') {
        payload.duration = parseInt(document.getElementById('videoDuration').value, 10);
        payload.resolution = document.getElementById('videoResolution').value; // 目前僅 480p
        payload.style = document.getElementById('videoStyle').value; // cinematic / vlog / animation
    } else {
        payload.size = document.getElementById('imageSize').value;
        payload.n = parseInt(document.getElementById('imageCount').value, 10);
        // 若有上傳參考圖片，轉為 base64 並加入 payload（API 目前未支援，僅作示範）
        if (referenceInput.files[0]) {
            const file = referenceInput.files[0];
            const base64 = await new Promise((res) => {
                const r = new FileReader();
                r.onload = () => res(r.result.split(',')[1]);
                r.readAsDataURL(file);
            });
            payload.reference_image = base64; // 自訂欄位，供未來 API 使用
        }
    }

    // 顯示載入中
    resultDiv.innerHTML = `<div class="loading">正在生成${type === 'video' ? '影片' : '圖片'}，請稍候</div>`;
    submitBtn.disabled = true;
    submitBtn.textContent = '生成中...';

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '生成失敗');
        const url = data.data && data.data[0] && data.data[0].url;
        if (!url) throw new Error('無法取得生成結果');
        if (type === 'video') {
            resultDiv.innerHTML = `
                <div class="success">影片生成成功！</div>
                <video controls autoplay muted loop>
                    <source src="${url}" type="video/mp4">
                    您的瀏覽器不支援影片播放
                </video>`;
        } else {
            resultDiv.innerHTML = `
                <div class="success">圖片生成成功！</div>
                <img src="${url}" alt="生成的圖片" />`;
        }
    } catch (err) {
        resultDiv.innerHTML = `<div class="error">錯誤：${err.message}</div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '產生';
    }
});