declare module 'html2pdf.js' {
    interface Html2PdfOptions {
      margin: [10, 10, 10, 10] // Lề trên, phải, dưới, trái

      filename?: string;
      image: { type: 'jpeg', quality: 1}, // Giảm chất lượng hình ảnh để tăng tốc
  html2canvas: { scale: 2 },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }

    }

    interface Html2Pdf {
      from(element: HTMLElement): Html2Pdf;
      set(options: Html2PdfOptions): Html2Pdf;
      save(): Promise<void>;
    }

    function html2pdf(): Html2Pdf;
    export default html2pdf;
  }
