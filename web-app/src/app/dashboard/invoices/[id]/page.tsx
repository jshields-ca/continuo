'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter, useParams } from 'next/navigation';
import { 
  GET_INVOICE,
  GET_INVOICE_STATS,
  GET_INVOICE_HISTORY
} from '@/lib/graphql/queries';
import { 
  DELETE_INVOICE_MUTATION,
  SEND_INVOICE_MUTATION,
  VOID_INVOICE_MUTATION,
  DUPLICATE_INVOICE_MUTATION
} from '@/lib/graphql/mutations';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { PDFService, InvoiceData } from '@/lib/pdf/pdf-service';
import { format } from 'date-fns';
import Link from 'next/link';

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  VOID: 'bg-yellow-100 text-yellow-800',
};

const statusIcons = {
  DRAFT: ClockIcon,
  SENT: PaperAirplaneIcon,
  PAID: CheckCircleIcon,
  OVERDUE: XCircleIcon,
  VOID: XCircleIcon,
};

const currencySymbols = {
  CAD: 'C$',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Queries
  const { data: invoiceData, loading: invoiceLoading, refetch: refetchInvoice } = useQuery(GET_INVOICE, {
    variables: { id: invoiceId },
    skip: !invoiceId,
  });

  const { data: historyData, loading: historyLoading } = useQuery(GET_INVOICE_HISTORY, {
    variables: { 
      invoiceId,
      limit: 50,
      offset: 0
    },
    skip: !invoiceId,
  });

  // Mutations
  const [deleteInvoice] = useMutation(DELETE_INVOICE_MUTATION);
  const [sendInvoice] = useMutation(SEND_INVOICE_MUTATION);
  const [voidInvoice] = useMutation(VOID_INVOICE_MUTATION);
  const [duplicateInvoice] = useMutation(DUPLICATE_INVOICE_MUTATION);

  const invoice = invoiceData?.invoice;

  const handleDeleteInvoice = async () => {
    if (!invoice) return;
    
    setActionLoading('delete');
    try {
      await deleteInvoice({
        variables: { id: invoice.id },
      });
      router.push('/dashboard/invoices');
    } catch (error) {
      console.error('Error deleting invoice:', error);
    } finally {
      setActionLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;
    
    setActionLoading('send');
    try {
      await sendInvoice({
        variables: { id: invoice.id },
      });
      await refetchInvoice();
    } catch (error) {
      console.error('Error sending invoice:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVoidInvoice = async () => {
    if (!invoice) return;
    
    setActionLoading('void');
    try {
      await voidInvoice({
        variables: { id: invoice.id },
      });
      await refetchInvoice();
    } catch (error) {
      console.error('Error voiding invoice:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicateInvoice = async () => {
    if (!invoice) return;
    
    setActionLoading('duplicate');
    try {
      const result = await duplicateInvoice({
        variables: { id: invoice.id },
      });
      if (result.data?.duplicateInvoice?.id) {
        router.push(`/dashboard/invoices/${result.data.duplicateInvoice.id}`);
      }
    } catch (error) {
      console.error('Error duplicating invoice:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    setPdfLoading(true);
    try {
      const invoiceData: InvoiceData = {
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        vatAmount: invoice.vatAmount,
        total: invoice.total,
        notes: invoice.notes,
        customerName: invoice.customerName,
        customerAddress: invoice.customerAddress,
        customerEmail: invoice.customer?.email,
        customerPhone: invoice.customer?.phone,
        companyName: invoice.companyName || 'Your Company',
        companyAddress: invoice.companyAddress,
        items: invoice.items?.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          vatRate: item.vatRate,
          amount: item.amount,
        })) || [],
      };
      
      await PDFService.generateInvoicePDF(invoiceData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePreviewPDF = async () => {
    if (!invoice) return;
    
    setPdfLoading(true);
    try {
      const invoiceData: InvoiceData = {
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        vatAmount: invoice.vatAmount,
        total: invoice.total,
        notes: invoice.notes,
        customerName: invoice.customerName,
        customerAddress: invoice.customerAddress,
        customerEmail: invoice.customer?.email,
        customerPhone: invoice.customer?.phone,
        companyName: invoice.companyName || 'Your Company',
        companyAddress: invoice.companyAddress,
        items: invoice.items?.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          vatRate: item.vatRate,
          amount: item.amount,
        })) || [],
      };
      
      await PDFService.previewInvoicePDF(invoiceData);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      alert('Failed to preview PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const formatCurrency = (amount: number | string, currency: string) => {
    const symbol = currencySymbols[currency as keyof typeof currencySymbols] || currency;
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${symbol}${numericAmount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusBadge = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  // Helper function to format history entries
  const formatHistoryEntry = (entry: any) => {
    const actionColors = {
      'INVOICE_CREATED': 'bg-green-100 text-green-800',
      'FIELD_UPDATED': 'bg-blue-100 text-blue-800',
      'ITEM_ADDED': 'bg-purple-100 text-purple-800',
      'ITEM_UPDATED': 'bg-yellow-100 text-yellow-800',
      'ITEM_DELETED': 'bg-red-100 text-red-800',
    };

    const actionIcons = {
      'INVOICE_CREATED': '📄',
      'FIELD_UPDATED': '✏️',
      'ITEM_ADDED': '➕',
      'ITEM_UPDATED': '🔄',
      'ITEM_DELETED': '🗑️',
    };

    const getActionDescription = () => {
      switch (entry.action) {
        case 'INVOICE_CREATED':
          return 'Invoice Created';
        case 'FIELD_UPDATED':
          return `Updated ${entry.field}`;
        case 'ITEM_ADDED':
          return 'Added Item';
        case 'ITEM_UPDATED':
          return `Updated Item ${entry.field ? `- ${entry.field}` : ''}`;
        case 'ITEM_DELETED':
          return 'Deleted Item';
        default:
          return entry.action;
      }
    };

    const getChangeDetails = () => {
      if (entry.action === 'FIELD_UPDATED' && entry.oldValue !== null && entry.newValue !== null) {
        const fieldName = entry.field?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        // Format values based on field type
        let oldVal = entry.oldValue;
        let newVal = entry.newValue;
        
        if (entry.field === 'issueDate' || entry.field === 'dueDate') {
          oldVal = oldVal ? formatDate(oldVal) : 'None';
          newVal = newVal ? formatDate(newVal) : 'None';
        } else if (entry.field === 'currency') {
          oldVal = oldVal || 'None';
          newVal = newVal || 'None';
        } else if (entry.field === 'status') {
          oldVal = oldVal || 'None';
          newVal = newVal || 'None';
        } else if (entry.field === 'amount' || entry.field === 'total' || entry.field === 'subtotal' || entry.field === 'taxAmount') {
          oldVal = formatCurrency(oldVal, invoice?.currency || 'CAD');
          newVal = formatCurrency(newVal, invoice?.currency || 'CAD');
        }
        
        return `${oldVal} → ${newVal}`;
      }
      
      if (entry.action === 'ITEM_ADDED' && entry.newValue) {
        const item = entry.newValue;
        return `${item.description} (${item.quantity} × ${formatCurrency(item.unitPrice || 0, invoice?.currency || 'CAD')})`;
      }
      
      if (entry.action === 'ITEM_DELETED' && entry.oldValue) {
        const item = entry.oldValue;
        return `${item.description} (${item.quantity} × ${formatCurrency(item.unitPrice || 0, invoice?.currency || 'CAD')})`;
      }
      
      if (entry.action === 'ITEM_UPDATED' && entry.oldValue !== null && entry.newValue !== null) {
        const fieldName = entry.field?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        let oldVal = entry.oldValue;
        let newVal = entry.newValue;
        
        if (entry.field === 'quantity' || entry.field === 'unitPrice') {
          if (entry.field === 'unitPrice') {
            oldVal = formatCurrency(oldVal, invoice?.currency || 'CAD');
            newVal = formatCurrency(newVal, invoice?.currency || 'CAD');
          } else {
            oldVal = oldVal.toString();
            newVal = newVal.toString();
          }
        }
        
        return `${fieldName}: ${oldVal} → ${newVal}`;
      }
      
      return null;
    };

    return {
      description: getActionDescription(),
      details: getChangeDetails(),
      color: actionColors[entry.action as keyof typeof actionColors] || 'bg-gray-100 text-gray-800',
      icon: actionIcons[entry.action as keyof typeof actionIcons] || '📝',
      user: entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'Unknown User',
      timestamp: formatDate(entry.createdAt)
    };
  };

  if (invoiceLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h2>
          <p className="text-gray-600 mb-6">The invoice you're looking for doesn't exist or has been deleted.</p>
          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/dashboard/invoices"
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </Link>
                <div>
                  <p className="text-sm text-gray-500">
                    Created on {formatDate(invoice.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {getStatusBadge(invoice.status)}
                
                <div className="flex items-center space-x-2">
                  {invoice.status === 'DRAFT' && (
                    <>
                      <Link
                        href={`/dashboard/invoices/${invoice.id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                      
                      <button
                        onClick={handleSendInvoice}
                        disabled={actionLoading === 'send'}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                        {actionLoading === 'send' ? 'Sending...' : 'Send'}
                      </button>
                    </>
                  )}
                  
                  {invoice.status !== 'VOID' && (
                    <button
                      onClick={handleVoidInvoice}
                      disabled={actionLoading === 'void'}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
                    >
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      {actionLoading === 'void' ? 'Voiding...' : 'Void'}
                    </button>
                  )}
                  
                  <button
                    onClick={handleDuplicateInvoice}
                    disabled={actionLoading === 'duplicate'}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                    {actionLoading === 'duplicate' ? 'Duplicating...' : 'Duplicate'}
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Invoice Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              {/* Invoice Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {invoice.companyName || 'Your Company'}
                    </h2>
                    {invoice.companyAddress && (
                      <p className="text-sm text-gray-600 mt-1">
                        {invoice.companyAddress}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-900">
                      INVOICE
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      #{invoice.number}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Info */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Bill To:</h3>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{invoice.customerName}</p>
                      {invoice.customerAddress && (
                        <p className="mt-1">{invoice.customerAddress}</p>
                      )}
                      {invoice.customer?.email && (
                        <p className="mt-1">{invoice.customer.email}</p>
                      )}
                      {invoice.customer?.phone && (
                        <p className="mt-1">{invoice.customer.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Issue Date:</p>
                        <p className="font-medium">{formatDate(invoice.issueDate)}</p>
                      </div>
                      {invoice.dueDate && (
                        <div>
                          <p className="text-gray-500">Due Date:</p>
                          <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500">Currency:</p>
                        <p className="font-medium">{invoice.currency}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status:</p>
                        <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="px-6 py-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax %
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VAT %
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoice.items?.map((item: any, index: number) => (
                      <tr key={item.id || index}>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(item.unitPrice, invoice.currency)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.taxRate}%
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.vatRate}%
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                          {formatCurrency(item.amount, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Totals */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                      </div>
                      {invoice.taxAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax:</span>
                          <span className="font-medium">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                        </div>
                      )}
                      {invoice.vatAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">VAT:</span>
                          <span className="font-medium">{formatCurrency(invoice.vatAmount, invoice.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Notes:</h3>
                  <p className="text-sm text-gray-600">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
                         {/* Quick Actions */}
             <div className="bg-white shadow rounded-lg p-6">
               <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
               <div className="space-y-3">
                 <button 
                   onClick={handleDownloadPDF}
                   disabled={pdfLoading}
                   className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                 >
                   <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                   {pdfLoading ? 'Generating...' : 'Download PDF'}
                 </button>
                 
                 <button 
                   onClick={handlePreviewPDF}
                   disabled={pdfLoading}
                   className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                 >
                   <EyeIcon className="w-4 h-4 mr-2" />
                   {pdfLoading ? 'Generating...' : 'Preview PDF'}
                 </button>
                 
                 <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                   <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                   Send Email
                 </button>
               </div>
             </div>

            {/* Payment Information */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payments</h3>
                <div className="space-y-3">
                  {invoice.payments.map((payment: any) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.paymentMethod} • {formatDate(payment.paymentDate)}
                          </p>
                          {payment.reference && (
                            <p className="text-xs text-gray-500">Ref: {payment.reference}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice History */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice History</h3>
              
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : historyData?.invoiceHistory && historyData.invoiceHistory.length > 0 ? (
                <div className="space-y-4">
                  {historyData.invoiceHistory.map((entry: any) => {
                    const formattedEntry = formatHistoryEntry(entry);
                    return (
                      <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${formattedEntry.color}`}>
                              {formattedEntry.icon}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {formattedEntry.description}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formattedEntry.timestamp}
                              </span>
                            </div>
                            {formattedEntry.details && (
                              <p className="text-sm text-gray-600 mt-1">
                                {formattedEntry.details}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              by {formattedEntry.user}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No history available for this invoice.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Invoice</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete invoice #{invoice.number}? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteInvoice}
                  disabled={actionLoading === 'delete'}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 