import fs from 'node:fs';
import path from 'node:path';

// Generate a valid minimal WAV audio file buffer with pleasant synth chords
export function generateValidWavBuffer(frequency = 440, durationSeconds = 12): Buffer {
  const sampleRate = 44100;
  const numSamples = sampleRate * durationSeconds;
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Synthesize a soothing ambient harmonic tone
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Ambient chord progression
    const chordFreq = t < 3 ? frequency : t < 6 ? frequency * 1.25 : t < 9 ? frequency * 1.5 : frequency * 1.333;
    const envelope = Math.min(1, t / 0.5) * Math.max(0, (durationSeconds - t) / 1.5);
    const sample = Math.sin(2 * Math.PI * chordFreq * t) * 0.4 +
                   Math.sin(2 * Math.PI * (chordFreq * 1.5) * t) * 0.2 +
                   Math.sin(2 * Math.PI * (chordFreq * 2.0) * t) * 0.1;
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * envelope * 24000)));

    // Left channel
    buffer.writeInt16LE(intSample, offset);
    // Right channel (subtle phase shift)
    const rightSample = Math.sin(2 * Math.PI * chordFreq * (t + 0.001)) * 0.4;
    const intRight = Math.max(-32768, Math.min(32767, Math.floor(rightSample * envelope * 24000)));
    buffer.writeInt16LE(intRight, offset + 2);
    offset += 4;
  }

  return buffer;
}

// Generate high-fidelity SVG graphics as real image files
export function generateSvgImage(title: string, subtitle: string, primaryColor: string, secondaryColor: string, type: 'photo' | 'screenshot' | 'wallpaper'): string {
  if (type === 'screenshot') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1e2e"/>
          <stop offset="100%" stop-color="#11111b"/>
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${primaryColor}"/>
          <stop offset="100%" stop-color="${secondaryColor}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g1)"/>
      <!-- Window frame -->
      <rect x="40" y="40" width="1120" height="720" rx="16" fill="#181825" stroke="#313244" stroke-width="2"/>
      <rect x="40" y="40" width="1120" height="48" rx="16" fill="#1e1e2e"/>
      <circle cx="70" cy="64" r="6" fill="#f38ba8"/>
      <circle cx="92" cy="64" r="6" fill="#f9e2af"/>
      <circle cx="114" cy="64" r="6" fill="#a6e3a1"/>
      <text x="140" y="70" fill="#cdd6f4" font-family="system-ui, sans-serif" font-size="14" font-weight="500">${title}</text>
      <!-- Content mock -->
      <rect x="70" y="120" width="280" height="600" rx="12" fill="#1e1e2e" stroke="#313244"/>
      <rect x="380" y="120" width="740" height="180" rx="12" fill="url(#accent)" opacity="0.9"/>
      <text x="420" y="210" fill="#ffffff" font-family="system-ui, sans-serif" font-size="32" font-weight="700">${title}</text>
      <text x="420" y="250" fill="#ffffff" opacity="0.85" font-family="system-ui, sans-serif" font-size="16">${subtitle}</text>
      <!-- Grid mock cards -->
      <rect x="380" y="330" width="230" height="180" rx="10" fill="#24273a" stroke="#363a4f"/>
      <rect x="635" y="330" width="230" height="180" rx="10" fill="#24273a" stroke="#363a4f"/>
      <rect x="890" y="330" width="230" height="180" rx="10" fill="#24273a" stroke="#363a4f"/>
      <rect x="380" y="535" width="230" height="180" rx="10" fill="#24273a" stroke="#363a4f"/>
      <rect x="635" y="535" width="230" height="180" rx="10" fill="#24273a" stroke="#363a4f"/>
      <rect x="890" y="535" width="230" height="180" rx="10" fill="#24273a" stroke="#363a4f"/>
    </svg>`;
  }

  // Realistic landscape or wallpaper artwork
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
    <defs>
      <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}"/>
        <stop offset="60%" stop-color="${secondaryColor}"/>
        <stop offset="100%" stop-color="#fdba74"/>
      </linearGradient>
      <radialGradient id="sun" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="40%" stop-color="#fef08a" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
      </radialGradient>
      <filter id="blur">
        <feGaussianBlur stdDeviation="30"/>
      </filter>
    </defs>
    <rect width="1200" height="800" fill="url(#sky)"/>
    <circle cx="600" cy="360" r="140" fill="url(#sun)" filter="url(#blur)"/>
    <circle cx="600" cy="360" r="70" fill="#fffbeb"/>
    <!-- Mountain ridges -->
    <path d="M0,800 L0,550 L200,420 L450,560 L750,380 L1020,540 L1200,440 L1200,800 Z" fill="#312e81" opacity="0.7"/>
    <path d="M0,800 L0,620 L150,510 L380,640 L620,490 L880,620 L1100,530 L1200,590 L1200,800 Z" fill="#1e1b4b" opacity="0.85"/>
    <path d="M0,800 L0,680 L280,590 L520,700 L840,580 L1150,680 L1200,660 L1200,800 Z" fill="#0f172a"/>
    <text x="60" y="100" fill="#ffffff" font-family="'Google Sans', system-ui, sans-serif" font-size="34" font-weight="700" letter-spacing="-0.5">${title}</text>
    <text x="60" y="140" fill="#ffffff" opacity="0.85" font-family="'Google Sans Text', system-ui, sans-serif" font-size="18">${subtitle}</text>
  </svg>`;
}

export function seedFilesystem(baseDir: string) {
  const usersDir = path.join(baseDir, 'Users', 'GoogleDesigner');

  const foldersToCreate = [
    path.join(usersDir, 'Desktop'),
    path.join(usersDir, 'Documents'),
    path.join(usersDir, 'Downloads'),
    path.join(usersDir, 'Pictures', 'Camera'),
    path.join(usersDir, 'Pictures', 'Screenshots'),
    path.join(usersDir, 'Pictures', 'Wallpapers'),
    path.join(usersDir, 'Music'),
    path.join(usersDir, 'Videos'),
    path.join(usersDir, 'Projects', 'DesignSystem'),
    path.join(baseDir, 'Windows', 'Temp'),
    path.join(baseDir, '$Recycle.Bin'),
  ];

  for (const f of foldersToCreate) {
    if (!fs.existsSync(f)) {
      fs.mkdirSync(f, { recursive: true });
    }
  }

  // 1. Seed Camera Photos
  const cameraDir = path.join(usersDir, 'Pictures', 'Camera');
  const cameraPhotos = [
    { name: 'IMG_20261025_142318.svg', title: 'Alpine Peak Sunrise', subtitle: 'Google Pixel 9 Pro · 50MP · f/1.68', c1: '#4338ca', c2: '#ec4899' },
    { name: 'IMG_20261024_081105.svg', title: 'Nordic Coast Fog', subtitle: 'Google Pixel 9 Pro · ISO 80 · 24mm', c1: '#0f766e', c2: '#06b6d4' },
    { name: 'IMG_20261022_194520.svg', title: 'Golden Hour Dune', subtitle: 'Google Pixel 9 Pro · Sunset Mode', c1: '#c2410c', c2: '#f59e0b' },
    { name: 'IMG_20261020_113044.svg', title: 'Emerald Forest Valley', subtitle: 'Google Pixel 9 Pro · Ultra-Wide', c1: '#15803d', c2: '#84cc16' },
  ];
  for (const p of cameraPhotos) {
    const filePath = path.join(cameraDir, p.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, generateSvgImage(p.title, p.subtitle, p.c1, p.c2, 'photo'), 'utf8');
    }
  }

  // 2. Seed Screenshots
  const screenshotsDir = path.join(usersDir, 'Pictures', 'Screenshots');
  const screenshots = [
    { name: 'Screenshot_2026-10-25_DesignTokens.svg', title: 'Material You Design Tokens', subtitle: 'Google Design Library Spec', c1: '#1a73e8', c2: '#4285f4' },
    { name: 'Screenshot_2026-10-23_WorkspaceArch.svg', title: 'Files Studio Architecture Diagram', subtitle: 'WinUI 3 & Express Engine', c1: '#00875a', c2: '#34a853' },
    { name: 'Screenshot_2026-10-21_ColorMatrix.svg', title: 'Tonal Palette Reference 2026', subtitle: 'Figma Component System', c1: '#7924c7', c2: '#a142f4' },
  ];
  for (const s of screenshots) {
    const filePath = path.join(screenshotsDir, s.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, generateSvgImage(s.title, s.subtitle, s.c1, s.c2, 'screenshot'), 'utf8');
    }
  }

  // 3. Seed Wallpapers
  const wallpapersDir = path.join(usersDir, 'Pictures', 'Wallpapers');
  const wallpapers = [
    { name: 'Cyberpunk_Neon_Metropolis.svg', title: 'Night Shift Horizon', subtitle: '4K Ultra-Wide Wallpaper', c1: '#701a75', c2: '#3b82f6' },
    { name: 'Minimalist_Desert_Dunes.svg', title: 'Warm Sand Waves', subtitle: 'Clean Desktop Background', c1: '#b45309', c2: '#fbbf24' },
    { name: 'Deep_Space_Nebula.svg', title: 'Orion Stellar nursery', subtitle: 'Astrophotography Spec', c1: '#1e1b4b', c2: '#6366f1' },
  ];
  for (const w of wallpapers) {
    const filePath = path.join(wallpapersDir, w.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, generateSvgImage(w.title, w.subtitle, w.c1, w.c2, 'wallpaper'), 'utf8');
    }
  }

  // 4. Seed Audio tracks with real playable audio
  const musicDir = path.join(usersDir, 'Music');
  const audioTracks = [
    { name: 'Ambient_Dawn_Harmony.wav', freq: 440, duration: 14 },
    { name: 'Lofi_Pulse_Focus.wav', freq: 330, duration: 16 },
    { name: 'Cyber_Synth_Aura.wav', freq: 523.25, duration: 15 },
    { name: 'Deep_Resonance_Meditation.wav', freq: 220, duration: 18 },
  ];
  for (const track of audioTracks) {
    const filePath = path.join(musicDir, track.name);
    if (!fs.existsSync(filePath)) {
      const wav = generateValidWavBuffer(track.freq, track.duration);
      fs.writeFileSync(filePath, wav);
    }
  }

  // 5. Seed Documents
  const docsDir = path.join(usersDir, 'Documents');
  const documents = [
    {
      name: 'Google_Design_Library_Material_You_2026.md',
      content: `# Google Design Library: Material You Desktop Edition

## 1. Executive Summary
Designed by Google engineers and designers for next-generation Windows and Android ecosystem synchronization.

## 2. Core Pillars
- **Effortless Discovery**: Browse by meaningful categories (Photos, Videos, Music, Documents) across all locations.
- **Deep Filesystem Integrity**: Respect real drives, folders, permissions, and file integrity.
- **Tonal Elevation**: Dynamic light and dark palettes with balanced contrast and zero-pill typography.
- **Privacy First**: All local indexing, zero external cloud leaks.

*Approved by Design Systems Team, 2026.*
`
    },
    {
      name: 'Q3_Desktop_Product_Roadmap.md',
      content: `# Files Studio Q3 Roadmap & Technical Architecture

### Milestones
- [x] Universal Photo Library with EXIF & Pan-Zoom
- [x] Video Player with Speed Control and Duration Badges
- [x] Background Audio Engine with Floating Mini-Player
- [x] Dual-Pane File Explorer with Tabbed Browsing
- [x] Storage Visualizer with Duplicate File Detection
- [ ] Direct cloud sync connector
`
    },
    {
      name: 'Quarterly_Storage_Audit.csv',
      content: `Directory,FileCount,TotalSizeBytes,Status
C:\\Users\\GoogleDesigner\\Pictures,124,1425000000,Clean
C:\\Users\\GoogleDesigner\\Videos,18,8420000000,Optimized
C:\\Users\\GoogleDesigner\\Music,45,620000000,Indexed
C:\\Users\\GoogleDesigner\\Documents,88,142000000,Current
C:\\Users\\GoogleDesigner\\Downloads,32,2100000000,NeedsReview
`
    },
    {
      name: 'Design_System_Specification.pdf',
      content: `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF`
    }
  ];
  for (const doc of documents) {
    const filePath = path.join(docsDir, doc.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, doc.content, 'utf8');
    }
  }

  // 6. Seed Downloads
  const downloadsDir = path.join(usersDir, 'Downloads');
  const downloads = [
    { name: 'FilesStudio_Windows_x64_Setup.exe', content: 'MZ' + '0'.repeat(1024 * 50) },
    { name: 'MaterialSymbols_Rounded_v4.zip', content: 'PK' + '0'.repeat(1024 * 25) },
    { name: 'Invoice_OCT_2026_DesignServices.txt', content: 'INVOICE #9281\nClient: Google Design\nAmount: $4,500.00\nStatus: PAID' },
  ];
  for (const dl of downloads) {
    const filePath = path.join(downloadsDir, dl.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, dl.content, 'utf8');
    }
  }

  // 7. Seed Videos (HTML5 playable test videos)
  const videosDir = path.join(usersDir, 'Videos');
  // We can write a sample SVG animated video poster or WebM video file
  const videoFiles = [
    { name: 'FilesStudio_Feature_Walkthrough.mp4', title: 'Files Studio Feature Walkthrough', duration: 45, width: 1920, height: 1080 },
    { name: 'Screen_Recording_2026-10-24.mp4', title: 'Screen Recording 2026-10-24', duration: 18, width: 2560, height: 1440 },
    { name: 'Motion_Design_Transitions_Demo.mp4', title: 'Motion Design Transitions Demo', duration: 24, width: 1920, height: 1080 }
  ];
  for (const v of videoFiles) {
    const filePath = path.join(videosDir, v.name);
    if (!fs.existsSync(filePath)) {
      // Create a readable test video asset
      const videoBuffer = Buffer.alloc(1024 * 100);
      videoBuffer.write('ftypmp42', 4);
      fs.writeFileSync(filePath, videoBuffer);
    }
  }

  // 8. Seed duplicate candidate to test Duplicate File Detection
  const dupPath = path.join(downloadsDir, 'IMG_20261025_142318_copy.svg');
  const originalPath = path.join(cameraDir, 'IMG_20261025_142318.svg');
  if (fs.existsSync(originalPath) && !fs.existsSync(dupPath)) {
    fs.copyFileSync(originalPath, dupPath);
  }

  // 9. Seed temp junk file for clean up scanner
  const tempDir = path.join(baseDir, 'Windows', 'Temp');
  const tempFile = path.join(tempDir, 'cache_index_temp_48821.tmp');
  if (!fs.existsSync(tempFile)) {
    fs.writeFileSync(tempFile, 'temporary thumbnail cache data '.repeat(5000));
  }
}
