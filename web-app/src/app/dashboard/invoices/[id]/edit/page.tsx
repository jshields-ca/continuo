'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter, useParams } from 'next/navigation';
import { 
  UPDATE_INVOICE_MUTATION,
  ADD_INVOICE_ITEM_MUTATION,
  UPDATE_INVOICE_ITEM_MUTATION,
  DELETE_INVOICE_ITEM_MUTATION
} from '@/lib/graphql/mutations';
import { 
  GET_INVOICE,
  GET_CUSTOMERS
} from '@/lib/graphql/queries';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface InvoiceItem {
  id?: string;
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

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [formData, setFormData] = useState({
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'CAD' as 'CAD' | 'USD' | 'EUR' | 'GBP',
    notes: '',
    customFields: {},
  });

  const [totals, setTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    vatAmount: 0,
    total: 0,
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Queries
  const { data: invoiceData, loading: invoiceLoading } = useQuery(GET_INVOICE, {
    variables: { id: invoiceId },
    skip: !invoiceId,
  });

  const { data: customersData } = useQuery(GET_CUSTOMERS, {
    variables: { first: 100 },
  });

  // Mutations
  const [updateInvoice] = useMutation(UPDATE_INVOICE_MUTATION);
  const [addInvoiceItem] = useMutation(ADD_INVOICE_ITEM_MUTATION);
  const [updateInvoiceItem] = useMutation(UPDATE_INVOICE_ITEM_MUTATION);
  const [deleteInvoiceItem] = useMutation(DELETE_INVOICE_ITEM_MUTATION);

  const invoice = invoiceData?.invoice;
  const customers = customersData?.customers?.edges?.map((edge: any) => edge.node) || [];

  // Populate form with invoice data when loaded
  useEffect(() => {
    if (invoice) {
      setFormData({
        customerId: invoice.customerId || '',
        issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        currency: invoice.currency || 'CAD',
        notes: invoice.notes || '',
        customFields: invoice.customFields || {},
      });

      // Items are now managed by the server state via GraphQL
    }
  }, [invoice]);

  // Calculate totals whenever invoice items change
  useEffect(() => {
    if (invoice?.items) {
      let subtotal = 0;
      let taxAmount = 0;
      let vatAmount = 0;

      invoice.items.forEach((item: any) => {
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
    }
  }, [invoice?.items]);

  // Helper to ensure ISO string for date fields
  const toISODate = (dateStr: string) => dateStr ? new Date(dateStr).toISOString() : null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = async (itemId: string, field: string, value: any) => {
    try {
      const updateData: any = { [field]: value };
      
      // Don't send amount field - it's calculated automatically by the backend
      // The backend will recalculate amount when quantity or unitPrice changes

      await updateInvoiceItem({
        variables: {
          id: itemId,
          input: updateData
        },
        refetchQueries: [{ query: GET_INVOICE, variables: { id: invoiceId } }]
      });
    } catch (error) {
      console.error('Error updating item:', error);
      setErrors({ submit: 'Failed to update item. Please try again.' });
    }
  };

  const addItem = async () => {
    try {
      const result = await addInvoiceItem({
        variables: {
          invoiceId,
          input: {
            description: '',
            quantity: 1,
            unitPrice: 0,
            taxRate: 0,
            vatRate: 0,
          }
        },
        refetchQueries: [{ query: GET_INVOICE, variables: { id: invoiceId } }]
      });

      if (result.data?.addInvoiceItem) {
        // The items will be updated via the refetch
        console.log('Item added successfully');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setErrors({ submit: 'Failed to add item. Please try again.' });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const result = await deleteInvoiceItem({
        variables: { id: itemId },
        refetchQueries: [{ query: GET_INVOICE, variables: { id: invoiceId } }]
      });

      if (result.data?.deleteInvoiceItem) {
        // The items will be updated via the refetch
        console.log('Item deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setErrors({ submit: 'Failed to delete item. Please try again.' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }

    if (invoice?.items?.some((item: any) => !item.description.trim())) {
      newErrors.items = 'All items must have a description';
    }

    if (invoice?.items?.some((item: any) => item.quantity <= 0)) {
      newErrors.items = 'All items must have a quantity greater than 0';
    }

    if (invoice?.items?.some((item: any) => item.unitPrice < 0)) {
      newErrors.items = 'All items must have a non-negative unit price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const result = await updateInvoice({
        variables: {
          id: invoiceId,
          input: {
            customerId: formData.customerId,
            issueDate: toISODate(formData.issueDate),
            dueDate: toISODate(formData.dueDate),
            currency: formData.currency,
            notes: formData.notes,
            customFields: formData.customFields,
            // Do NOT send items if not supported by backend
          },
        },
      });

      if (result.data?.updateInvoice?.id) {
        router.push(`/dashboard/invoices/${result.data.updateInvoice.id}`);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      setErrors({ submit: 'Failed to update invoice. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const symbols = {
      CAD: 'C$',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    const symbol = symbols[formData.currency as keyof typeof symbols] || formData.currency;
    return `${symbol}${amount.toFixed(2)}`;
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

  if (invoice.status !== 'DRAFT') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cannot Edit Invoice</h2>
          <p className="text-gray-600 mb-6">Only draft invoices can be edited. This invoice has status: {invoice.status}</p>
          <Link
            href={`/dashboard/invoices/${invoice.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            View Invoice
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
                  href={`/dashboard/invoices/${invoice.id}`}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </Link>
                <div>
                  <p className="text-sm text-gray-500">
                    Update invoice details and items
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Invoice Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Invoice Details</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Customer */}
                <div>
                  <label htmlFor="customerId" className="block text-sm font-medium text-gray-800 mb-2">
                    Customer *
                  </label>
                  <select
                    id="customerId"
                    value={formData.customerId}
                    onChange={(e) => handleInputChange('customerId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      errors.customerId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="" className="text-gray-500">Select a customer</option>
                    {customers.map((customer: Customer) => (
                      <option key={customer.id} value={customer.id} className="text-gray-900">
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  {errors.customerId && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
                  )}
                </div>

                {/* Issue Date */}
                <div>
                  <label htmlFor="issueDate" className="block text-sm font-medium text-gray-800 mb-2">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    id="issueDate"
                    value={formData.issueDate}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      errors.issueDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.issueDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.issueDate}</p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-800 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                {/* Currency */}
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-800 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="CAD" className="text-gray-900">CAD (C$)</option>
                    <option value="USD" className="text-gray-900">USD ($)</option>
                    <option value="EUR" className="text-gray-900">EUR (€)</option>
                    <option value="GBP" className="text-gray-900">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-800 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Add any additional notes or terms..."
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Invoice Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              {errors.items && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.items}</p>
                </div>
              )}

              <div className="space-y-4">
                {invoice?.items?.map((item: any) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Description *
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id!, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                          placeholder="Item description"
                        />
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id!, 'quantity', parseFloat(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                      </div>

                      {/* Unit Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id!, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                      </div>

                      {/* Tax Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Tax %
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(item.id!, 'taxRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                      </div>

                      {/* VAT Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          VAT %
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.vatRate}
                          onChange={(e) => handleItemChange(item.id!, 'vatRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                      </div>

                      {/* Amount */}
                      <div className="flex items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-800 mb-1">
                            Amount
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-semibold text-gray-900">
                            {formatCurrency(item.amount)}
                          </div>
                        </div>
                        {invoice?.items && invoice.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id!)}
                            className="ml-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                          >
                            <TrashIcon className="w-4 h-4" />
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
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Invoice Totals</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-800">Subtotal:</span>
                    <span className="text-gray-900 font-semibold">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {totals.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-800">Tax:</span>
                      <span className="text-gray-900 font-semibold">{formatCurrency(totals.taxAmount)}</span>
                    </div>
                  )}
                  {totals.vatAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-800">VAT:</span>
                      <span className="text-gray-900 font-semibold">{formatCurrency(totals.vatAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span>Total:</span>
                    <span className="text-blue-700">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Link
              href={`/dashboard/invoices/${invoice.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 