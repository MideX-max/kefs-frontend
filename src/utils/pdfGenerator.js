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

    // Save all original styles
    const originalStyles = {
      overflow: element.style.overflow,
      overflowX: element.style.overflowX,
      overflowY: element.style.overflowY,
      maxWidth: element.style.maxWidth,
      width: element.style.width,
      height: element.style.height,
      minHeight: element.style.minHeight,
      position: element.style.position,
      display: element.style.display
    };

    // Force element to expand to show all content
    element.style.overflow = 'visible';
    element.style.overflowX = 'visible';
    element.style.overflowY = 'visible';
    element.style.maxWidth = '2000px';
    element.style.width = '740px';
    element.style.height = 'auto';
    element.style.minHeight = 'auto';
    element.style.position = 'relative';
    element.style.display = 'block';

    // Force all children to be visible
    const allChildren = element.querySelectorAll('*');
    allChildren.forEach(child => {
      child.dataset.originalOverflow = child.style.overflow;
      child.style.overflow = 'visible';
    });

    // Wait for layout to update
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get the full dimensions after forcing expansion
    const fullHeight = element.scrollHeight;
    const fullWidth = element.scrollWidth;

    // Capture element with html2canvas
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
      height: fullHeight,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(element.id) || element;
        clonedElement.style.width = fullWidth + 'px';
        clonedElement.style.height = fullHeight + 'px';
        clonedElement.style.overflow = 'visible';
        clonedElement.style.maxWidth = 'none';
        clonedElement.style.minHeight = fullHeight + 'px';
        clonedElement.style.position = 'relative';

        // Force all cloned children to be visible
        const clonedChildren = clonedElement.querySelectorAll('*');
        clonedChildren.forEach(child => {
          child.style.overflow = 'visible';
        });
      }
    });

    // Restore all original styles
    element.style.overflow = originalStyles.overflow;
    element.style.overflowX = originalStyles.overflowX;
    element.style.overflowY = originalStyles.overflowY;
    element.style.maxWidth = originalStyles.maxWidth;
    element.style.width = originalStyles.width;
    element.style.height = originalStyles.height;
    element.style.minHeight = originalStyles.minHeight;
    element.style.position = originalStyles.position;
    element.style.display = originalStyles.display;

    // Restore children overflow
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
