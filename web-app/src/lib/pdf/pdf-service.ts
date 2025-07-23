

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
   * Generate and download a PDF invoice using browser print functionality
   */
  static async generateInvoicePDF(invoice: InvoiceData): Promise<void> {
    try {
      // Create HTML template
      const htmlContent = this.createInvoiceHTML(invoice);
      
      // Create a new window with the invoice
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${invoice.number}</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                background: white;
              }
              .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 40px;
              }
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
              .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
              }
              .print-button:hover {
                background: #2563eb;
              }
            </style>
          </head>
          <body>
            <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>
            <div class="invoice-container">
              ${htmlContent}
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF invoice');
    }
  }

  /**
   * Open PDF in new tab for preview
   */
  static async previewInvoicePDF(invoice: InvoiceData): Promise<void> {
    try {
      // Create HTML template
      const htmlContent = this.createInvoiceHTML(invoice);
      
      // Create a new window with the invoice
      const previewWindow = window.open('', '_blank');
      if (!previewWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${invoice.number} - Preview</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                background: #f5f5f5;
              }
              .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
              }
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
              .action-buttons {
                position: fixed;
                top: 20px;
                right: 20px;
                display: flex;
                gap: 10px;
              }
              .action-button {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                text-decoration: none;
                display: inline-block;
              }
              .print-button {
                background: #3b82f6;
                color: white;
              }
              .print-button:hover {
                background: #2563eb;
              }
              .download-button {
                background: #10b981;
                color: white;
              }
              .download-button:hover {
                background: #059669;
              }
            </style>
          </head>
          <body>
            <div class="action-buttons">
              <button class="action-button print-button" onclick="window.print()">Print / Save as PDF</button>
              <button class="action-button download-button" onclick="window.print()">Download PDF</button>
            </div>
            <div class="invoice-container">
              ${htmlContent}
            </div>
          </body>
        </html>
      `);

      previewWindow.document.close();
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