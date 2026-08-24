import type { APIRoute } from 'astro';

export const prerender = false;

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  record.count++;
  return true;
}

// Provider Abstraction
interface AiProvider {
  generateResponse(query: string, conversationId?: string): Promise<{ reply: string; conversationId: string }>;
}

// Dify API Provider
class DifyProvider implements AiProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = import.meta.env.DIFY_API_KEY || process.env.DIFY_API_KEY || '';
    const baseUrl = import.meta.env.DIFY_API_URL || process.env.DIFY_API_URL || 'https://api.dify.ai/v1';
    this.apiUrl = baseUrl.replace(/\/$/, '') + '/chat-messages';
  }

  async generateResponse(query: string, conversationId?: string): Promise<{ reply: string; conversationId: string }> {
    if (!this.apiKey) {
      throw new Error("DIFY_API_KEY is not configured.");
    }

    const payload: any = {
      inputs: {},
      query: query,
      response_mode: "blocking",
      user: "website-visitor"
    };

    if (conversationId) {
      payload.conversation_id = conversationId;
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Intentionally do not log full body to avoid leaking API key or secrets
      throw new Error(`AI Provider responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      reply: data.answer || "抱歉，客服大脑暂时短路啦~",
      conversationId: data.conversation_id || ""
    };
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || clientAddress || 'unknown';
    
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: '请求过于频繁，请稍后再试' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const bodyText = await request.text();
    // 限制 Body 大小
    if (bodyText.length > 5000) {
      return new Response(JSON.stringify({ error: '请求体过大' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = JSON.parse(bodyText);
    const query = body.query;
    const conversationId = body.conversation_id;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return new Response(JSON.stringify({ error: 'Query is required and must be a string' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 限制单次 query 最大长度
    if (query.length > 500) {
      return new Response(JSON.stringify({ error: 'Query 过长，请精简提问内容' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (conversationId && typeof conversationId !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid conversation ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const provider: AiProvider = new DifyProvider();

    try {
      const { reply, conversationId: newConversationId } = await provider.generateResponse(query, conversationId);

      return new Response(JSON.stringify({ 
        reply, 
        conversation_id: newConversationId 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (providerError: any) {
      // 避免泄露真实的错误信息或堆栈给客户端
      return new Response(JSON.stringify({ 
        error: 'AI 节点异常，请稍后再试'
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
