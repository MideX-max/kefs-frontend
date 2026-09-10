import { createWorker } from 'tesseract.js';
import { DEFAULT_FLATS } from './constants.js';

/**
 * Parses an image or file using client-side Tesseract.js OCR to detect
 * flat numbers (from the 144 flats list), dates, and guest name.
 * 
 * @param {string|File|Blob} imageSource Image URL, Data URI, File, or Blob
 * @returns {Promise<{ flat: string, guestName: string, checkInDate: string, checkOutDate: string, rawText: string }>}
 */
export async function extractAirbnbBookingDetails(imageSource) {
  let worker = null;
  try {
    worker = await createWorker('eng');
    const ret = await worker.recognize(imageSource);
    const text = ret.data.text || '';
    
    const parsedDetails = {
      flat: '',
      guestName: '',
      checkInDate: '',
      checkOutDate: '',
      rawText: text
    };

    // 1. Detect Flat Name & Unit (e.g. "Azalea D6", "Beaumont B2", "Darwin F4", "Charleston C1")
    const flatRegex = /(Azalea|Beaumont|Charleston|Darwin)\s*([A-Fa-f])\s*[-–—]?\s*([1-6])/i;
    const flatMatch = text.match(flatRegex);

    if (flatMatch) {
      const base = flatMatch[1].charAt(0).toUpperCase() + flatMatch[1].slice(1).toLowerCase();
      const block = flatMatch[2].toUpperCase();
      const unit = flatMatch[3];
      const matchedFlat = `${base} ${block}${unit}`;
      if (DEFAULT_FLATS.includes(matchedFlat)) {
        parsedDetails.flat = matchedFlat;
      }
    }

    // Fallback: Check if base name and block/unit are within proximity
    if (!parsedDetails.flat) {
      for (const flatName of DEFAULT_FLATS) {
        const parts = flatName.split(' ');
        const baseName = parts[0];
        const code = parts[1]; // e.g. "D6"
        const looseRegex = new RegExp(`\\b${baseName}\\b[\\s\\S]{0,30}\\b${code}\\b`, 'i');
        if (looseRegex.test(text)) {
          parsedDetails.flat = flatName;
          break;
        }
      }
    }

    // 2. Extract Guest Name if indicated
    const guestRegex = /(?:Guest|Reserved for|Booked by|Name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i;
    const guestMatch = text.match(guestRegex);
    if (guestMatch && guestMatch[1]) {
      parsedDetails.guestName = guestMatch[1].trim();
    }

    // 3. Extract Dates (DD/MM/YYYY or YYYY-MM-DD or Month DD, YYYY)
    const isoDates = text.match(/\b(20\d{2}[-/.]\d{1,2}[-/.]\d{1,2})\b/g);
    if (isoDates && isoDates.length >= 2) {
      parsedDetails.checkInDate = normalizeDateStr(isoDates[0]);
      parsedDetails.checkOutDate = normalizeDateStr(isoDates[1]);
    } else {
      const standardDates = text.match(/\b(\d{1,2}[-/.]\d{1,2}[-/.]20\d{2})\b/g);
      if (standardDates && standardDates.length >= 2) {
        parsedDetails.checkInDate = parseDmyDate(standardDates[0]);
        parsedDetails.checkOutDate = parseDmyDate(standardDates[1]);
      }
    }

    return parsedDetails;
  } catch (err) {
    console.error('OCR Extraction error:', err);
    return {
      flat: '',
      guestName: '',
      checkInDate: '',
      checkOutDate: '',
      rawText: ''
    };
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}

/**
 * Crops and extracts the flat owner / host signature region from the document image
 * using HTML5 Canvas with adaptive contrast enhancement.
 * 
 * @param {string|File|Blob} imageSource Image URL or Blob
 * @returns {Promise<string>} Base64 Data URI of cropped signature
 */
export async function extractSignatureFromDocument(imageSource) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve('');
        }

        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // The signature region typically sits in the bottom 35% of the booking document
        const cropY = Math.floor(height * 0.65);
        const cropHeight = Math.floor(height * 0.35);
        const cropWidth = width;

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Draw cropped bottom region
        ctx.drawImage(img, 0, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        // Perform contrast & clarity enhancement for signature line
        const imageData = ctx.getImageData(0, 0, cropWidth, cropHeight);
        const data = imageData.data;

        let minX = cropWidth, minY = cropHeight, maxX = 0, maxY = 0;
        let foundDarkPixels = false;

        // Scan for dark ink strokes (signatures/stamps)
        for (let y = 0; y < cropHeight; y++) {
          for (let x = 0; x < cropWidth; x++) {
            const idx = (y * cropWidth + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            if (brightness < 160) { // Dark stroke / ink pixel
              foundDarkPixels = true;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        // If a distinct signature cluster was found, crop tightly around it with padding
        if (foundDarkPixels && maxX > minX + 20 && maxY > minY + 10) {
          const padding = 15;
          const tightX = Math.max(0, minX - padding);
          const tightY = Math.max(0, minY - padding);
          const tightW = Math.min(cropWidth - tightX, (maxX - minX) + (padding * 2));
          const tightH = Math.min(cropHeight - tightY, (maxY - minY) + (padding * 2));

          const tightCanvas = document.createElement('canvas');
          tightCanvas.width = tightW;
          tightCanvas.height = tightH;
          const tightCtx = tightCanvas.getContext('2d');
          
          if (tightCtx) {
            tightCtx.drawImage(canvas, tightX, tightY, tightW, tightH, 0, 0, tightW, tightH);
            return resolve(tightCanvas.toDataURL('image/png'));
          }
        }

        // Fallback: return the bottom cropped section
        resolve(canvas.toDataURL('image/png'));
      } catch (cropErr) {
        console.warn('Signature cropping failed, fallback empty:', cropErr);
        resolve('');
      }
    };

    img.onerror = () => {
      resolve('');
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof Blob || imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      resolve('');
    }
  });
}

function normalizeDateStr(str) {
  const parts = str.replace(/[./]/g, '-').split('-');
  if (parts.length === 3) {
    const year = parts[0].length === 4 ? parts[0] : parts[2];
    const month = (parts[1].length === 1 ? '0' : '') + parts[1];
    const day = (parts[0].length === 4 ? parts[2] : parts[0]).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '';
}

function parseDmyDate(str) {
  const parts = str.replace(/[./]/g, '-').split('-');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return '';
}
