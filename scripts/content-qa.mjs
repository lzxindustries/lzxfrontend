import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

function getFiles(dir, ext = '.md') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const f of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) results.push(...getFiles(full, ext));
    else if (f.name.endsWith(ext)) results.push(full);
  }
  return results;
}

const docFiles = getFiles('content/docs');
const blogFiles = getFiles('content/blog');
const allFiles = [...docFiles, ...blogFiles];

console.log('=== CONTENT QA SWEEP ===');
console.log(`Doc files: ${docFiles.length} | Blog files: ${blogFiles.length}`);

const internalLinkRe = /\[([^\]]*)\]\(([^)]+)\)/g;
const filesNeedingEdits = [];

for (const file of allFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const {content} = matter(raw);
  let match;
  const fileIssues = [];

  // Check markdown links
  const linkRe = new RegExp(internalLinkRe.source, 'g');
  while ((match = linkRe.exec(content)) !== null) {
    const href = match[2];
    if (/^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('#')) continue;

    if (href.includes('/docs/category/')) {
      fileIssues.push(`Docusaurus category link: ${href}`);
      continue;
    }

    if (href.endsWith('.md') || /\.md[#?]/.test(href)) {
      const hrefPath = href.split(/[#?]/)[0];
      let resolved;
      if (hrefPath.startsWith('/')) {
        resolved = path.join('content', hrefPath);
      } else {
        resolved = path.resolve(path.dirname(file), hrefPath);
      }
      if (!fs.existsSync(resolved)) {
        fileIssues.push(`Unresolved .md link: ${href} -> ${resolved}`);
      }
    }

    if (href.startsWith('/docs/') && !href.endsWith('.md') && !/\.md[#?]/.test(href) && href.includes('category')) {
      fileIssues.push(`Potential broken category link: ${href}`);
    }
  }

  // Check markdown image references
  const imgRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((match = imgRe.exec(content)) !== null) {
    const src = match[2];
    if (/^https?:\/\//.test(src)) continue;

    let found = false;

    if (src.startsWith('/')) {
      let imgPath = path.join('public', src);
      // Mirror the markdown renderer's /img/ → /docs/img/ rewrite
      if (src.startsWith('/img/')) {
        imgPath = path.join('public/docs', src);
      }
      found = fs.existsSync(imgPath);
    } else {
      // relative path - check relative to file
      const imgPath = path.resolve(path.dirname(file), src);
      found = fs.existsSync(imgPath);
      if (!found) {
        // try public/docs/img mapping for docs
        const relToContent = path.relative('content/docs', file);
        if (!relToContent.startsWith('..')) {
          const fileDir = path.dirname(relToContent);
          const candidate = path.join('public/docs/img', fileDir, src);
          found = fs.existsSync(candidate);
        }
      }
    }

    if (!found) {
      fileIssues.push(`Missing image: ${src}`);
    }
  }

  // Check HTML img tags
  const htmlImgRe = /<img[^>]+src=["']([^"']+)["']/g;
  while ((match = htmlImgRe.exec(content)) !== null) {
    const src = match[1];
    if (/^https?:\/\//.test(src)) continue;
    if (src.startsWith('/')) {
      let imgPath = path.join('public', src);
      if (src.startsWith('/img/')) {
        imgPath = path.join('public/docs', src);
      }
      if (!fs.existsSync(imgPath)) {
        fileIssues.push(`Missing HTML image: ${src}`);
      }
    }
  }

  if (fileIssues.length > 0) {
    filesNeedingEdits.push({file: path.relative('.', file), issues: fileIssues});
  }
}

console.log();
if (filesNeedingEdits.length === 0) {
  console.log('✅ No issues found across all content files!');
} else {
  console.log(`⚠️  Issues found in ${filesNeedingEdits.length} files:`);
  let totalIssues = 0;
  for (const {file, issues} of filesNeedingEdits) {
    console.log();
    console.log(`  ${file}`);
    for (const i of issues) {
      console.log(`    - ${i}`);
      totalIssues++;
    }
  }
  console.log();
  console.log(`Total: ${totalIssues} issues in ${filesNeedingEdits.length} files`);
}
