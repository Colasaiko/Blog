  import fs from 'fs';
import path from 'path';

const KEY = '9b9a4c8c72cf44bba027be1ad6769994';
const HOST = 'bestjichang.com';
const KEY_LOCATION = 'https://bestjichang.com/9b9a4c8c72cf44bba027be1ad6769994.txt';

async function submitIndexNow() {
  try {
    const sitemapPath = path.resolve('dist/sitemap-0.xml');
    if (!fs.existsSync(sitemapPath)) {
      console.warn('Sitemap not found, skipping IndexNow submission.');
      return;
    }

    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
    if (!urlMatches) {
      console.warn('No URLs found in sitemap, skipping IndexNow submission.');
      return;
    }

    const urlList = urlMatches.map(match => match.replace(/<\/?loc>/g, '').trim());

    if (urlList.length === 0) {
      return;
    }

    const payload = {
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urlList
    };

    console.log(`Submitting ${urlList.length} URLs to IndexNow...`);

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('IndexNow submission successful.');
    } else {
      console.warn(`IndexNow submission failed with status: ${response.status}`);
    }
  } catch (error) {
    console.warn('IndexNow submission error:', error.message);
  }
}

submitIndexNow();
