/**
 * CreatorPilot 30-Second Prototype Demo Video Recorder
 * Uses free open-source Playwright to capture the full 30s scripted sequence.
 * 
 * Timeline:
 *  0-5s:   Paste long video URL
 *  5-13s:  Tension beats found, vertical 9:16 reels appear
 *  13-21s: Thumbnail variants with OpenCV heatmaps bloom, winner picked
 *  21-27s: Comment agent replies in creator voice with human approval
 *  27-30s: Logo reveal + tagline "Your content team of one-click agents"
 * 
 * Outputs:
 *  /demo/creatorpilot-30s.mp4
 *  /demo/creatorpilot-vertical-30s.mp4
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function recordDemo(options = { vertical: false }) {
  const isVertical = options.vertical;
  const width = isVertical ? 1080 : 1920;
  const height = isVertical ? 1920 : 1080;
  const outputFilename = isVertical ? 'creatorpilot-vertical-30s.mp4' : 'creatorpilot-30s.mp4';
  const recordingsDir = path.join(__dirname, 'recordings');

  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }

  console.log(`[RecordDemo] Starting recording: ${width}x${height} -> ${outputFilename}`);
  
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: {
      dir: recordingsDir,
      size: { width, height }
    }
  });

  const page = await context.newPage();
  const targetUrl = process.env.APP_URL || 'http://localhost:3000';

  console.log(`[RecordDemo] Navigating to ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  // Inject High-Visibility On-Screen Captions and Cursor Highlighter
  await page.evaluate(() => {
    const banner = document.createElement('div');
    banner.id = 'demo-caption-banner';
    banner.style.position = 'fixed';
    banner.style.bottom = '30px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.zIndex = '99999';
    banner.style.background = 'rgba(7, 8, 10, 0.95)';
    banner.style.border = '1px solid #22D3EE';
    banner.style.boxShadow = '0 0 25px rgba(34, 211, 238, 0.4)';
    banner.style.borderRadius = '14px';
    banner.style.padding = '12px 24px';
    banner.style.color = '#FFFFFF';
    banner.style.fontFamily = 'monospace';
    banner.style.fontSize = '16px';
    banner.style.fontWeight = 'bold';
    banner.style.pointerEvents = 'none';
    banner.innerText = '0-5s: Ingesting Longform Video via Free Local faster-whisper';
    document.body.appendChild(banner);
  });

  const updateCaption = async (text) => {
    console.log(`[Demo Stage] ${text}`);
    await page.evaluate((t) => {
      const el = document.getElementById('demo-caption-banner');
      if (el) el.innerText = t;
    }, text);
  };

  // 0-5s: Ingesting & Pasting Video URL
  await page.waitForTimeout(1000);
  await updateCaption('0-5s: Ingesting Video URL (Zero Cloud Fees, Local CPU Processing)');
  await page.waitForTimeout(4000);

  // 5-13s: Tension Beat Detection & Timeline
  await page.evaluate(() => {
    const el = document.getElementById('dashboard');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
  await updateCaption('5-13s: Tension Beat Detector maps acoustic energy & WPM pace into 9:16 peaks');
  await page.waitForTimeout(8000);

  // 13-21s: Thumbnail Lab & Saliency Heatmap
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const thumbTab = buttons.find(b => b.innerText.includes('Thumbnail Lab'));
    if (thumbTab) thumbTab.click();
  });
  await updateCaption('13-21s: OpenCV Spectral Residual computes visual saliency & eye-gaze heatmap');
  await page.waitForTimeout(8000);

  // 21-27s: Persona Studio & Community Approval Queue
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const personaTab = buttons.find(b => b.innerText.includes('Persona Studio'));
    if (personaTab) personaTab.click();
  });
  await updateCaption('21-27s: Community Agent drafts replies in creator voice with human approval gate');
  await page.waitForTimeout(6000);

  // 27-30s: Logo & Tagline
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  await updateCaption('27-30s: CreatorPilot: Your content team of one-click agents (100% Free)');
  await page.waitForTimeout(3000);

  console.log('[RecordDemo] Demo sequence finished. Closing browser context...');
  await page.close();
  await context.close();
  await browser.close();

  // Find saved video and rename
  const videoFiles = fs.readdirSync(recordingsDir).filter(f => f.endsWith('.webm') || f.endsWith('.mp4'));
  if (videoFiles.length > 0) {
    const latest = videoFiles[videoFiles.length - 1];
    const srcPath = path.join(recordingsDir, latest);
    const destPath = path.join(__dirname, outputFilename);
    fs.copyFileSync(srcPath, destPath);
    console.log(`[RecordDemo] Saved demo video to: ${destPath}`);
  }
}

if (require.main === module) {
  recordDemo({ vertical: false })
    .then(() => console.log('Demo recording complete!'))
    .catch((err) => console.error('Demo recording error:', err));
}

module.exports = { recordDemo };
