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

const STRICT = process.argv.includes('--strict');

const docFiles = getFiles('content/docs');
const blogFiles = getFiles('content/blog');
const allFiles = [...docFiles, ...blogFiles];

console.log('=== CONTENT QA SWEEP ===');
console.log(`Doc files: ${docFiles.length} | Blog files: ${blogFiles.length}`);

const internalLinkRe = /\[([^\]]*)\]\(([^)]+)\)/g;
const filesNeedingEdits = [];

// Publish-safety guards. Folders whose name starts with `tbd-` or
// `_archived-` are treated as placeholder blog posts: they must never
// ship as `draft: false`, and their bodies commonly carry an explicit
// "DO NOT PUBLISH" sentinel we also match on.
const BLOG_PLACEHOLDER_PREFIXES = ['tbd-', '_archived-'];
const PLACEHOLDER_BODY_SENTINEL = /PLACEHOLDER CONTENT\s*-\s*DO NOT PUBLISH/i;
const BLOG_DATE_PREFIX_RE = /^(\d{4})-(\d{2})-(\d{2})-/;
const TODAY_ISO = new Date().toISOString().slice(0, 10);

function isBlogFile(file) {
  return file.startsWith('content/blog/');
}

function isDocFile(file) {
  return file.startsWith('content/docs/');
}

function blogFolderName(file) {
  const rel = path.relative('content/blog', file);
  return rel.split(path.sep)[0] ?? '';
}

for (const file of allFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  const {content, data: fm} = parsed;
  const isDraft = Boolean(fm?.draft);
  let match;
  const fileIssues = [];

  // ---- Frontmatter / publish-safety checks ----

  if (isDocFile(file) && !isDraft) {
    const title = typeof fm?.title === 'string' ? fm.title.trim() : '';
    const description =
      typeof fm?.description === 'string' ? fm.description.trim() : '';
    if (!title) {
      fileIssues.push('Missing frontmatter `title` on public doc');
    }
    if (!description) {
      fileIssues.push('Missing frontmatter `description` on public doc');
    }
  }

  if (isBlogFile(file)) {
    const folder = blogFolderName(file);
    const isPlaceholderFolder = BLOG_PLACEHOLDER_PREFIXES.some((p) =>
      folder.startsWith(p),
    );
    const hasPlaceholderBody = PLACEHOLDER_BODY_SENTINEL.test(content);

    if ((isPlaceholderFolder || hasPlaceholderBody) && !isDraft) {
      fileIssues.push(
        `Placeholder blog post is not drafted (folder "${folder}"). ` +
          'Set `draft: true` in frontmatter or move the folder outside content/blog.',
      );
    }

    const dateMatch = folder.match(BLOG_DATE_PREFIX_RE);
    if (dateMatch && !isDraft) {
      const folderDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
      if (folderDate > TODAY_ISO) {
        fileIssues.push(
          `Future-dated blog post (${folderDate}) is not drafted. Set \`draft: true\` until publish day.`,
        );
      }
    }
  }

  // Check markdown links
  const linkRe = new RegExp(internalLinkRe.source, 'g');
  while ((match = linkRe.exec(content)) !== null) {
    const href = match[2];
    if (
      /^https?:\/\//.test(href) ||
      href.startsWith('mailto:') ||
      href.startsWith('#')
    )
      continue;

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

    if (
      href.startsWith('/docs/') &&
      !href.endsWith('.md') &&
      !/\.md[#?]/.test(href) &&
      href.includes('category')
    ) {
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
    filesNeedingEdits.push({
      file: path.relative('.', file),
      issues: fileIssues,
    });
  }
}

console.log();
if (filesNeedingEdits.length === 0) {
  console.log('No issues found across all content files.');
  process.exit(0);
}

console.log(`Issues found in ${filesNeedingEdits.length} files:`);
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
console.log(
  `Total: ${totalIssues} issues in ${filesNeedingEdits.length} files`,
);

// In strict mode, exit non-zero so CI can block merges on content
// regressions (broken links, missing metadata, accidental publication).
if (STRICT) {
  process.exit(1);
}
