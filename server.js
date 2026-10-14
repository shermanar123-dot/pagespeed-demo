require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.PAGESPEED_API_KEY;

app.use(express.static(path.join(__dirname, 'public')));

// Plain-English explanations for people without a web/marketing background
const CATEGORY_EXPLAINERS = {
  performance: 'How fast the page loads and becomes usable. Slow pages make visitors leave before they ever see your content, and Google ranks slow sites lower.',
  accessibility: 'How easy the site is to use for everyone, including people who are blind, colour-blind, or navigate with a keyboard instead of a mouse.',
  'best-practices': 'General "health checks" for security and modern standards. Problems here can make browsers show warnings or make the site feel broken.',
  seo: 'Search Engine Optimization: how easily Google can find, read, and show your page in search results. A low score means fewer people discover you.',
};

const AUDIT_EXPLAINERS = {
  'render-blocking-resources': 'Some files must fully download before the page shows anything, so visitors stare at a blank screen. Loading them later (or in the background) lets content appear sooner.',
  'unused-javascript': 'The page downloads code that it never actually uses. It is like mailing someone a 500-page manual when they only need one page — it wastes time, especially on phones.',
  'unused-css-rules': 'The page downloads styling instructions it never uses. Removing them makes the download smaller and the page faster.',
  'unminified-javascript': 'Code files contain extra spaces and comments that only humans need. "Minifying" strips those out so the files download faster.',
  'unminified-css': 'Style files contain extra spaces and comments. Squashing them ("minifying") makes them smaller and quicker to download.',
  'modern-image-formats': 'Images are saved in older, heavier formats. Newer formats (WebP/AVIF) look the same but are often half the size.',
  'uses-optimized-images': 'Pictures are bigger (in file size) than they need to be. Compressing them keeps them looking good while loading much faster.',
  'uses-responsive-images': 'The site sends huge images even to small phone screens. Sending a right-sized version for each device saves loading time.',
  'offscreen-images': 'Images far down the page load immediately, even though nobody sees them yet. "Lazy loading" waits until the visitor scrolls near them.',
  'uses-text-compression': 'Text files are sent uncompressed. Turning on compression (like zipping a file) makes them much smaller to send.',
  'server-response-time': 'The web server takes too long to start answering. This is like a shop where nobody comes to the counter — everything else waits on it.',
  'uses-long-cache-ttl': 'Visitors\' browsers are told to re-download the same files on every visit. Letting them remember (cache) files makes repeat visits faster.',
  'redirects': 'Visitors are bounced from one web address to another before reaching the real page (e.g. site.com → www.site.com → www.site.com/home). Each hop adds waiting time.',
  'uses-rel-preconnect': 'The page connects to other websites (fonts, analytics) only when it needs them. Telling the browser to connect early saves time.',
  'font-display': 'Text stays invisible while custom fonts download. Showing a normal font first means visitors can start reading immediately.',
  'legacy-javascript': 'The site sends extra code to support very old browsers that almost nobody uses anymore, making everyone download more.',
  'duplicated-javascript': 'The same code is downloaded more than once. Removing the copies makes the page lighter.',
  'efficient-animated-content': 'Animated GIFs are very heavy. Converting them to video files gives the same animation at a fraction of the size.',
  'prioritize-lcp-image': 'The main, most important image on the page is not loaded first. Telling the browser to fetch it early makes the page feel faster.',
  'lcp-lazy-loaded': 'The main image at the top of the page is set to load "later", which delays the most important thing visitors see.',
  'lcp-breakdown-insight': 'Breaks down why the main image or headline takes time to appear: waiting for the server, finding the file, downloading it, or drawing it on screen. It is a diagnosis, not a fix by itself.',
  'network-dependency-tree-insight': 'Some files can only start downloading after another file finishes, like a relay race. Long chains of "wait for this, then that" delay the page. Shortening the chain lets things load in parallel.',
  'cls-culprits-insight': 'Lists what is making the page jump around while loading — usually images without a set size, late-loading ads, or fonts swapping in. Those jumps cause people to tap the wrong thing.',
  'cache-insight': 'Visitors\' browsers are told to forget files quickly, so returning visitors download everything again. Letting browsers keep (cache) files longer makes repeat visits much faster.',
  'render-blocking-insight': 'Some files must fully download before the page shows anything, so visitors stare at a blank screen. Loading them later lets content appear sooner.',
  'image-delivery-insight': 'Images are larger than they need to be — wrong format, too big for the screen, or not compressed. Shrinking them is usually the easiest speed win.',
  'document-latency-insight': 'The very first file (the page itself) arrives slowly — because of a slow server, redirects, or no compression. Everything else waits on it.',
  'lcp-discovery-insight': 'The browser finds out about the main image too late. Pointing it out early in the page code lets the browser start downloading it immediately.',
  'forced-reflow-insight': 'The page\'s code keeps forcing the browser to re-measure the layout, which wastes time and makes the page feel sluggish.',
  'viewport-insight': 'The page is not set up for phone screens, so mobile visitors may have to pinch and zoom, and taps feel delayed.',
  'landmark-one-main': 'The page does not mark which part is the "main content". Screen readers use that marker to let blind visitors skip menus and jump straight to what matters.',
  'image-size-responsive': 'Some images look blurry because they are lower resolution than the screen showing them, especially on high-quality phone screens.',
  'layout-shifts': 'Things on the page move around after they appear, which is annoying and causes mis-taps.',
  'total-byte-weight': 'The page is simply very heavy — lots of data to download. This hurts most on mobile data and slow connections.',
  'dom-size': 'The page is built from a huge number of pieces. More pieces means the browser works harder and the page feels sluggish.',
  'bootup-time': 'Running the page\'s code takes a long time on the visitor\'s device, so the page looks ready but does not respond to taps right away.',
  'mainthread-work-breakdown': 'The browser is too busy doing work to react quickly when someone taps or scrolls, making the site feel laggy.',
  'third-party-summary': 'Outside services (ads, chat widgets, trackers) are slowing down the page. Each one adds loading time you do not fully control.',
  'largest-contentful-paint': 'How long until the main thing on the page (usually the big image or headline) appears. Visitors judge speed mostly by this moment.',
  'first-contentful-paint': 'How long until anything at all appears on screen. Until then, visitors see a blank page and may give up.',
  'speed-index': 'How quickly the page visibly fills in. A lower number means the page looks complete sooner.',
  'total-blocking-time': 'How long the page is "frozen" while loading — visitors tap but nothing happens. This feels broken and frustrating.',
  'interactive': 'How long until the page fully responds to clicks and taps.',
  'cumulative-layout-shift': 'How much things jump around while loading — like a button moving just as you tap it. Fixing this stops accidental clicks.',
  'max-potential-fid': 'The worst delay a visitor might feel between tapping something and the page reacting.',
  'image-alt': 'Images have no text description. Screen readers for blind visitors cannot describe them, and Google cannot understand them either.',
  'color-contrast': 'Some text is hard to read because its colour is too close to the background colour. This affects everyone, not just people with poor eyesight.',
  'button-name': 'Some buttons have no readable label, so screen readers just say "button" with no idea what it does.',
  'link-name': 'Some links have no readable text, so visitors using screen readers cannot tell where they lead.',
  'label': 'Form fields (like email boxes) have no label, so it is unclear what to type — especially for screen-reader users.',
  'html-has-lang': 'The page does not say what language it is in, so screen readers may pronounce it wrong.',
  'meta-description': 'The page is missing the short summary Google shows under your link in search results. Without it, Google guesses — often badly.',
  'document-title': 'The page has no title. That title is the clickable headline in Google results and the name on the browser tab.',
  'is-crawlable': 'The page is blocked from search engines, so it cannot show up in Google at all.',
  'tap-targets': 'Buttons or links are too small or too close together on phones, so people tap the wrong thing.',
  'link-text': 'Links say vague things like "click here". Descriptive text helps both visitors and Google understand where the link goes.',
  'is-on-https': 'Some parts of the site are not loaded securely. Browsers may show "Not secure" warnings, which scares visitors away.',
  'errors-in-console': 'The page has hidden errors behind the scenes. Something on it may be broken for some visitors.',
  'deprecations': 'The site uses outdated browser features that may stop working in future browser updates.',
  'unsized-images': 'Images do not say how big they will be, so the page jumps around as they load.',
};

function explainAudit(a) {
  if (AUDIT_EXPLAINERS[a.id]) return AUDIT_EXPLAINERS[a.id];
  // Newer Lighthouse versions rename audits to "<name>-insight"; reuse the older explanation if we have one
  const baseId = a.id.replace(/-insight$/, '');
  if (AUDIT_EXPLAINERS[baseId]) return AUDIT_EXPLAINERS[baseId];
  // Fallback: first sentence of Google's own description, keeping link text but dropping the URLs
  if (!a.description) return '';
  const text = a.description
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/Learn more.*$/i, '')
    .trim();
  const firstSentence = (text.match(/^.*?[.!?](\s|$)/) || [text])[0].trim();
  return firstSentence.length > 10 ? firstSentence : '';
}

// Measurements of what visitors feel ("symptoms"), as opposed to things you can fix
const METRIC_EXPLAINERS = {
  'first-contentful-paint': 'How long visitors stare at a blank screen before anything appears.',
  'largest-contentful-paint': 'How long until the main content (big image or headline) appears. Visitors judge speed mostly by this.',
  'speed-index': 'How quickly the page visibly fills in.',
  'total-blocking-time': 'How long the page is "frozen" while loading — taps and clicks do nothing.',
  'cumulative-layout-shift': 'How much things jump around while loading (0 is perfect).',
  'interactive': 'How long until the page fully responds to taps and clicks.',
  'max-potential-fid': 'The worst delay a visitor might feel between tapping something and the page reacting.',
};

// Services the vendor has shut down: the code still downloads and runs, but does nothing
const DEAD_SERVICES = [
  {
    name: 'Google Optimize',
    match: /googleoptimize\.com/,
    why: 'Google shut Optimize down in September 2023. The script still downloads and runs on every visit, but does nothing. Delete it.',
  },
  {
    name: 'Universal Analytics (old Google Analytics)',
    match: /google-analytics\.com\/(analytics|ga)\.js|[?&]tid=UA-|stats\.g\.doubleclick\.net\/(dc\.js|r\/__utm)/,
    why: 'Google stopped collecting Universal Analytics data in July 2023. If the site also has GA4 (IDs starting with "G-"), this old code can be deleted.',
  },
];

function shortUrl(u) {
  try {
    const x = new URL(u);
    let s = x.hostname.replace(/^www\./, '') + x.pathname;
    const id = x.searchParams.get('id');
    if (id) s += `?id=${id}`;
    return s.length > 80 ? s.slice(0, 77) + '…' : s;
  } catch {
    return String(u).slice(0, 80);
  }
}

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

// Biggest estimated time saving across Google's metrics (CLS is not a time, so it is skipped)
function savingsMs(a) {
  const m = a.metricSavings || {};
  return Math.round(Math.max(m.LCP || 0, m.FCP || 0, m.TBT || 0, m.INP || 0, (a.details && a.details.overallSavingsMs) || 0));
}

function savingsBytes(a) {
  const d = a.details || {};
  return Math.round(d.overallSavingsBytes || (d.debugData && d.debugData.wastedBytes) || 0);
}

// The specific files or page elements behind an audit, so people know where to look
function whereItems(a) {
  const items = a.details && Array.isArray(a.details.items) ? a.details.items : [];
  const seen = new Set();
  const out = [];
  for (const item of items) {
    let label = '';
    let note = '';
    if (typeof item.url === 'string' && !item.url.startsWith('data:')) {
      label = shortUrl(item.url);
      if (item.wastedMs) note = `blocks ${Math.round(item.wastedMs)} ms`;
      else if (item.wastedBytes) note = `${kb(item.wastedBytes)} wasted`;
      else if (item.totalBytes) note = kb(item.totalBytes);
    } else if (item.node) {
      label = item.node.nodeLabel || item.node.snippet || '';
      note = (item.node.explanation || '').split('\n').map((l) => l.trim()).find((l) => l && !/^Fix (all|any)/.test(l)) || '';
    }
    if (!label || seen.has(label)) continue;
    seen.add(label);
    out.push({ label: label.slice(0, 90), note: note.slice(0, 260) });
  }
  return { top: out.slice(0, 4), more: Math.max(0, out.length - 4) };
}

function analyze(lh) {
  const audits = lh.audits;

  // Which category (Performance, Accessibility…) each audit belongs to
  const categoryOf = {};
  Object.values(lh.categories).forEach((c) => (c.auditRefs || []).forEach((r) => (categoryOf[r.id] ||= c.title)));

  const symptoms = Object.keys(METRIC_EXPLAINERS)
    .filter((id) => audits[id] && audits[id].displayValue)
    .map((id) => ({
      id,
      title: audits[id].title,
      value: audits[id].displayValue,
      score: audits[id].score === null ? null : Math.round(audits[id].score * 100),
      explain: METRIC_EXPLAINERS[id],
    }));

  const failing = Object.values(audits).filter(
    (a) =>
      !METRIC_EXPLAINERS[a.id] &&
      a.score !== null && a.score !== undefined && a.score < 0.9 &&
      !['informative', 'manual', 'notApplicable', 'error'].includes(a.scoreDisplayMode)
  );

  // Speed fixes: things with a measurable payoff, biggest time saving first
  const speedFixes = failing
    .filter((a) => a.scoreDisplayMode !== 'binary')
    .map((a) => ({ a, ms: savingsMs(a), bytes: savingsBytes(a) }))
    .filter((f) => f.ms > 0 || f.bytes >= 20 * 1024)
    .sort((x, y) => y.ms - x.ms || y.bytes - x.bytes)
    .map(({ a, ms, bytes }) => ({
      id: a.id,
      title: a.title,
      savingsMs: ms,
      savingsKB: Math.round(bytes / 1024),
      explain: explainAudit(a),
      where: whereItems(a),
    }));

  // Pass/fail problems (accessibility, image quality…) that don't come with a time estimate
  const otherFixes = failing
    .filter((a) => a.scoreDisplayMode === 'binary')
    .map((a) => ({
      id: a.id,
      title: a.title,
      category: categoryOf[a.id] || '',
      explain: explainAudit(a),
      where: whereItems(a),
    }));

  // Dead and outdated code, spotted by recognising what is loaded
  const requests = (audits['network-requests'] && audits['network-requests'].details.items) || [];
  const blocking = (audits['render-blocking-insight'] && audits['render-blocking-insight'].details && audits['render-blocking-insight'].details.items) || [];
  const deadCode = [];
  for (const svc of DEAD_SERVICES) {
    const hits = requests.filter((r) => svc.match.test(r.url));
    if (!hits.length) continue;
    const blockMs = blocking.filter((b) => svc.match.test(b.url)).reduce((s, b) => s + (b.wastedMs || 0), 0);
    deadCode.push({
      name: svc.name,
      why: svc.why,
      kb: Math.round(hits.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
      blockMs: Math.round(blockMs),
      files: [...new Set(hits.filter((r) => r.resourceType === 'Script').map((r) => shortUrl(r.url)))].slice(0, 3),
    });
  }
  const libs = (audits['js-libraries'] && audits['js-libraries'].details && audits['js-libraries'].details.items) || [];
  const jq = libs.find((l) => l.name === 'jQuery' && l.version);
  if (jq) {
    const [major, minor] = jq.version.split('.').map(Number);
    if (major < 3 || (major === 3 && minor < 5)) {
      deadCode.push({
        name: `jQuery ${jq.version} (outdated)`,
        why: 'Versions of jQuery before 3.5 have known security holes. Not a big speed problem, but worth updating.',
        kb: 0,
        blockMs: 0,
        files: [],
        outdated: true,
      });
    }
  }

  return { symptoms, speedFixes, otherFixes, deadCode };
}

app.get('/api/check', async (req, res) => {
  const rawUrl = (req.query.url || '').trim();
  const checkStrategy = req.query.strategy === 'desktop' ? 'desktop' : 'mobile';

  if (!rawUrl) {
    return res.status(400).json({ error: 'Please enter a website URL.' });
  }
  if (!API_KEY || API_KEY === 'your-api-key-here') {
    return res.status(500).json({
      error: 'No API key found. Copy .env.example to .env, paste your real PageSpeed Insights API key, then restart the server.',
    });
  }

  // Be forgiving if someone types "store.google.com" without a protocol
  const targetUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
  const params = new URLSearchParams({ url: targetUrl, key: API_KEY, strategy: checkStrategy });
  categories.forEach((c) => params.append('category', c));

  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;

  try {
    const response = await fetch(psiUrl);
    const data = await response.json();

    if (!response.ok) {
      const message =
        (data && data.error && data.error.message) || `PageSpeed Insights returned an error (HTTP ${response.status}).`;
      return res.status(response.status).json({ error: message });
    }

    const lh = data.lighthouseResult;
    if (!lh) {
      return res.status(502).json({ error: 'Unexpected response from PageSpeed Insights.' });
    }

    const scores = Object.values(lh.categories).map((cat) => ({
      id: cat.id,
      title: cat.title,
      score: cat.score === null || cat.score === undefined ? null : Math.round(cat.score * 100),
    }));

    const fieldCategory = (data.loadingExperience && data.loadingExperience.overall_category) || null;
    const analysis = analyze(lh);

    // Generate actionable fixes for any category with score < 50
    const categoryFixes = scores
      .filter((s) => s.score !== null && s.score < 50)
      .map((s) => {
        let advice = [];
        if (s.id === 'performance') {
          advice = [
            { tip: 'Compress and convert heavy images to modern WebP / AVIF formats.',
              explain: 'Photos are usually the heaviest part of a page. Saving them in a newer format shrinks them a lot without visible quality loss, so the page appears faster.' },
            { tip: 'Eliminate render-blocking JavaScript & CSS scripts.',
              explain: 'Some code files make the browser wait before showing anything. Loading them later means visitors see your content first instead of a blank screen.' },
            { tip: 'Implement server HTTP caching and leverage a CDN for static assets.',
              explain: 'Caching lets returning visitors reuse files they already downloaded. A CDN stores copies of your site around the world, so it loads from a server close to each visitor.' }
          ];
        } else if (s.id === 'accessibility') {
          advice = [
            { tip: 'Add descriptive alt text to all <img> elements.',
              explain: 'Alt text is a short written description of each image. Blind visitors hear it read aloud, and Google uses it to understand your pictures.' },
            { tip: 'Increase color contrast ratio between text and background colors.',
              explain: 'Light grey text on a white background is hard to read. Stronger contrast makes text readable for everyone, including on phones in sunlight.' },
            { tip: 'Ensure all interactive elements have visible focus states and aria-labels.',
              explain: 'Some people use the keyboard (Tab key) instead of a mouse. They need to see which button is selected, and screen readers need a name for every button.' }
          ];
        } else if (s.id === 'best-practices') {
          advice = [
            { tip: 'Ensure all resources and API requests are served over HTTPS.',
              explain: 'HTTPS is the padlock in the address bar. Without it, browsers may warn visitors the site is "Not secure", which damages trust.' },
            { tip: 'Resolve unhandled console errors and deprecated API usages.',
              explain: 'The site has hidden errors or uses outdated features. Visitors may not see them yet, but parts of the site could break without warning.' },
            { tip: 'Provide explicit width and height attributes on images to prevent layout shifts.',
              explain: 'If the page does not know an image\'s size ahead of time, content jumps around as it loads, causing people to tap the wrong thing.' }
          ];
        } else if (s.id === 'seo') {
          advice = [
            { tip: 'Include unique <title> and <meta name="description"> tags on every page.',
              explain: 'The title and description are the headline and summary Google shows in search results. Good ones make people more likely to click on you.' },
            { tip: 'Ensure touch targets (links/buttons) are spaced adequately for mobile screens.',
              explain: 'Tiny or crowded buttons are frustrating on phones. Google ranks mobile-friendly sites higher because most searches happen on phones.' },
            { tip: 'Verify pages are crawlable and include structured metadata.',
              explain: '"Crawlable" means Google\'s robot is allowed to read the page. Structured metadata is hidden labels (e.g. price, rating) that help Google show richer results.' }
          ];
        }
        return {
          category: s.title,
          score: s.score,
          explain: CATEGORY_EXPLAINERS[s.id] || '',
          advice
        };
      });

    res.json({
      finalUrl: lh.finalUrl || targetUrl,
      strategy: checkStrategy,
      scores,
      ...analysis,
      categoryFixes,
      fieldCategory,
      raw: data, // full raw response
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not reach PageSpeed Insights. Check your internet connection and try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`\nPageSpeed demo running!`);
  console.log(`Open http://localhost:${PORT} in your browser.\n`);
});
