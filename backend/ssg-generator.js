import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * SSG (Static Site Generation) - генерирует статические HTML страницы для каждой статьи
 * Помогает Яндексу и Google быстро индексировать контент
 */

const generateArticleHTML = (article) => {
  const slug = article.slug || article.title.toLowerCase().replace(/[^а-яa-z0-9]/g, '-').slice(0, 50);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${article.title} | PROBOOST</title>
  <meta name="description" content="${article.excerpt}" />
  <meta name="keywords" content="${article.tags?.join(', ') || article.category}" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${article.title}" />
  <meta property="og:description" content="${article.excerpt}" />
  <meta property="og:image" content="${article.imageUrl}" />
  <meta property="og:url" content="https://pro-boost.ru/articles/${slug}" />
  <meta property="article:published_time" content="${article.publishedAt}" />
  <meta property="article:section" content="${article.category}" />
  ${article.tags?.map(tag => `<meta property="article:tag" content="${tag}" />`).join('\n  ')}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${article.title}" />
  <meta name="twitter:description" content="${article.excerpt}" />
  <meta name="twitter:image" content="${article.imageUrl}" />

  <!-- Canonical -->
  <link rel="canonical" href="https://pro-boost.ru/articles/${slug}" />

  <!-- JSON-LD Article Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "${article.title}",
    "description": "${article.excerpt}",
    "image": "${article.imageUrl}",
    "datePublished": "${article.publishedAt}",
    "author": {
      "@type": "Organization",
      "name": "PROBOOST Agency"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PROBOOST Agency",
      "logo": "https://i.ibb.co/0pzdjPSh/Chat-GPT-Image-22-2025-12-19-19.png"
    }
  }
  </script>

  <!-- Яндекс.Метрика -->
  <script type="text/javascript">
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, "script", "https://mc.yandex.ru/metrica/tag.js", "ym");

    ym(99999999, "init", {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true
    });
  </script>
</head>
<body>
  <div class="prose-article">
    <h1>${article.title}</h1>
    <div class="metadata">
      <span class="category">${article.category}</span>
      <span class="date">${new Date(article.publishedAt).toLocaleDateString('ru-RU')}</span>
      <span class="read-time">${article.readTime} мин</span>
    </div>
    <img src="${article.imageUrl}" alt="${article.title}" class="article-image" />
    <div class="content">
      ${article.content}
    </div>
  </div>

  <!-- Redirect to React SPA after 2 seconds -->
  <script>
    setTimeout(() => {
      window.location.href = 'https://pro-boost.ru/#/blog/${slug}';
    }, 2000);
  </script>
</body>
</html>`;
};

/**
 * Генерирует статические HTML файлы для Яндекс.ДзенаЭто упрощает публикацию контента
 */
const generateDzenArticle = (article) => {
  return {
    title: article.title,
    text: article.content
      .replace(/<[^>]*>/g, '') // Удаляем HTML теги
      .slice(0, 5000), // Ограничиваем размер
    coverUrl: article.imageUrl,
    rubric: article.category,
    keywords: article.tags || [],
  };
};

/**
 * Экспортирует данные для Яндекс.ДзенаФормат: JSON для API публикации
 */
export const exportToYandexDzen = (articles) => {
  return {
    articles: articles.map(a => generateDzenArticle(a)),
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
};

/**
 * Генерирует sitemap.xml для Яндекса
 */
export const generateSitemap = (articles) => {
  const urls = [
    { loc: 'https://pro-boost.ru/', lastmod: new Date().toISOString().split('T')[0], priority: '1.0' },
    { loc: 'https://pro-boost.ru/#/blog', lastmod: new Date().toISOString().split('T')[0], priority: '0.9' },
    ...articles.map(a => ({
      loc: `https://pro-boost.ru/articles/${a.slug}`,
      lastmod: a.publishedAt.split('T')[0],
      priority: '0.8'
    }))
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
};

/**
 * Генерирует RSS feed для Яндекс.РСС
 */
export const generateRSS = (articles) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>PROBOOST Blog</title>
    <link>https://pro-boost.ru/</link>
    <description>Маркетинг для доставки еды и ресторанов</description>
    <language>ru-ru</language>
${articles.slice(0, 20).map(a => `    <item>
      <title>${a.title}</title>
      <link>https://pro-boost.ru/#/blog/${a.slug}</link>
      <description>${a.excerpt}</description>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <category>${a.category}</category>
      <content:encoded><![CDATA[${a.content}]]></content:encoded>
    </item>`).join('\n')}
  </channel>
</rss>`;
};

export default {
  generateArticleHTML,
  generateDzenArticle,
  exportToYandexDzen,
  generateSitemap,
  generateRSS
};
