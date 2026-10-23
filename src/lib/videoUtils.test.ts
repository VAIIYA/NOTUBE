import test from 'node:test';
import assert from 'node:assert/strict';
import { detectVideoAspectRatio, extractVideoFromNote, VideoItem } from './videoUtils.ts';
import { Kind } from '../constants.ts';

test('detectVideoAspectRatio - NIP-71 Kind 34236 and Kind 22', () => {
  const res34236 = detectVideoAspectRatio(34236);
  assert.equal(res34236.isVertical, true);
  assert.equal(res34236.aspectRatio, '9:16');

  const resShortVideoEnum = detectVideoAspectRatio(Kind.ShortVideo);
  assert.equal(resShortVideoEnum.isVertical, true);
  assert.equal(resShortVideoEnum.aspectRatio, '9:16');

  const res22 = detectVideoAspectRatio(22);
  assert.equal(res22.isVertical, true);
  assert.equal(res22.aspectRatio, '9:16');
});

test('detectVideoAspectRatio - preserves dimensions when Kind is 34236', () => {
  const res = detectVideoAspectRatio(34236, [['dim', '1080x1920']]);
  assert.equal(res.isVertical, true);
  assert.equal(res.aspectRatio, '9:16');
  assert.deepEqual(res.dimensions, { width: 1080, height: 1920 });
});

test('detectVideoAspectRatio - dimension tags with height > width', () => {
  const res1 = detectVideoAspectRatio(1, [['dim', '1080x1920']]);
  assert.equal(res1.isVertical, true);
  assert.equal(res1.aspectRatio, '9:16');
  assert.deepEqual(res1.dimensions, { width: 1080, height: 1920 });

  const resSpaces = detectVideoAspectRatio(1, [['dim', '1080 x 1920']]);
  assert.equal(resSpaces.isVertical, true);
  assert.equal(resSpaces.aspectRatio, '9:16');
  assert.deepEqual(resSpaces.dimensions, { width: 1080, height: 1920 });

  const resDimensions = detectVideoAspectRatio(1, [['dimensions', '720x1280']]);
  assert.equal(resDimensions.isVertical, true);
  assert.equal(resDimensions.aspectRatio, '9:16');
  assert.deepEqual(resDimensions.dimensions, { width: 720, height: 1280 });
});

test('detectVideoAspectRatio - dimension tags with width >= height', () => {
  const res1 = detectVideoAspectRatio(1, [['dim', '1920x1080']]);
  assert.equal(res1.isVertical, false);
  assert.equal(res1.aspectRatio, '16:9');
  assert.deepEqual(res1.dimensions, { width: 1920, height: 1080 });

  const resSquare = detectVideoAspectRatio(1, [['dim', '1080x1080']]);
  assert.equal(resSquare.isVertical, false);
  assert.equal(resSquare.aspectRatio, '16:9');
  assert.deepEqual(resSquare.dimensions, { width: 1080, height: 1080 });
});

test('detectVideoAspectRatio - explicit aspect ratio tags', () => {
  const res1 = detectVideoAspectRatio(1, [['aspect_ratio', '9:16']]);
  assert.equal(res1.isVertical, true);
  assert.equal(res1.aspectRatio, '9:16');

  const res2 = detectVideoAspectRatio(1, [['aspect-ratio', '9:16']]);
  assert.equal(res2.isVertical, true);
  assert.equal(res2.aspectRatio, '9:16');

  const res3 = detectVideoAspectRatio(1, [['r', '9:16']]);
  assert.equal(res3.isVertical, true);
  assert.equal(res3.aspectRatio, '9:16');

  const res4 = detectVideoAspectRatio(1, [['aspect_ratio', '16:9']]);
  assert.equal(res4.isVertical, false);
  assert.equal(res4.aspectRatio, '16:9');
});

test('detectVideoAspectRatio - NIP-92 imeta tags', () => {
  const res1 = detectVideoAspectRatio(1, [['imeta', 'url https://example.com/v.mp4', 'dim 1080x1920']]);
  assert.equal(res1.isVertical, true);
  assert.equal(res1.aspectRatio, '9:16');
  assert.deepEqual(res1.dimensions, { width: 1080, height: 1920 });

  const res2 = detectVideoAspectRatio(1, [['imeta', 'url https://example.com/v.mp4 dim 1080 x 1920']]);
  assert.equal(res2.isVertical, true);
  assert.equal(res2.aspectRatio, '9:16');
  assert.deepEqual(res2.dimensions, { width: 1080, height: 1920 });

  const res3 = detectVideoAspectRatio(1, [['imeta', 'url https://example.com/v.mp4 dim 1920x1080']]);
  assert.equal(res3.isVertical, false);
  assert.equal(res3.aspectRatio, '16:9');
  assert.deepEqual(res3.dimensions, { width: 1920, height: 1080 });

  const res4 = detectVideoAspectRatio(1, [['imeta', 'url https://example.com/v.mp4 aspect_ratio 9:16']]);
  assert.equal(res4.isVertical, true);
  assert.equal(res4.aspectRatio, '9:16');
});

test('detectVideoAspectRatio - YouTube Shorts URLs', () => {
  const res1 = detectVideoAspectRatio(1, [], 'https://www.youtube.com/shorts/abc123xyz89');
  assert.equal(res1.isVertical, true);
  assert.equal(res1.aspectRatio, '9:16');

  const res2 = detectVideoAspectRatio(1, [], 'https://youtu.be/shorts/abc123xyz89');
  assert.equal(res2.isVertical, true);
  assert.equal(res2.aspectRatio, '9:16');

  const res3 = detectVideoAspectRatio(1, [], '', 'Check out my short https://www.youtube.com/shorts/abc123xyz89 !');
  assert.equal(res3.isVertical, true);
  assert.equal(res3.aspectRatio, '9:16');
});

test('detectVideoAspectRatio - standard horizontal video and default fallback', () => {
  const resKindVideo = detectVideoAspectRatio(Kind.Video);
  assert.equal(resKindVideo.isVertical, false);
  assert.equal(resKindVideo.aspectRatio, '16:9');

  const resYtWatch = detectVideoAspectRatio(1, [], 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(resYtWatch.isVertical, false);
  assert.equal(resYtWatch.aspectRatio, '16:9');

  const resDefault = detectVideoAspectRatio();
  assert.equal(resDefault.isVertical, false);
  assert.equal(resDefault.aspectRatio, '16:9');
});

test('extractVideoFromNote - vertical note extraction', () => {
  const mockNote: any = {
    id: 'note-vert-1',
    post: {
      id: 'note-vert-1',
      kind: 34236,
      content: 'Vertical short video https://media.nostr.build/short.mp4',
      tags: [
        ['url', 'https://media.nostr.build/short.mp4'],
        ['dim', '1080x1920'],
        ['title', 'Awesome Short'],
      ],
      created_at: 1700000000,
      likes: 15,
      replies: 2,
    },
    user: {
      pubkey: 'npub1testcreator',
      name: 'Alice',
    },
  };

  const video = extractVideoFromNote(mockNote);
  assert.ok(video);
  assert.equal(video.id, 'note-vert-1');
  assert.equal(video.isVertical, true);
  assert.equal(video.aspectRatio, '9:16');
  assert.equal(video.isShort, true);
  assert.deepEqual(video.dimensions, { width: 1080, height: 1920 });
});

test('extractVideoFromNote - standard horizontal note extraction', () => {
  const mockNote: any = {
    id: 'note-horiz-1',
    post: {
      id: 'note-horiz-1',
      kind: 34235,
      content: 'Standard landscape video https://media.nostr.build/long.mp4',
      tags: [
        ['url', 'https://media.nostr.build/long.mp4'],
        ['dim', '1920x1080'],
        ['title', 'Full Landscape Doc'],
      ],
      created_at: 1700000000,
      likes: 50,
      replies: 5,
    },
    user: {
      pubkey: 'npub1testcreator2',
      name: 'Bob',
    },
  };

  const video = extractVideoFromNote(mockNote);
  assert.ok(video);
  assert.equal(video.id, 'note-horiz-1');
  assert.equal(video.isVertical, false);
  assert.equal(video.aspectRatio, '16:9');
  assert.equal(video.isShort, false);
  assert.deepEqual(video.dimensions, { width: 1920, height: 1080 });
});
