export const prerender = false;

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

export async function GET({ locals }) {
  try {
    const db = locals.runtime.env.DB;
    // Query all comments, order by created_at desc for top level, asc for replies (or let JS handle sorting)
    const { results } = await db.prepare('SELECT * FROM comments ORDER BY created_at ASC').all();
    
    // Assemble nested structure
    const topLevelMap = new Map();
    const replies = [];

    for (const row of results) {
      const comment = {
        id: row.id,
        username: row.username,
        text: row.text,
        createdAt: row.created_at,
        likes: row.likes,
        replies: []
      };

      if (row.parent_id) {
        if (row.reply_to_user) {
          comment.replyToUser = row.reply_to_user;
        }
        comment.parentId = row.parent_id;
        replies.push(comment);
      } else {
        topLevelMap.set(row.id, comment);
      }
    }

    // Attach replies to their parents
    for (const reply of replies) {
      const parent = topLevelMap.get(reply.parentId);
      if (parent) {
        parent.replies.push(reply);
      }
    }

    // Convert map to array and sort by created_at DESC (as the original JSON was reversed)
    const finalComments = Array.from(topLevelMap.values()).sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return new Response(JSON.stringify(finalComments), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request, clientAddress, locals }) {
  try {
    const db = locals.runtime.env.DB;
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
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const createdAt = new Date().toISOString();
    
    const newComment = {
      id,
      username,
      text: safeText,
      createdAt,
      likes: 0
    };

    let parent_id = null;
    let reply_to_user = null;

    if (data.parentId) {
      // 验证父评论是否存在
      const { results: parentRes } = await db.prepare('SELECT id FROM comments WHERE id = ?').bind(data.parentId).all();
      if (parentRes.length > 0) {
        parent_id = data.parentId;
        if (data.replyToUser && typeof data.replyToUser === 'string') {
          reply_to_user = escapeHTML(data.replyToUser.substring(0, 50));
          newComment.replyToUser = reply_to_user;
        }
      } else {
        return new Response(JSON.stringify({ error: '父评论不存在' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      newComment.replies = [];
    }

    await db.prepare(
      'INSERT INTO comments (id, username, text, created_at, likes, parent_id, reply_to_user) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id, username, safeText, createdAt, 0, parent_id, reply_to_user
    ).run();

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

export async function DELETE({ request, locals }) {
  try {
    const db = locals.runtime.env.DB;
    const data = await request.json();
    const ADMIN_PASS = import.meta.env.ADMIN_PASS || process.env.ADMIN_PASS; 
    if (data.password !== ADMIN_PASS) {
      return new Response(JSON.stringify({ error: '授权失败' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (data.parentId) {
      // 删除回复
      await db.prepare('DELETE FROM comments WHERE id = ? AND parent_id = ?').bind(data.id, data.parentId).run();
    } else {
      // 删除顶级评论及其回复
      await db.prepare('DELETE FROM comments WHERE id = ? OR parent_id = ?').bind(data.id, data.id).run();
    }
    
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
