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

    // Capture element with html2canvas at high resolution
    const canvas = await html2canvas(element, {
      scale: 2, // Reduced from 3 to prevent memory issues
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure cloned element has proper dimensions
        const clonedElement = clonedDoc.getElementById(element.id) || element;
        clonedElement.style.width = element.scrollWidth + 'px';
        clonedElement.style.height = element.scrollHeight + 'px';
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
