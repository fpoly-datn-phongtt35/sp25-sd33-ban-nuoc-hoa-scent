declare module 'html2pdf.js' {
    interface Html2PdfOptions {
      margin?: number | [number, number] | [number, number, number, number];
      filename?: string;
      image: { type: 'jpeg', quality: 0.5 }, // Giảm chất lượng hình ảnh để tăng tốc
  html2canvas: { scale: 1, useCORS: true },
      jsPDF?: { unit: string; format: string; orientation: string };
    }
  
    interface Html2Pdf {
      from(element: HTMLElement): Html2Pdf;
      set(options: Html2PdfOptions): Html2Pdf;
      save(): Promise<void>;
    }
  
    function html2pdf(): Html2Pdf;
    export default html2pdf;
  }