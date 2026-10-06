import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePassPDF(elementOrId, filename = 'KEFFI_APARTMENT_PASS.pdf') {
  try {
    const element = typeof elementOrId === 'string' 
      ? document.getElementById(elementOrId) 
      : elementOrId;

    if (!element) {
      throw new Error('Gate pass element not found for PDF export.');
    }

    // Save original styles
    const originalOverflow = element.style.overflow;
    const originalMaxWidth = element.style.maxWidth;
    const originalWidth = element.style.width;

    // Temporarily remove constraints for full capture
    element.style.overflow = 'visible';
    element.style.maxWidth = '740px';
    element.style.width = '740px';

    // Wait for layout to update
    await new Promise(resolve => setTimeout(resolve, 300));

    // Capture element with html2canvas at high resolution
    const canvas = await html2canvas(element, {
      scale: 3, // High DPI for crisp printing
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 740,
      windowHeight: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      width: 740,
      height: element.scrollHeight
    });

    // Restore original styles
    element.style.overflow = originalOverflow;
    element.style.maxWidth = originalMaxWidth;
    element.style.width = originalWidth;

    const imgData = canvas.toDataURL('image/png');

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
