import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeWindowsPath,
  getParentPath,
  getBreadcrumbSegments,
  classifyFile,
  formatFileSize,
  formatDuration,
  parseSearchSyntax,
  matchesSearchCriteria,
  identifyDuplicateCandidates
} from './fileSystemLogic';

test('normalizeWindowsPath normalizes separators and drive roots', () => {
  assert.equal(normalizeWindowsPath('C:/Users/GoogleDesigner/Pictures'), 'C:\\Users\\GoogleDesigner\\Pictures');
  assert.equal(normalizeWindowsPath('Users/Downloads'), 'C:\\Users\\Downloads');
  assert.equal(normalizeWindowsPath('C:\\'), 'C:\\');
  assert.equal(normalizeWindowsPath('C:\\Photos\\'), 'C:\\Photos');
});

test('getParentPath handles drive roots and nested folders', () => {
  assert.equal(getParentPath('C:\\Users\\Pictures'), 'C:\\Users');
  assert.equal(getParentPath('C:\\Users'), 'C:\\');
  assert.equal(getParentPath('C:\\'), 'This PC');
});

test('getBreadcrumbSegments creates clickable path breakdown', () => {
  const segments = getBreadcrumbSegments('C:\\Users\\GoogleDesigner\\Pictures');
  assert.equal(segments.length, 5);
  assert.equal(segments[0].label, 'This PC');
  assert.equal(segments[1].label, 'Local Disk (C:)');
  assert.equal(segments[1].path, 'C:\\');
  assert.equal(segments[2].label, 'Users');
  assert.equal(segments[3].label, 'GoogleDesigner');
  assert.equal(segments[4].label, 'Pictures');
});

test('classifyFile accurately detects Google Files categories and subcategories', () => {
  const photo = classifyFile('sample_photo.jpg', 'C:\\Users\\Pictures\\vacation.jpg');
  assert.equal(photo.category, 'photo');

  const screenshot = classifyFile('Screenshot_2026-10-25.png', 'C:\\Users\\Pictures\\Screenshots\\shot.png');
  assert.equal(screenshot.category, 'photo');
  assert.equal(screenshot.subCategory, 'screenshot');

  const camera = classifyFile('IMG_20261025_120401.jpg', 'C:\\Users\\Pictures\\Camera\\IMG_1.jpg');
  assert.equal(camera.category, 'photo');
  assert.equal(camera.subCategory, 'camera');

  const video = classifyFile('screencast_demo.mp4', 'C:\\Users\\Videos\\screencast_demo.mp4');
  assert.equal(video.category, 'video');
  assert.equal(video.subCategory, 'recording');

  const audio = classifyFile('ambient_track.mp3', 'C:\\Users\\Music\\ambient_track.mp3');
  assert.equal(audio.category, 'audio');

  const doc = classifyFile('quarterly_report.pdf', 'C:\\Users\\Documents\\quarterly_report.pdf');
  assert.equal(doc.category, 'document');

  const archive = classifyFile('assets.zip', 'C:\\Users\\Downloads\\assets.zip');
  assert.equal(archive.category, 'archive');
});

test('formatFileSize formats units correctly', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(1024), '1 KB');
  assert.equal(formatFileSize(1024 * 1024 * 4.5), '4.5 MB');
  assert.equal(formatFileSize(1024 * 1024 * 1024 * 2.1), '2.1 GB');
});

test('formatDuration formats seconds into clock display', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(75), '1:15');
  assert.equal(formatDuration(3665), '1:01:05');
});

test('parseSearchSyntax and matchesSearchCriteria handle complex queries', () => {
  const query = parseSearchSyntax('type:image screenshot size:large');
  assert.equal(query.typeFilter, 'photo');
  assert.deepEqual(query.keywords, ['screenshot']);
  assert.equal(query.minSizeBytes, 100 * 1024 * 1024);

  const matched = matchesSearchCriteria(
    {
      name: 'screenshot_highres.png',
      path: 'C:\\Users\\Pictures\\Screenshots\\screenshot_highres.png',
      size: 150 * 1024 * 1024,
      category: 'photo'
    },
    query
  );
  assert.equal(matched, true);

  const failedType = matchesSearchCriteria(
    {
      name: 'screenshot_doc.pdf',
      path: 'C:\\Users\\Documents\\screenshot_doc.pdf',
      size: 150 * 1024 * 1024,
      category: 'document'
    },
    query
  );
  assert.equal(failedType, false);
});

test('identifyDuplicateCandidates flags exact size and name collisions', () => {
  const files = [
    { path: 'C:\\Pictures\\img1.png', name: 'img1.png', size: 500000 },
    { path: 'C:\\Downloads\\img1_copy.png', name: 'img1.png', size: 500000 },
    { path: 'C:\\Documents\\doc.txt', name: 'doc.txt', size: 12000 }
  ];

  const duplicates = identifyDuplicateCandidates(files);
  assert.equal(duplicates.length, 1);
  assert.equal(duplicates[0].items.length, 2);
  assert.equal(duplicates[0].potentialReclaimBytes, 500000);
});
