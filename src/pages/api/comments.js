import fs from 'fs';
import path from 'path';

export const prerender = false;

const dataFile = path.join(process.cwd(), 'src', 'data', 'comments.json');

// Simple in-memory rate limiter for comments
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_COMMENTS_PER_WINDOW = 3;

function checkRateLimit(ip) {
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
  if (record.count >= MAX_COMMENTS_PER_WINDOW) {
    return false;
  }
  record.count++;
  return true;
}

// Simple HTML escaper to prevent Stored XSS
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getComments() {
  if (!fs.existsSync(dataFile)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveComments(comments) {
  fs.writeFileSync(dataFile, JSON.stringify(comments, null, 2), 'utf8');
}

export async function GET() {
  const comments = getComments();
  return new Response(JSON.stringify(comments.reverse()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request, clientAddress }) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || clientAddress || 'unknown';
    
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: '评论过于频繁，请稍后再试' }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const bodyText = await request.text();
    // 限制 Payload 大小 (20KB)
    if (bodyText.length > 20480) {
      return new Response(JSON.stringify({ error: '请求体过大' }), { 
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = JSON.parse(bodyText);

    if (!data.text || typeof data.text !== 'string' || data.text.trim() === '') {
      return new Response(JSON.stringify({ error: '评论内容不能为空' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 限制单次评论最大长度
    if (data.text.trim().length > 1000) {
      return new Response(JSON.stringify({ error: '评论内容过长 (最大 1000 字符)' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const randomChars = Math.random().toString(36).substring(2, 8);
    const username = `用户_${randomChars}`;
    
    // XSS 防护转义
    const safeText = escapeHTML(data.text.trim());
    
    const newComment = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      username,
      text: safeText,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    const comments = getComments();

    if (data.parentId) {
      const parent = comments.find(c => c.id === data.parentId);
      if (parent) {
        if (data.replyToUser && typeof data.replyToUser === 'string') {
          newComment.replyToUser = escapeHTML(data.replyToUser.substring(0, 50));
        }
        if (!parent.replies) parent.replies = [];
        parent.replies.push(newComment);
      } else {
        return new Response(JSON.stringify({ error: '父评论不存在' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      newComment.replies = [];
      comments.push(newComment);
    }

    saveComments(comments);

    return new Response(JSON.stringify(newComment), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '提交失败' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ request }) {
  try {
    const data = await request.json();
    const ADMIN_PASS = import.meta.env.ADMIN_PASS || process.env.ADMIN_PASS; 
    if (data.password !== ADMIN_PASS) {
      return new Response(JSON.stringify({ error: '授权失败' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const comments = getComments();
    
    if (data.parentId) {
      const parent = comments.find(c => c.id === data.parentId);
      if (parent && parent.replies) {
        parent.replies = parent.replies.filter(c => c.id !== data.id);
      }
    } else {
      const idx = comments.findIndex(c => c.id === data.id);
      if (idx !== -1) {
        comments.splice(idx, 1);
      }
    }
    
    saveComments(comments);
    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '操作失败' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
