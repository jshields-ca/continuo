'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_INVOICES, 
  GET_INVOICE_STATS, 
  GET_CUSTOMERS
} from '@/lib/graphql/queries';
import { 
  DELETE_INVOICE_MUTATION,
  SEND_INVOICE_MUTATION,
  VOID_INVOICE_MUTATION,
  DUPLICATE_INVOICE_MUTATION
} from '@/lib/graphql/mutations';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { PDFService, InvoiceData } from '@/lib/pdf/pdf-service';
import { format } from 'date-fns';
import Link from 'next/link';

interface Invoice {
  id: string;
  number: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID';
  issueDate: string;
  dueDate?: string;
  currency: 'CAD' | 'USD' | 'EUR' | 'GBP';
  subtotal?: number;
  taxAmount?: number;
  vatAmount?: number;
  total: number;
  notes?: string;
  customerName: string;
  customerAddress?: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  companyName?: string;
  companyAddress?: string;
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    vatRate: number;
    amount: number;
  }>;
  createdAt: string;
}

interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  overdueAmount: number;
  draftAmount: number;
  averageInvoiceAmount: number;
  currencyBreakdown: Array<{
    currency: string;
    count: number;
    totalAmount: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  VOID: 'bg-yellow-100 text-yellow-800',
};

const currencySymbols = {
  CAD: 'C$',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Queries
  const { data: invoicesData, loading: invoicesLoading, refetch: refetchInvoices } = useQuery(GET_INVOICES, {
    variables: {
      filter: {
        ...(statusFilter && { status: statusFilter }),
        ...(customerFilter && { customerId: customerFilter }),
      },
      orderBy: { field: 'CREATED_AT', direction: 'DESC' },
      limit: 50,
    },
    fetchPolicy: 'cache-and-network', // Always fetch fresh data
    notifyOnNetworkStatusChange: true, // Notify on refetch
  });

  const { data: statsData, loading: statsLoading } = useQuery(GET_INVOICE_STATS, {
    variables: {
      filter: {
        ...(statusFilter && { status: statusFilter }),
        ...(customerFilter && { customerId: customerFilter }),
      },
    },
  });

  const { data: customersData, loading: customersLoading } = useQuery(GET_CUSTOMERS, {
    variables: {
      first: 100,
    },
  });

  // Mutations
  const [deleteInvoice] = useMutation(DELETE_INVOICE_MUTATION, {
    update: (cache, { data }) => {
      if (data?.deleteInvoice) {
        // Remove from cache
        cache.modify({
          fields: {
            invoices(existingInvoices = [], { readField }) {
              return existingInvoices.filter((invoiceRef: any) => 
                readField('id', invoiceRef) !== data.deleteInvoice
              );
            },
          },
        });
      }
    },
  });
  
  const [sendInvoice] = useMutation(SEND_INVOICE_MUTATION, {
    update: (cache, { data }) => {
      if (data?.sendInvoice) {
        // Update invoice status in cache
        cache.modify({
          id: cache.identify({ __typename: 'Invoice', id: data.sendInvoice.id }),
          fields: {
            status() {
              return 'SENT';
            },
          },
        });
      }
    },
  });
  
  const [voidInvoice] = useMutation(VOID_INVOICE_MUTATION, {
    update: (cache, { data }) => {
      if (data?.voidInvoice) {
        // Update invoice status in cache
        cache.modify({
          id: cache.identify({ __typename: 'Invoice', id: data.voidInvoice.id }),
          fields: {
            status() {
              return 'VOID';
            },
          },
        });
      }
    },
  });
  
  const [duplicateInvoice] = useMutation(DUPLICATE_INVOICE_MUTATION, {
    update: (cache, { data }) => {
      if (data?.duplicateInvoice) {
        // Add new invoice to cache
        try {
          const existingInvoices = cache.readQuery({
            query: GET_INVOICES,
            variables: {
              filter: {},
              orderBy: { field: 'CREATED_AT', direction: 'DESC' },
              limit: 50,
            },
          });

          if (existingInvoices && (existingInvoices as any).invoices) {
            cache.writeQuery({
              query: GET_INVOICES,
              variables: {
                filter: {},
                orderBy: { field: 'CREATED_AT', direction: 'DESC' },
                limit: 50,
              },
              data: {
                invoices: [data.duplicateInvoice, ...(existingInvoices as any).invoices],
              },
            });
          }
        } catch (error) {
          console.log('Cache update failed for duplicate:', error);
        }
      }
    },
  });

  const invoices = invoicesData?.invoices || [];
  const stats = statsData?.invoiceStats;
  const customers = customersData?.customers?.edges?.map((edge: any) => edge.node) || [];

  // Refetch data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetchInvoices();
      }
    };

    const handleFocus = () => {
      refetchInvoices();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetchInvoices]);

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice({ variables: { id } });
        refetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice');
      }
    }
  };

  const handleSendInvoice = async (id: string) => {
    try {
      await sendInvoice({ variables: { id } });
      refetchInvoices();
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice');
    }
  };

  const handleVoidInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to void this invoice?')) {
      try {
        await voidInvoice({ variables: { id } });
        refetchInvoices();
      } catch (error) {
        console.error('Error voiding invoice:', error);
        alert('Failed to void invoice');
      }
    }
  };

  const handleDuplicateInvoice = async (id: string) => {
    try {
      const result = await duplicateInvoice({ variables: { id } });
      refetchInvoices();
      // Navigate to the new invoice
      if (result.data?.duplicateInvoice?.id) {
        window.location.href = `/dashboard/invoices/${result.data.duplicateInvoice.id}`;
      }
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      alert('Failed to duplicate invoice');
    }
  };

  const handleDownloadInvoicePDF = async (invoice: Invoice) => {
    setPdfLoading(true);
    try {
      const invoiceData: InvoiceData = {
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        subtotal: invoice.subtotal || 0,
        taxAmount: invoice.taxAmount || 0,
        vatAmount: invoice.vatAmount || 0,
        total: invoice.total,
        notes: invoice.notes,
        customerName: invoice.customerName,
        customerAddress: invoice.customerAddress,
        customerEmail: invoice.customer?.email,
        customerPhone: invoice.customer?.phone,
        companyName: invoice.companyName || 'Your Company',
        companyAddress: invoice.companyAddress,
        items: invoice.items?.map((item: any) => ({
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

  const filteredInvoices = invoices.filter((invoice: Invoice) => {
    if (searchTerm) {
      return (
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currencySymbols[currency as keyof typeof currencySymbols] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusBadge = (status: string) => {
    const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  if (invoicesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoices</h1>
          <p className="text-gray-600">Manage your invoices and payments</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalInvoices}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Amount</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.totalAmount, 'CAD')}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Paid Amount</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.paidAmount, 'CAD')}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Overdue Amount</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.overdueAmount, 'CAD')}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search invoices by number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="VOID">Void</option>
                </select>
              </div>

              <div>
                <label htmlFor="customer-filter" className="block text-sm font-medium text-gray-700">
                  Customer
                </label>
                <select
                  id="customer-filter"
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Customers</option>
                  {customers.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Invoices ({filteredInvoices.length})
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {filteredInvoices.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new invoice.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/invoices/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Invoice
                </Link>
              </div>
            </li>
          ) : (
            filteredInvoices.map((invoice: Invoice) => (
              <li key={invoice.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.number}
                        </p>
                        <div className="ml-2">
                          {getStatusBadge(invoice.status)}
                        </div>
                      </div>
                      <div className="flex items-center mt-1">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <p className="text-sm text-gray-500">{invoice.customerName}</p>
                        {invoice.customer.email && (
                          <span className="ml-2 text-sm text-gray-400">
                            • {invoice.customer.email}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <p className="text-sm text-gray-500">
                          Issued: {formatDate(invoice.issueDate)}
                          {invoice.dueDate && ` • Due: ${formatDate(invoice.dueDate)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {invoice.currency}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="View Invoice"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/dashboard/invoices/${invoice.id}/edit`}
                        className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Edit Invoice"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDownloadInvoicePDF(invoice)}
                        disabled={pdfLoading}
                        className="p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        title="Download PDF"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                      </button>
                      {invoice.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleSendInvoice(invoice.id)}
                            className="p-2 rounded-md text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Send Invoice"
                          >
                            <PaperAirplaneIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-2 rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Delete Invoice"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {invoice.status === 'SENT' && (
                        <button
                          onClick={() => handleVoidInvoice(invoice.id)}
                          className="p-2 rounded-md text-yellow-600 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          title="Void Invoice"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicateInvoice(invoice.id)}
                        className="p-2 rounded-md text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        title="Duplicate Invoice"
                      >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
} 