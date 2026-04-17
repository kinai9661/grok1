// Cloudflare Worker - AI 圖片與影片生成 API
// 部署到 Cloudflare Workers 或 Cloudflare Pages Functions

const API_BASE = 'https://connector-consulting-solution-beginner.trycloudflare.com/v1';

export default {
    async fetch(request, env, ctx) {
        // CORS 設定
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // 處理 OPTIONS 預檢請求
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);

        // API 路由
        if (url.pathname === '/api/generate' && request.method === 'POST') {
            return handleGenerate(request, env, corsHeaders);
        }

        // 靜態檔案服務 (由 Cloudflare Pages 處理)
        return new Response('Not Found', { status: 404 });
    }
};

async function handleGenerate(request, env, corsHeaders) {
    try {
        const body = await request.json();
        const { prompt, type } = body;

        if (!prompt) {
            return jsonResponse({ error: '缺少 prompt 參數' }, 400, corsHeaders);
        }

        // 從環境變數取得 API Key
        const apiKey = env.API_KEY;
        if (!apiKey) {
            return jsonResponse({ error: 'API Key 未設定' }, 500, corsHeaders);
        }

        let endpoint, payload, timeout;

        if (type === 'video') {
            endpoint = `${API_BASE}/videos/generations`;
            payload = {
                prompt: prompt,
                model: 'grok-imagine-video',
                duration: 5
            };
            timeout = 120000; // 影片生成需要較長時間
        } else {
            endpoint = `${API_BASE}/images/generations`;
            payload = {
                prompt: prompt,
                n: 1,
                model: 'grok-imagine-image'
            };
            timeout = 60000;
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
                error: data.error?.message || 'API 請求失敗' 
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

function jsonResponse(data, status, headers) {
    return new Response(JSON.stringify(data), {
        status: status,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    });
}