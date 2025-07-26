'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { CREATE_INVOICE_MUTATION } from '@/lib/graphql/mutations';
import { 
  GET_NEXT_INVOICE_NUMBER,
  GET_CUSTOMERS,
  GET_INVOICES,
  GET_INVOICE_STATS
} from '@/lib/graphql/queries';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  vatRate: number;
  amount: number;
  customFields?: any;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: any;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'CAD' as 'CAD' | 'USD' | 'EUR' | 'GBP',
    notes: '',
    customFields: {},
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      vatRate: 0,
      amount: 0,
    }
  ]);

  const [totals, setTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    vatAmount: 0,
    total: 0,
  });

  // Queries
  const { data: nextNumberData } = useQuery(GET_NEXT_INVOICE_NUMBER);
  const { data: customersData } = useQuery(GET_CUSTOMERS, {
    variables: { first: 100 },
  });

  // Mutations
  const [createInvoice, { loading: creating }] = useMutation(CREATE_INVOICE_MUTATION, {
    update: (cache, { data }) => {
      if (data?.createInvoice) {
        // Update the invoices list cache
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
                invoices: [data.createInvoice, ...(existingInvoices as any).invoices],
              },
            });
          }
        } catch (error) {
          console.log('Cache update failed, will refetch:', error);
        }

        // Update invoice stats cache
        try {
          const existingStats = cache.readQuery({
            query: GET_INVOICE_STATS,
            variables: { filter: {} },
          });

          if (existingStats && (existingStats as any).invoiceStats) {
            const newStats = {
              ...(existingStats as any).invoiceStats,
              totalInvoices: (existingStats as any).invoiceStats.totalInvoices + 1,
              totalAmount: (existingStats as any).invoiceStats.totalAmount + parseFloat(data.createInvoice.total),
              draftAmount: data.createInvoice.status === 'DRAFT' 
                ? (existingStats as any).invoiceStats.draftAmount + parseFloat(data.createInvoice.total)
                : (existingStats as any).invoiceStats.draftAmount,
            };

            cache.writeQuery({
              query: GET_INVOICE_STATS,
              variables: { filter: {} },
              data: {
                invoiceStats: newStats,
              },
            });
          }
        } catch (error) {
          console.log('Stats cache update failed:', error);
        }
      }
    },
  });

  const customers = customersData?.customers?.edges?.map((edge: any) => edge.node) || [];
  const nextInvoiceNumber = nextNumberData?.nextInvoiceNumber;

  // Calculate totals whenever items change
  useEffect(() => {
    let subtotal = 0;
    let taxAmount = 0;
    let vatAmount = 0;

    items.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      taxAmount += itemTotal * (item.taxRate / 100);
      vatAmount += itemTotal * (item.vatRate / 100);
    });

    const total = subtotal + taxAmount + vatAmount;

    setTotals({
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    });
  }, [items]);

  // Helper to ensure ISO string for date fields
  const toISODate = (dateStr: string) => dateStr ? new Date(dateStr).toISOString() : null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Recalculate item amount
    const item = newItems[index];
    const amount = item.quantity * item.unitPrice;
    newItems[index].amount = parseFloat(amount.toFixed(2));

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        vatRate: 0,
        amount: 0,
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      alert('Please select a customer');
      return;
    }

    if (items.some(item => !item.description || item.unitPrice <= 0)) {
      alert('Please fill in all item details');
      return;
    }

    try {
      const result = await createInvoice({
        variables: {
          input: {
            customerId: formData.customerId,
            issueDate: toISODate(formData.issueDate),
            dueDate: toISODate(formData.dueDate),
            currency: formData.currency,
            notes: formData.notes,
            customFields: formData.customFields,
            items: items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              vatRate: item.vatRate,
              customFields: item.customFields,
            })),
          },
        },
      });

      if (result.data?.createInvoice?.id) {
        router.push(`/dashboard/invoices/${result.data.createInvoice.id}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice');
    }
  };

  const formatCurrency = (amount: number) => {
    const symbols = { CAD: 'C$', USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[formData.currency as keyof typeof symbols] || formData.currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Invoices
          </Link>
          <div>

            <p className="text-gray-600">
              {nextInvoiceNumber && `Invoice #${nextInvoiceNumber}`}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Invoice Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Selection */}
              <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-800">
                  Customer *
                </label>
                <select
                  id="customer"
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900"
                  required
                >
                  <option value="" className="text-gray-500">Select a customer</option>
                  {customers.map((customer: Customer) => (
                    <option key={customer.id} value={customer.id} className="text-gray-900">
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-800">
                  Currency
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900"
                >
                  <option value="CAD" className="text-gray-900">CAD (Canadian Dollar)</option>
                  <option value="USD" className="text-gray-900">USD (US Dollar)</option>
                  <option value="EUR" className="text-gray-900">EUR (Euro)</option>
                  <option value="GBP" className="text-gray-900">GBP (British Pound)</option>
                </select>
              </div>

              {/* Issue Date */}
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-800">
                  Issue Date *
                </label>
                <input
                  type="date"
                  id="issueDate"
                  value={formData.issueDate}
                  onChange={(e) => handleInputChange('issueDate', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  required
                />
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-800">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-800">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                placeholder="Additional notes for this invoice..."
              />
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Invoice Items
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-800">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                        placeholder="Item description"
                        required
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      />
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      />
                    </div>

                    {/* Tax Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      />
                    </div>

                    {/* VAT Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-800">
                        VAT Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.vatRate}
                        onChange={(e) => handleItemChange(index, 'vatRate', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      />
                    </div>

                    {/* Amount */}
                    <div className="flex items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-800">
                          Amount
                        </label>
                        <div className="mt-1 text-sm text-gray-900 font-medium">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Invoice Totals
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-800">Subtotal:</span>
                <span className="text-gray-900 font-semibold">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-800">Tax:</span>
                <span className="text-gray-900 font-semibold">{formatCurrency(totals.taxAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-800">VAT:</span>
                <span className="text-gray-900 font-semibold">{formatCurrency(totals.vatAmount)}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-blue-700">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
} 