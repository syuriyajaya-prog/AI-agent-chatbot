const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(size, filename) {
  const width = size;
  const height = size;

  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);

  // Background: Deep Blue #1C4ED8 (28, 78, 216), Rounded corners
  const bgR = 28, bgG = 78, bgB = 216;
  const cornerRadius = size * 0.2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Check rounded rect boundary
      let inBounds = true;
      const dx = Math.min(x, width - 1 - x);
      const dy = Math.min(y, height - 1 - y);

      if (dx < cornerRadius && dy < cornerRadius) {
        const dist = Math.hypot(cornerRadius - dx, cornerRadius - dy);
        if (dist > cornerRadius) {
          inBounds = false;
        }
      }

      if (!inBounds) {
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 0;
        continue;
      }

      // Base background color
      let r = bgR, g = bgG, b = bgB, a = 255;

      // Draw scan viewfinder / document icon in white
      const margin = size * 0.24;
      const stroke = Math.max(2, Math.floor(size * 0.04));
      const cornerLen = size * 0.16;

      // Top-left corner
      const inTopLeftH = (y >= margin && y <= margin + stroke && x >= margin && x <= margin + cornerLen);
      const inTopLeftV = (x >= margin && x <= margin + stroke && y >= margin && y <= margin + cornerLen);

      // Top-right corner
      const inTopRightH = (y >= margin && y <= margin + stroke && x >= width - margin - cornerLen && x <= width - margin);
      const inTopRightV = (x >= width - margin - stroke && x <= width - margin && y >= margin && y <= margin + cornerLen);

      // Bottom-left corner
      const inBottomLeftH = (y >= height - margin - stroke && y <= height - margin && x >= margin && x <= margin + cornerLen);
      const inBottomLeftV = (x >= margin && x <= margin + stroke && y >= height - margin - cornerLen && y <= height - margin);

      // Bottom-right corner
      const inBottomRightH = (y >= height - margin - stroke && y <= height - margin && x >= width - margin - cornerLen && x <= width - margin);
      const inBottomRightV = (x >= width - margin - stroke && x <= width - margin && y >= height - margin - cornerLen && y <= height - margin);

      // Center scan horizontal line (laser scan bar) in emerald green / white #059669
      const scanBarY = height * 0.5;
      const inScanBar = (Math.abs(y - scanBarY) <= stroke * 0.8 && x >= margin + cornerLen * 0.4 && x <= width - margin - cornerLen * 0.4);

      // Center document emblem
      const docW = size * 0.22;
      const docH = size * 0.28;
      const docX1 = (width - docW) / 2;
      const docX2 = docX1 + docW;
      const docY1 = (height - docH) / 2;
      const docY2 = docY1 + docH;

      const inDocBorder = (
        ((y >= docY1 && y <= docY1 + stroke * 0.6) || (y >= docY2 - stroke * 0.6 && y <= docY2)) && x >= docX1 && x <= docX2
      ) || (
        ((x >= docX1 && x <= docX1 + stroke * 0.6) || (x >= docX2 - stroke * 0.6 && x <= docX2)) && y >= docY1 && y <= docY2
      );

      if (inScanBar) {
        r = 52; g = 211; b = 153; // Green laser pulse
      } else if (inTopLeftH || inTopLeftV || inTopRightH || inTopRightV || inBottomLeftH || inBottomLeftV || inBottomRightH || inBottomRightV) {
        r = 255; g = 255; b = 255;
      } else if (inDocBorder) {
        r = 224; g = 231; b = 255;
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // Construct PNG chunks
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  let srcPos = 0;
  let dstPos = 0;
  for (let y = 0; y < height; y++) {
    scanlines[dstPos++] = 0; // Filter byte: None
    buffer.copy(scanlines, dstPos, srcPos, srcPos + width * 4);
    dstPos += width * 4;
    srcPos += width * 4;
  }

  // Compress data
  const compressedData = zlib.deflateSync(scanlines);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  const pngBuffer = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, pngBuffer);
  console.log(`Generated ${filename} (${width}x${height})`);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);

  // CRC-32
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 implementation
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c;
  }

  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
createPng(192, path.join(outDir, 'icon-192x192.png'));
createPng(512, path.join(outDir, 'icon-512x512.png'));
