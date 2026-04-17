# AI 圖片與影片生成站

一個專業的 AI 圖片與影片生成網站，可部署到 Cloudflare Pages 免費託管。

## 專案結構

```
├── index.html              # 前端主頁面
├── style.css               # 樣式表（現代化深色漸層設計）
├── script.js               # 前端 JavaScript
├── functions/
│   └── api/
│       └── generate.js     # Cloudflare Pages Functions (API 端點)
├── worker.js               # Cloudflare Workers 替代方案
├── wrangler.toml           # Workers 配置
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
     - **Value**: `gk-3c25e655bf951d96aca89b240bfdf9515987416c6591319a`
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
4. 若選擇 **影片**，可在下方設定 **影片長度**、**解析度**（目前僅 480p）與 **影片風格**（預設、電影感、Vlog、動畫）
5. 若選擇 **圖片**，可設定 **尺寸**、**生成數量**，並可上傳參考圖片（Image‑to‑Image）
6. 點擊「產生」按鈕
7. 等待生成完成，結果會顯示在頁面上

## API 端點

### POST /api/generate

**Request Body:**
```json
{
  "prompt": "a sunset",
  "type": "image",  // 或 "video"
  // 影片選項
  "duration": 5,
  "resolution": "480p",
  "style": "cinematic",
  // 圖片選項
  "size": "1024x1024",
  "n": 1,
  // 圖片生圖（若 API 支援）
  "reference_image": "BASE64_DATA"
}
```

**Response:**
```json
{
  "data": [
    { "url": "https://..." }
  ]
}
```

## 圖片生圖 (Image‑to‑Image) 支援分析

根據 `models.json`（位於 `Downloads/Telegram Desktop/models.json`）目前僅提供兩個模型：
- `grok-imagine-image`
- `grok-imagine-video`

**結論**：官方文件未明確說明 `grok-imagine-image` 是否支援 `image` 或 `image_url` 參數。為安全起見，我們在前端保留了上傳參考圖片的 UI，並在後端 `functions/api/generate.js` 中加入了 `reference_image` 參數的佔位處理。若未來 API 文件確認支援，只需取消註解 `payload.image = reference_image;` 或 `payload.image_url = ...` 即可啟用。

## 疑難排解 – "Not Found" 錯誤

如果在部署後或本地測試時看到 **Not Found**，請依照以下步驟檢查：

1. **確認路徑**
   - 前端請求的 API URL 必須是相對路徑 `/api/generate`（在 Cloudflare Pages 上會自動映射到 `functions/api/generate.js`）。
   - 若使用自訂子路徑或不同的專案名稱，請確保 `fetch('/api/generate')` 與實際部署路徑一致。

2. **檢查 `wrangler.toml`**
   - 目前 `wrangler.toml` 只用於 Workers 部署，對於 Pages 部署不需要此檔案。若同時使用 Workers，請確保 `name` 與 Cloudflare Dashboard 中的 Worker 名稱相符。

3. **確認 `functions/` 目錄已正確上傳**
   - Cloudflare Pages 只會部署 `functions/` 目錄下的檔案作為 Functions。確保 `functions/api/generate.js` 已提交至 Git 並推送到遠端。

4. **環境變數**
   - 若 `API_KEY` 未設定，API 會回傳錯誤，但不會是 404。請在 Cloudflare Dashboard → **Settings → Environment variables** 中新增 `API_KEY`。

5. **本地開發測試**
   ```bash
   # 使用 Wrangler 本地開發伺服器（Pages）
   wrangler pages dev .
   ```
   - 確認在本機瀏覽器開啟 `http://127.0.0.1:8787`，並在開發者工具的 Network 面板查看 `/api/generate` 請求是否返回 200。

6. **檢查 Cloudflare Dashboard 的 Logs**
   - 前往 **Workers & Pages → Logs**，搜尋 `generate`，查看是否有錯誤訊息或 404。

7. **清除快取**
   - Cloudflare 可能快取了舊的路由設定。進入 **Caching → Purge Cache**，選擇 **Purge Everything**，重新載入頁面。

8. **確認檔案大小寫**
   - Cloudflare 的路由是大小寫敏感的。確保 `functions/api/generate.js` 中的 `export async function onRequestPost` 與 `onRequestOptions` 名稱正確，且檔案路徑全小寫。

9. **重新部署**
   - 若以上皆無效，請在 Cloudflare Dashboard 點選 **Deployments → Trigger Deploy**，或在本機執行 `wrangler pages deploy .` 重新部署。

## 本地測試指令

```bash
# 1. 安裝依賴（若使用 npm）
npm install -g wrangler

# 2. 本地開發（Pages）
wrangler pages dev .

# 3. 測試 API（使用 curl）
curl -X POST http://127.0.0.1:8787/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"a sunset","type":"image","size":"1024x1024","n":1}'
```

## 授權

MIT License
