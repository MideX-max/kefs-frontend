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

    // 2. Extract Guest Name if indicated or fallback to header line
    const guestRegex = /(?:Guest|Reserved for|Booked by|Name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i;
    const guestMatch = text.match(guestRegex);
    if (guestMatch && guestMatch[1]) {
      parsedDetails.guestName = guestMatch[1].trim();
    } else {
      // Fallback: check early lines of text for a 2-3 word capitalized name (e.g. "Base Bakare")
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      for (const line of lines.slice(0, 6)) {
        if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(line)) {
          const ignoreWords = ['About', 'Identity', 'Verified', 'Joined', 'Lives', 'Speaks', 'Message', 'Call', 'Show', 'Airbnb', 'Luxury', 'Superhost'];
          if (!ignoreWords.some(w => line.toLowerCase().includes(w.toLowerCase()))) {
            parsedDetails.guestName = line;
            break;
          }
        }
      }
    }

    // 3. Extract Dates (multi-format support for Airbnb screenshots like "Feb 10 – 16 (6 nights)", "Feb 10 - Feb 16", "10/02/2026", etc.)
    const dates = parseDatesFromOcrText(text);
    if (dates.checkInDate) {
      parsedDetails.checkInDate = dates.checkInDate;
    }
    if (dates.checkOutDate) {
      parsedDetails.checkOutDate = dates.checkOutDate;
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

const MONTH_MAP = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', september: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12'
};

function formatIsoDate(year, monthStr, dayStr) {
  const y = String(year);
  const m = String(monthStr).padStart(2, '0');
  const d = String(dayStr).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Extracts check-in and check-out dates from raw OCR text across multiple common date formats.
 */

export function parseDatesFromOcrText(text) {
  const currentYear = new Date().getFullYear();
  let checkInDate = '';
  let checkOutDate = '';

  // 1. Check for standard ISO dates: 2026-02-10 or 2026/02/10
  const isoDates = text.match(/\b(20\d{2}[-/.]\d{1,2}[-/.]\d{1,2})\b/g);
  if (isoDates && isoDates.length >= 2) {
    checkInDate = normalizeDateStr(isoDates[0]);
    checkOutDate = normalizeDateStr(isoDates[1]);
    return { checkInDate, checkOutDate };
  }

  // 2. Check for numeric dates: 10/02/2026 or 10-02-2026
  const standardDates = text.match(/\b(\d{1,2}[-/.]\d{1,2}[-/.]20\d{2})\b/g);
  if (standardDates && standardDates.length >= 2) {
    checkInDate = parseDmyDate(standardDates[0]);
    checkOutDate = parseDmyDate(standardDates[1]);
    return { checkInDate, checkOutDate };
  }

  // 3. Check for Month Day1 – Day2 (e.g. "Feb 10 – 16", "Feb 10 - 16, 2026", "Feb 10 to 16", "Feb 10 – 16 (6 nights)")
  const monthRangeRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})\s*[-–—to]+\s*(\d{1,2})(?:[,\s]+(20\d{2}))?/i;
  const monthRangeMatch = text.match(monthRangeRegex);
  if (monthRangeMatch) {
    const monthKey = monthRangeMatch[1].toLowerCase();
    const month = MONTH_MAP[monthKey];
    const day1 = monthRangeMatch[2];
    const day2 = monthRangeMatch[3];
    const yr = monthRangeMatch[4] || currentYear;
    if (month) {
      checkInDate = formatIsoDate(yr, month, day1);
      checkOutDate = formatIsoDate(yr, month, day2);
      return { checkInDate, checkOutDate };
    }
  }

  // 4. Check for Month1 Day1 – Month2 Day2 (e.g. "Feb 10 – Feb 16", "Oct 28 - Nov 3")
  const multiMonthRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})\s*[-–—to]+\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:[,\s]+(20\d{2}))?/i;
  const multiMonthMatch = text.match(multiMonthRegex);
  if (multiMonthMatch) {
    const m1 = MONTH_MAP[multiMonthMatch[1].toLowerCase()];
    const d1 = multiMonthMatch[2];
    const m2 = MONTH_MAP[multiMonthMatch[3].toLowerCase()];
    const d2 = multiMonthMatch[4];
    const yr = multiMonthMatch[5] || currentYear;
    if (m1 && m2) {
      checkInDate = formatIsoDate(yr, m1, d1);
      checkOutDate = formatIsoDate(yr, m2, d2);
      return { checkInDate, checkOutDate };
    }
  }

  // 5. Check for Day1 Month1 – Day2 Month2 (e.g. "10 Feb - 16 Feb")
  const dayMonthRangeRegex = /(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*[-–—to]+\s*(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:[,\s]+(20\d{2}))?/i;
  const dayMonthMatch = text.match(dayMonthRangeRegex);
  if (dayMonthMatch) {
    const d1 = dayMonthMatch[1];
    const m1 = MONTH_MAP[dayMonthMatch[2].toLowerCase()];
    const d2 = dayMonthMatch[3];
    const m2 = MONTH_MAP[dayMonthMatch[4].toLowerCase()];
    const yr = dayMonthMatch[5] || currentYear;
    if (m1 && m2) {
      checkInDate = formatIsoDate(yr, m1, d1);
      checkOutDate = formatIsoDate(yr, m2, d2);
      return { checkInDate, checkOutDate };
    }
  }

  // 6. Check for Day1 - Day2 Month (e.g. "10 - 16 Feb")
  const dayDayMonthRegex = /(\d{1,2})\s*[-–—to]+\s*(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:[,\s]+(20\d{2}))?/i;
  const dayDayMonthMatch = text.match(dayDayMonthRegex);
  if (dayDayMonthMatch) {
    const d1 = dayDayMonthMatch[1];
    const d2 = dayDayMonthMatch[2];
    const m = MONTH_MAP[dayDayMonthMatch[3].toLowerCase()];
    const yr = dayDayMonthMatch[4] || currentYear;
    if (m) {
      checkInDate = formatIsoDate(yr, m, d1);
      checkOutDate = formatIsoDate(yr, m2 || m, d2);
      return { checkInDate, checkOutDate };
    }
  }

  // 7. Extract single start date and nights count (e.g. "Feb 10" and "6 nights")
  const singleMonthDayRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:[,\s]+(20\d{2}))?/i;
  const singleMonthDayMatch = text.match(singleMonthDayRegex);
  const nightsMatch = text.match(/\b(\d{1,3})\s*nights?\b/i);

  if (singleMonthDayMatch && nightsMatch) {
    const m = MONTH_MAP[singleMonthDayMatch[1].toLowerCase()];
    const d1 = parseInt(singleMonthDayMatch[2], 10);
    const yr = parseInt(singleMonthDayMatch[3] || currentYear, 10);
    const nights = parseInt(nightsMatch[1], 10);

    if (m && d1 && nights > 0) {
      const inDateObj = new Date(yr, parseInt(m, 10) - 1, d1);
      checkInDate = formatIsoDate(inDateObj.getFullYear(), inDateObj.getMonth() + 1, inDateObj.getDate());
      
      const outDateObj = new Date(inDateObj.getTime() + nights * 24 * 60 * 60 * 1000);
      checkOutDate = formatIsoDate(outDateObj.getFullYear(), outDateObj.getMonth() + 1, outDateObj.getDate());
      return { checkInDate, checkOutDate };
    }
  }

  return { checkInDate, checkOutDate };
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
