import { execSync } from 'child_process';
import path from 'path';

function getChangedUrls() {
  try {
    // Check if there are unstaged or staged changes. If working tree is clean,
    // check the diff between HEAD~1 and HEAD to find what was just committed/deployed.
    let diffCmd = 'git diff --name-only'; // unstaged
    const unstaged = execSync(diffCmd, { encoding: 'utf-8' }).trim();
    
    diffCmd = 'git diff --cached --name-only'; // staged
    const staged = execSync(diffCmd, { encoding: 'utf-8' }).trim();

    let diffFiles = (unstaged + '\n' + staged).split('\n').filter(Boolean);

    // If no uncommitted changes, look at the last commit
    if (diffFiles.length === 0) {
      diffFiles = execSync('git diff HEAD~1 HEAD --name-only', { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
    }

    if (diffFiles.length === 0) {
      console.log('No changed files detected.');
      return;
    }

    // De-duplicate
    diffFiles = [...new Set(diffFiles)];

    const hasGlobalLayoutChange = diffFiles.some(file => 
      file.startsWith('src/layouts/') || 
      file.startsWith('src/components/Header') || 
      file.startsWith('src/components/Footer') ||
      file.startsWith('src/styles/') ||
      file === 'astro.config.mjs'
    );

    if (hasGlobalLayoutChange) {
      console.warn('\n⚠️ GLOBAL TEMPLATE CHANGE DETECTED.');
      console.warn('Files like Layouts, Header, Footer, or Config were modified.');
      console.warn('This may affect all 400+ pages. Please manually decide if you want to submit all URLs to IndexNow.');
      console.warn('We will only list the directly modified content files here.\n');
    }

    const changedUrls = new Set();
    const domain = 'https://bestjichang.com';

    diffFiles.forEach(file => {
      // Pages
      if (file.startsWith('src/pages/') && file.endsWith('.astro')) {
        let route = file.replace('src/pages/', '').replace('.astro', '');
        if (route === 'index') route = '';
        if (route.endsWith('/index')) route = route.replace('/index', '');
        changedUrls.add(`${domain}/${route}${route ? '/' : ''}`);
      }
      // Blog posts
      else if (file.startsWith('src/content/blog/') && (file.endsWith('.md') || file.endsWith('.mdx'))) {
        let slug = file.replace('src/content/blog/', '').replace(/\.mdx?$/, '');
        changedUrls.add(`${domain}/blog/${slug}/`);
      }
    });

    if (changedUrls.size === 0) {
      console.log('No eligible URL changes found (only config/components/layouts changed without direct page changes).');
      return;
    }

    const urlList = Array.from(changedUrls);
    console.log('--- Changed URLs ---');
    urlList.forEach(u => console.log(u));
    
    // Also output as space-separated for easy piping
    console.log('\nTo submit these URLs to IndexNow, run:');
    console.log(`npm run indexnow -- ${urlList.join(' ')}\n`);

  } catch (e) {
    console.error('Error getting changed URLs:', e.message);
  }
}

getChangedUrls();
