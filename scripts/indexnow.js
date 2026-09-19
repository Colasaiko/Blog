import fs from 'fs';
import path from 'path';

const KEY = '9b9a4c8c72cf44bba027be1ad6769994';
const HOST = 'bestjichang.com';
const KEY_LOCATION = 'https://bestjichang.com/9b9a4c8c72cf44bba027be1ad6769994.txt';
const HISTORY_FILE = path.resolve('.indexnow-history.json');

function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

async function submitIndexNow() {
  try {
    // 1. Get URLs from command line arguments
    let urlList = process.argv.slice(2);

    if (urlList.length === 0) {
      console.log('No changed URLs supplied. Nothing submitted.');
      return;
    }

    urlList = urlList.filter(url => url.startsWith('http'));
    
    if (urlList.length === 0) {
      console.log('No valid URLs supplied. Nothing submitted.');
      return;
    }

    // Dedup and filter by history (optional safety check)
    urlList = [...new Set(urlList)];
    const history = loadHistory();
    const now = Date.now();
    
    // We only skip if it was submitted very recently (e.g. last 12 hours) to avoid accidental spam
    const filteredUrls = urlList.filter(u => {
      const lastSubmitted = history[u];
      if (lastSubmitted && (now - lastSubmitted) < 12 * 60 * 60 * 1000) {
        console.log(`[IndexNow] Skipping ${u} (already submitted within 12 hours)`);
        return false;
      }
      return true;
    });

    if (filteredUrls.length === 0) {
      console.log('All supplied URLs were recently submitted. Nothing to do.');
      return;
    }

    // 2. Verify Key File is accessible
    try {
      const keyCheckRes = await fetch(KEY_LOCATION);
      if (!keyCheckRes.ok) {
        throw new Error(`Key file returned status ${keyCheckRes.status}`);
      }
    } catch (e) {
      console.error(`Error: Key file check failed. Cannot access ${KEY_LOCATION}. Aborting submission. (${e.message})`);
      process.exit(1);
    }

    // 3. Prepare Payload
    const payload = {
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: filteredUrls
    };

    console.log(`[IndexNow] Time: ${new Date().toISOString()}`);
    console.log(`[IndexNow] Host: ${HOST}`);
    console.log(`[IndexNow] Key Location: ${KEY_LOCATION}`);
    console.log(`[IndexNow] Submitting ${filteredUrls.length} URLs...`);
    console.log(`[IndexNow] URL List:\n${filteredUrls.map(u => '  - ' + u).join('\n')}`);

    // 4. Submit
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    console.log(`[IndexNow] HTTP Status: ${response.status}`);
    
    // Check if there is a response body to print
    const text = await response.text();
    if (text) {
      console.log(`[IndexNow] Response Body: ${text}`);
    }

    if (response.ok || response.status === 202) {
      console.log('[IndexNow] Submission successful.');
      // Save to history
      filteredUrls.forEach(u => {
        history[u] = now;
      });
      saveHistory(history);
    } else {
      console.warn(`[IndexNow] Submission failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('[IndexNow] Submission error:', error.message);
  }
}

submitIndexNow();
