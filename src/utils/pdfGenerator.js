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

    // Small delay to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Clone the element to avoid affecting the UI
    const clone = element.cloneNode(true);
    clone.id = 'kas-pass-clone';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.overflow = 'visible';
    clone.style.overflowX = 'visible';
    clone.style.overflowY = 'visible';
    clone.style.maxWidth = 'none';
    clone.style.width = '740px';
    clone.style.height = 'auto';
    clone.style.minHeight = 'auto';
    clone.style.display = 'block';
    clone.style.opacity = '1';

    // Force all children to be visible
    const allChildren = clone.querySelectorAll('*');
    allChildren.forEach(child => {
      child.style.overflow = 'visible';
      child.style.overflowX = 'visible';
      child.style.overflowY = 'visible';
      child.style.maxHeight = 'none';
      child.style.maxWidth = 'none';
    });

    // Add clone to document temporarily
    document.body.appendChild(clone);

    // Wait for clone to render
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get dimensions
    const fullHeight = clone.scrollHeight;
    const fullWidth = clone.scrollWidth;

    // Capture the clone
    const canvas = await html2canvas(clone, {
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

    // Remove clone from document
    document.body.removeChild(clone);

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
