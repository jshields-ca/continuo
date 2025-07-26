

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface InvoiceData {
  id: string;
  number: string;
  status: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  vatAmount: number;
  total: number;
  notes?: string;
  customerName: string;
  customerAddress?: string;
  customerEmail?: string;
  customerPhone?: string;
  companyName: string;
  companyAddress?: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    vatRate: number;
    amount: number;
  }>;
}

export class PDFService {
  /**
   * Generate and download a PDF invoice using jsPDF
   */
  static async generateInvoicePDF(invoice: InvoiceData): Promise<void> {
    try {
      // Create HTML template
      const htmlContent = this.createInvoiceHTML(invoice);
      
      // Create a temporary container
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.backgroundColor = 'white';
      container.style.padding = '40px';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '12px';
      container.style.lineHeight = '1.4';
      container.style.color = '#1f2937';
      
      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .company-info h1 {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 8px 0;
        }
        .company-info p {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-info h1 {
          font-size: 32px;
          font-weight: bold;
          color: #3b82f6;
          margin: 0 0 8px 0;
        }
        .invoice-info p {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 4px 0;
        }
        .customer-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .customer-info h3 {
          font-size: 12px;
          font-weight: bold;
          color: #374151;
          margin: 0 0 8px 0;
        }
        .customer-info p {
          font-size: 14px;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 4px 0;
        }
        .customer-info .details {
          font-size: 10px;
          color: #6b7280;
          margin: 0 0 4px 0;
        }
        .invoice-details {
          flex: 1;
          text-align: right;
        }
        .detail-row {
          margin-bottom: 4px;
        }
        .detail-label {
          font-size: 10px;
          color: #6b7280;
          margin-right: 20px;
        }
        .detail-value {
          font-size: 10px;
          color: #1f2937;
          font-weight: bold;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th {
          background-color: #f9fafb;
          padding: 12px 16px;
          text-align: left;
          font-size: 10px;
          font-weight: bold;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table td {
          padding: 12px 16px;
          font-size: 10px;
          color: #1f2937;
          border-bottom: 1px solid #f3f4f6;
        }
        .items-table .text-center { text-align: center; }
        .items-table .text-right { text-align: right; }
        .items-table .font-bold { font-weight: bold; }
        .totals-section {
          text-align: right;
          margin-bottom: 30px;
        }
        .total-row {
          margin-bottom: 4px;
        }
        .total-label {
          font-size: 12px;
          color: #6b7280;
          margin-right: 20px;
        }
        .total-value {
          font-size: 12px;
          color: #1f2937;
          font-weight: bold;
        }
        .grand-total {
          font-size: 16px;
          color: #1f2937;
          font-weight: bold;
          border-top: 2px solid #e5e7eb;
          padding-top: 8px;
          margin-top: 8px;
        }
        .notes-section {
          margin-bottom: 30px;
        }
        .notes-section h3 {
          font-size: 12px;
          font-weight: bold;
          color: #374151;
          margin: 0 0 8px 0;
        }
        .notes-section p {
          font-size: 10px;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }
        .footer p {
          font-size: 8px;
          color: #9ca3af;
          margin: 0 0 4px 0;
        }
      `;
      
      container.appendChild(style);
      document.body.appendChild(container);
      
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: container.scrollHeight,
      });
      
      // Remove temporary container
      document.body.removeChild(container);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download PDF
      pdf.save(`Invoice-${invoice.number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF invoice');
    }
  }

  /**
   * Generate PDF and open in new tab for preview
   */
  static async previewInvoicePDF(invoice: InvoiceData): Promise<void> {
    try {
      // Create HTML template
      const htmlContent = this.createInvoiceHTML(invoice);
      
      // Create a temporary container
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.backgroundColor = 'white';
      container.style.padding = '40px';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '12px';
      container.style.lineHeight = '1.4';
      container.style.color = '#1f2937';
      
      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .company-info h1 {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 8px 0;
        }
        .company-info p {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-info h1 {
          font-size: 32px;
          font-weight: bold;
          color: #3b82f6;
          margin: 0 0 8px 0;
        }
        .invoice-info p {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 4px 0;
        }
        .customer-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .customer-info h3 {
          font-size: 12px;
          font-weight: bold;
          color: #374151;
          margin: 0 0 8px 0;
        }
        .customer-info p {
          font-size: 14px;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 4px 0;
        }
        .customer-info .details {
          font-size: 10px;
          color: #6b7280;
          margin: 0 0 4px 0;
        }
        .invoice-details {
          flex: 1;
          text-align: right;
        }
        .detail-row {
          margin-bottom: 4px;
        }
        .detail-label {
          font-size: 10px;
          color: #6b7280;
          margin-right: 20px;
        }
        .detail-value {
          font-size: 10px;
          color: #1f2937;
          font-weight: bold;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th {
          background-color: #f9fafb;
          padding: 12px 16px;
          text-align: left;
          font-size: 10px;
          font-weight: bold;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table td {
          padding: 12px 16px;
          font-size: 10px;
          color: #1f2937;
          border-bottom: 1px solid #f3f4f6;
        }
        .items-table .text-center { text-align: center; }
        .items-table .text-right { text-align: right; }
        .items-table .font-bold { font-weight: bold; }
        .totals-section {
          text-align: right;
          margin-bottom: 30px;
        }
        .total-row {
          margin-bottom: 4px;
        }
        .total-label {
          font-size: 12px;
          color: #6b7280;
          margin-right: 20px;
        }
        .total-value {
          font-size: 12px;
          color: #1f2937;
          font-weight: bold;
        }
        .grand-total {
          font-size: 16px;
          color: #1f2937;
          font-weight: bold;
          border-top: 2px solid #e5e7eb;
          padding-top: 8px;
          margin-top: 8px;
        }
        .notes-section {
          margin-bottom: 30px;
        }
        .notes-section h3 {
          font-size: 12px;
          font-weight: bold;
          color: #374151;
          margin: 0 0 8px 0;
        }
        .notes-section p {
          font-size: 10px;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }
        .footer p {
          font-size: 8px;
          color: #9ca3af;
          margin: 0 0 4px 0;
        }
      `;
      
      container.appendChild(style);
      document.body.appendChild(container);
      
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: container.scrollHeight,
      });
      
      // Remove temporary container
      document.body.removeChild(container);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Convert PDF to blob and open in new tab
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Open PDF in new tab
      const previewWindow = window.open(pdfUrl, '_blank');
      if (!previewWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
      
      // Clean up URL object after a delay
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      throw new Error('Failed to preview PDF invoice');
    }
  }

  /**
   * Create HTML template for invoice
   */
  private static createInvoiceHTML(invoice: InvoiceData): string {
    const formatCurrency = (amount: number, currency: string) => {
      const symbols = {
        CAD: 'C$',
        USD: '$',
        EUR: '€',
        GBP: '£',
      };
      const symbol = symbols[currency as keyof typeof symbols] || currency;
      return `${symbol}${amount.toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const getStatusColor = (status: string) => {
      const colors = {
        DRAFT: '#6b7280',
        SENT: '#3b82f6',
        PAID: '#10b981',
        OVERDUE: '#ef4444',
        VOID: '#f59e0b',
      };
      return colors[status as keyof typeof colors] || '#6b7280';
    };

    return `
      <!-- Header -->
      <div class="header">
        <div class="company-info">
          <h1>${invoice.companyName}</h1>
          ${invoice.companyAddress ? `<p>${invoice.companyAddress}</p>` : ''}
        </div>
        <div class="invoice-info">
          <h1>INVOICE</h1>
          <p>#${invoice.number}</p>
          <p>Issued: ${formatDate(invoice.issueDate)}</p>
        </div>
      </div>

      <!-- Customer and Invoice Details -->
      <div class="customer-section">
        <div class="customer-info">
          <h3>Bill To:</h3>
          <p>${invoice.customerName}</p>
          ${invoice.customerAddress ? `<p class="details">${invoice.customerAddress}</p>` : ''}
          ${invoice.customerEmail ? `<p class="details">${invoice.customerEmail}</p>` : ''}
          ${invoice.customerPhone ? `<p class="details">${invoice.customerPhone}</p>` : ''}
        </div>
        <div class="invoice-details">
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value" style="color: ${getStatusColor(invoice.status)};">${invoice.status}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Currency:</span>
            <span class="detail-value">${invoice.currency}</span>
          </div>
          ${invoice.dueDate ? `
            <div class="detail-row">
              <span class="detail-label">Due Date:</span>
              <span class="detail-value">${formatDate(invoice.dueDate)}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 40%;">Description</th>
            <th style="width: 10%; text-align: center;">Qty</th>
            <th style="width: 15%; text-align: right;">Unit Price</th>
            <th style="width: 10%; text-align: center;">Tax %</th>
            <th style="width: 10%; text-align: center;">VAT %</th>
            <th style="width: 15%; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unitPrice, invoice.currency)}</td>
              <td class="text-center">${item.taxRate}%</td>
              <td class="text-center">${item.vatRate}%</td>
              <td class="text-right font-bold">${formatCurrency(item.amount, invoice.currency)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals-section">
        <div class="total-row">
          <span class="total-label">Subtotal:</span>
          <span class="total-value">${formatCurrency(invoice.subtotal, invoice.currency)}</span>
        </div>
        ${invoice.taxAmount > 0 ? `
          <div class="total-row">
            <span class="total-label">Tax:</span>
            <span class="total-value">${formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
        ` : ''}
        ${invoice.vatAmount > 0 ? `
          <div class="total-row">
            <span class="total-label">VAT:</span>
            <span class="total-value">${formatCurrency(invoice.vatAmount, invoice.currency)}</span>
          </div>
        ` : ''}
        <div class="total-row grand-total">
          <span class="grand-total">Total:</span>
          <span class="grand-total">${formatCurrency(invoice.total, invoice.currency)}</span>
        </div>
      </div>

      <!-- Notes -->
      ${invoice.notes ? `
        <div class="notes-section">
          <h3>Notes:</h3>
          <p>${invoice.notes}</p>
        </div>
      ` : ''}

      <!-- Footer -->
      <div class="footer">
        <p>Thank you for your business! This invoice was generated by Continuo Platform.</p>
        <p>Invoice #${invoice.number} • Generated on ${formatDate(new Date().toISOString())}</p>
      </div>
    `;
  }
} 