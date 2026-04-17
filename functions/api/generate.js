// Cloudflare Pages Functions - API 端點
// 檔案路徑: functions/api/generate.js

const API_BASE = 'https://connector-consulting-solution-beginner.trycloudflare.com/v1';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    // CORS 設定
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
        const body = await request.json();
        const { prompt, type, duration, resolution, style, size, n, reference_image } = body;

        if (!prompt) {
            return jsonResponse({ error: '缺少 prompt 參數' }, 400, corsHeaders);
        }

        // 從環境變數取得 API Key
        const apiKey = env.API_KEY;
        if (!apiKey) {
            return jsonResponse({ error: 'API Key 未設定，請在 Cloudflare Dashboard 設定環境變數 API_KEY' }, 500, corsHeaders);
        }

        let endpoint, payload;

        if (type === 'video') {
            endpoint = `${API_BASE}/videos/generations`;
            
            // 建構影片生成 payload
            // 注意：根據 API 實際支援情況，部分參數可能需要調整
            payload = {
                prompt: prompt,
                model: 'grok-imagine-video',
                duration: duration || 5  // 預設 5 秒
            };
            
            // 解析度參數（API 可能不支援，這裡作為示範）
            if (resolution) {
                // 將解析度轉換為 API 可能接受的格式
                // 注意：需確認 API 是否支援此參數
                payload.resolution = resolution;
            }
            
            // 風格參數 - 將風格關鍵字加入 prompt
            if (style) {
                const styleKeywords = {
                    'cinematic': 'cinematic style, film look, dramatic lighting',
                    'vlog': 'vlog style, casual, handheld camera feel',
                    'animation': 'animated style, cartoon, vibrant colors'
                };
                if (styleKeywords[style]) {
                    payload.prompt = `${prompt}, ${styleKeywords[style]}`;
                }
            }
            
        } else {
            endpoint = `${API_BASE}/images/generations`;
            
            // 建構圖片生成 payload
            payload = {
                prompt: prompt,
                n: n || 1,
                model: 'grok-imagine-image'
            };
            
            // 尺寸參數（API 可能支援）
            if (size) {
                payload.size = size;
            }
            
            // 圖片生圖功能分析
            // 注意：根據 API 文件，目前 grok-imagine-image 可能不支援 image 參數
            // 以下為預留的 image-to-image 實作，需確認 API 支援後才能啟用
            if (reference_image) {
                // API 可能接受的格式：
                // payload.image = reference_image;  // base64
                // 或
                // payload.image_url = `data:image/jpeg;base64,${reference_image}`;
                
                // 目前先記錄警告，實際功能需確認 API 支援
                console.log('Image-to-image requested but API support is unconfirmed');
                // payload.image = reference_image;  // 取消註解以啟用（需確認 API 支援）
            }
        }

        // 發送請求到外部 API
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('API Error:', data);
            return jsonResponse({ 
                error: data.error?.message || 'API 請求失敗',
                details: data.error || null
            }, response.status, corsHeaders);
        }

        return jsonResponse(data, 200, corsHeaders);

    } catch (error) {
        console.error('Handler Error:', error);
        return jsonResponse({ 
            error: error.message || '伺服器錯誤' 
        }, 500, corsHeaders);
    }
}

// 處理 OPTIONS 預檢請求
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}

function jsonResponse(data, status, headers) {
    return new Response(JSON.stringify(data), {
        status: status,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    });
}