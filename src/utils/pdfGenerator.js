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

    // Get current dimensions
    const rect = element.getBoundingClientRect();
    const scrollHeight = element.scrollHeight;
    const scrollWidth = element.scrollWidth;

    console.log('Element dimensions:', { 
      clientHeight: element.clientHeight, 
      scrollHeight, 
      offsetHeight: element.offsetHeight,
      clientWidth: element.clientWidth,
      scrollWidth,
      offsetWidth: element.offsetWidth
    });

    // Capture the element with onclone to remove constraints
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true,
      backgroundColor: '#ffffff',
      windowWidth: scrollWidth,
      windowHeight: scrollHeight,
      scrollX: 0,
      scrollY: 0,
      width: scrollWidth,
      height: scrollHeight,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(element.id);
        if (clonedElement) {
          // Remove all overflow constraints
          clonedElement.style.overflow = 'visible';
          clonedElement.style.overflowX = 'visible';
          clonedElement.style.overflowY = 'visible';
          clonedElement.style.maxWidth = 'none';
          clonedElement.style.width = scrollWidth + 'px';
          clonedElement.style.height = scrollHeight + 'px';
          clonedElement.style.minHeight = scrollHeight + 'px';

          // Remove constraints from all children
          const allChildren = clonedElement.querySelectorAll('*');
          allChildren.forEach(child => {
            child.style.overflow = 'visible';
            child.style.overflowX = 'visible';
            child.style.overflowY = 'visible';
            child.style.maxHeight = 'none';
            child.style.maxWidth = 'none';
            child.style.minHeight = 'auto';
            child.style.height = 'auto';
          });
        }
      }
    });

    const imgData = canvas.toDataURL('image/png', 0.95);

    console.log('Canvas dimensions:', { 
      width: canvas.width, 
      height: canvas.height 
    });

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

    console.log('PDF dimensions:', { imgProps, usableWidth, usableHeight });

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
