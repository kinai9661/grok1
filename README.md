# AI 圖片與影片生成站

一個專業的 AI 圖片與影片生成網站，可部署到 Cloudflare Pages 免費託管。

## 專案結構

```
├── index.html              # 前端主頁面
├── style.css               # 樣式表
├── script.js               # 前端 JavaScript
├── functions/
│   └── api/
│       └── generate.js     # Cloudflare Pages Functions (API 端點)
├── worker.js               # Cloudflare Workers 程式碼 (替代方案)
├── wrangler.toml           # Cloudflare Workers 配置
└── README.md               # 說明文件
```

## 部署到 Cloudflare Pages (免費)

### 方法一：透過 GitHub 自動部署

1. **上傳到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的帳號/你的repo.git
   git push -u origin main
   ```

2. **連接 Cloudflare Pages**
   - 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 點選「Workers & Pages」→「Create application」→「Pages」→「Connect to Git」
   - 選擇你的 GitHub 儲存庫
   - 設定：
     - **Build command**: 留空（不需要建置）
     - **Build output directory**: `/` 或留空
   - 點選「Save and Deploy」

3. **設定環境變數**
   - 部署完成後，進入專案設定
   - 點選「Settings」→「Environment variables」
   - 新增變數：
     - **Variable name**: `API_KEY`
     - **Value**: ``
   - 點選「Save」
   - 重新部署以套用變更

### 方法二：使用 Wrangler CLI 直接部署

1. **安裝 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登入 Cloudflare**
   ```bash
   wrangler login
   ```

3. **部署**
   ```bash
   wrangler pages deploy . --project-name=ai-generator
   ```

4. **設定環境變數**
   ```bash
   wrangler pages secret put API_KEY --project-name=ai-generator
   # 輸入你的 API Key
   ```

## 使用方式

1. 開啟網站
2. 輸入描述文字（Prompt），例如：「a sunset over the ocean」
3. 選擇生成類型（圖片或影片）
4. 點擊「產生」按鈕
5. 等待生成完成，結果會顯示在頁面上

## API 端點

### POST /api/generate

**Request Body:**
```json
{
  "prompt": "a sunset",
  "type": "image"  // 或 "video"
}
```

**Response:**
```json
{
  "data": [
    {
      "url": "https://..."
    }
  ]
}
```

## 支援的模型

- **圖片生成**: `grok-imagine-image`
- **影片生成**: `grok-imagine-video` (5 秒影片)

## 注意事項

1. **API Key 安全**: 請勿將 API Key 直接寫入程式碼，務必使用環境變數
2. **生成時間**: 
   - 圖片約需 10-30 秒
   - 影片約需 60-120 秒
3. **免費方案限制**: Cloudflare Pages 免費方案每月有 100,000 次請求限制

## 本地測試

```bash
# 使用 wrangler 本地開發伺服器
wrangler pages dev .

# 或使用任何靜態伺服器
npx serve .
```

注意：本地測試時需要建立 `.dev.vars` 檔案設定環境變數：
```
API_KEY=your-api-key-here
```

## 授權

MIT License
