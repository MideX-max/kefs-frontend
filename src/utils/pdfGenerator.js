import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper function to wait for all images in an element to load
function waitForImages(element) {
  const images = element.getElementsByTagName('img');
  const promises = Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = resolve; // Continue even if image fails to load
      setTimeout(resolve, 3000); // Timeout after 3 seconds
    });
  });
  return Promise.all(promises);
}

export async function generatePassPDF(elementOrId, filename = 'KEFFI_APARTMENT_PASS.pdf') {
  try {
    const element = typeof elementOrId === 'string'
      ? document.getElementById(elementOrId)
      : elementOrId;

    if (!element) {
      throw new Error('Gate pass element not found for PDF export.');
    }

    // Wait for all images to load before capturing
    await waitForImages(element);

    // Force the element to show full content temporarily
    const originalOverflow = element.style.overflow;
    const originalOverflowX = element.style.overflowX;
    const originalOverflowY = element.style.overflowY;
    const originalMaxWidth = element.style.maxWidth;
    const originalHeight = element.style.height;

    element.style.overflow = 'visible';
    element.style.overflowX = 'visible';
    element.style.overflowY = 'visible';
    element.style.maxWidth = '2000px';
    element.style.height = 'auto';

    // Force all children to show full content
    const allChildren = element.querySelectorAll('*');
    allChildren.forEach(child => {
      child.dataset.originalOverflow = child.style.overflow;
      child.style.overflow = 'visible';
    });

    // Wait for layout to update
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get the full scrollable dimensions
    const fullHeight = element.scrollHeight;
    const fullWidth = element.scrollWidth;

    // Capture with html2canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: fullWidth,
      windowHeight: fullHeight,
      scrollX: 0,
      scrollY: 0,
      width: fullWidth,
      height: fullHeight
    });

    // Restore original styles
    element.style.overflow = originalOverflow;
    element.style.overflowX = originalOverflowX;
    element.style.overflowY = originalOverflowY;
    element.style.maxWidth = originalMaxWidth;
    element.style.height = originalHeight;

    allChildren.forEach(child => {
      if (child.dataset.originalOverflow !== undefined) {
        child.style.overflow = child.dataset.originalOverflow;
        delete child.dataset.originalOverflow;
      }
    });

    const imgData = canvas.toDataURL('image/png', 0.95);

    // Create PDF in portrait orientation (standard A4)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Compute dimensions with comfortable margins
    const margin = 12; // 12mm margin
    const usableWidth = pdfWidth - (margin * 2);
    const imgProps = pdf.getImageProperties(imgData);
    const usableHeight = (imgProps.height * usableWidth) / imgProps.width;

    // Position centered vertically if within page bounds
    const posY = usableHeight < (pdfHeight - margin * 2)
      ? (pdfHeight - usableHeight) / 2
      : margin;

    pdf.addImage(imgData, 'PNG', margin, posY, usableWidth, usableHeight, '', 'FAST');
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('PDF Generation Failed:', error);
    throw error;
  }
}
