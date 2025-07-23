'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Receipt, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Tag,
  Calendar,
  History
} from 'lucide-react';

// GraphQL Queries
const GET_TRANSACTIONS = gql`
  query GetTransactions {
    transactions {
      id
      type
      amount
      description
      reference
      category
      date
      tags
      account {
        id
        name
        code
      }
      company {
        id
        name
      }
    }
  }
`;

const GET_ACCOUNTS = gql`
  query GetAccounts {
    accounts {
      id
      name
      code
      type
      balance
    }
  }
`;

// GraphQL Mutations
const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      type
      amount
      description
      reference
      category
      date
      tags
      account {
        id
        name
        code
      }
    }
  }
`;

const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      id
      type
      amount
      description
      reference
      category
      date
      tags
      account {
        id
        name
        code
      }
    }
  }
`;

const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;

const GET_TRANSACTION_HISTORY = gql`
  query GetTransactionHistory($transactionId: ID!) {
    transactionHistory(transactionId: $transactionId) {
      transaction {
        id
        type
        amount
        description
        reference
        category
        date
        tags
        account {
          id
          name
          code
        }
      }
      auditLogs {
        id
        userId
        user {
          id
          firstName
          lastName
          email
        }
        action
        entity
        entityId
        oldValues
        newValues
        createdAt
      }
    }
  }
`;

export default function TransactionsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  interface EditingTransaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  reference: string;
  category: string;
  date: string;
  tags: string[];
}

const [editingTransaction, setEditingTransaction] = useState<EditingTransaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    accountId: '',
    type: 'CREDIT',
    amount: '',
    description: '',
    reference: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    tags: [] as string[],
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // GraphQL Queries
  const { data: transactionsData, loading: transactionsLoading, refetch: refetchTransactions } = useQuery(GET_TRANSACTIONS);
  const { data: accountsData, loading: accountsLoading } = useQuery(GET_ACCOUNTS);

  // GraphQL Mutations
  const [createTransaction, { loading: creating }] = useMutation(CREATE_TRANSACTION);
  const [updateTransaction, { loading: updating }] = useMutation(UPDATE_TRANSACTION);
  const [deleteTransaction, { loading: deleting }] = useMutation(DELETE_TRANSACTION);

  // Transaction history query
  const { data: historyData, loading: historyLoading, refetch: refetchHistory } = useQuery(GET_TRANSACTION_HISTORY, {
    variables: { transactionId: viewingTransaction?.id || '' },
    skip: !viewingTransaction?.id || !showHistory,
  });

  const transactions = transactionsData?.transactions || [];
  const accounts = accountsData?.accounts || [];

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (sortBy === 'amount') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    } else {
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateString = newTransaction.date;
      const dateTime = dateString ? new Date(dateString + 'T00:00:00.000Z').toISOString() : new Date().toISOString();

      await createTransaction({
        variables: {
          input: {
            accountId: newTransaction.accountId,
            type: newTransaction.type,
            amount: parseFloat(newTransaction.amount),
            description: newTransaction.description,
            reference: newTransaction.reference,
            category: newTransaction.category,
            date: dateTime,
            tags: newTransaction.tags.filter(tag => tag.trim() !== ''),
          },
        },
      });

      setNewTransaction({
        accountId: '',
        type: 'CREDIT',
        amount: '',
        description: '',
        reference: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        tags: [],
      });
      setShowCreateForm(false);
      refetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction({
      ...transaction,
      date: transaction.date.split('T')[0],
    });
  };

  const handleViewTransaction = (transaction: any) => {
    setViewingTransaction(transaction);
    setShowHistory(false);
  };

  const handleViewHistory = async (transaction: any) => {
    setViewingTransaction(transaction);
    setShowHistory(true);
  };

  const handleDeleteTransaction = async (transaction: any) => {
    if (window.confirm(`Are you sure you want to delete the transaction "${transaction.description}"? This action cannot be undone.`)) {
      try {
        await deleteTransaction({
          variables: { id: transaction.id }
        });
        refetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTransaction) return;
    
    try {
      const dateString = editingTransaction.date;
      const dateTime = dateString ? new Date(dateString + 'T00:00:00.000Z').toISOString() : new Date().toISOString();

      // Only send fields that are allowed in UpdateTransactionInput
      const updateInput = {
        type: editingTransaction.type,
        amount: parseFloat(editingTransaction.amount),
        description: editingTransaction.description,
        reference: editingTransaction.reference,
        category: editingTransaction.category,
        date: dateTime,
        tags: editingTransaction.tags.filter((tag: string) => tag.trim() !== ''),
      };

      console.log('Updating transaction with:', { id: editingTransaction.id, input: updateInput });
      const result = await updateTransaction({
        variables: {
          id: editingTransaction.id,
          input: updateInput,
        },
      });
      console.log('Transaction update result:', result);

      const currentEditingId = editingTransaction.id;
      setEditingTransaction(null);
      refetchTransactions();
      
      // Refetch history if currently viewing history for this transaction
      if (showHistory && viewingTransaction?.id === currentEditingId) {
        refetchHistory();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    return type === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getTransactionTypeIcon = (type: string) => {
    return type === 'CREDIT' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const addTag = () => {
    setNewTransaction(prev => ({
      ...prev,
      tags: [...prev.tags, ''],
    }));
  };

  const updateTag = (index: number, value: string) => {
    setNewTransaction(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => (i === index ? value : tag)),
    }));
  };

  const removeTag = (index: number) => {
    setNewTransaction(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const formatAuditLogChanges = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return [];
    
    const changes: Array<{field: string, oldValue: any, newValue: any}> = [];
    const old = oldValues ? JSON.parse(oldValues) : {};
    const new_ = newValues ? JSON.parse(newValues) : {};
    
    const fields = ['amount', 'description', 'reference', 'category', 'type', 'date'];
    
    fields.forEach(field => {
      if (old[field] !== new_[field]) {
        changes.push({
          field,
          oldValue: old[field],
          newValue: new_[field],
        });
      }
    });
    
    return changes;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Transactions</h1>
          <p className="text-gray-600">Manage your financial transactions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </button>
      </div>

      {/* Create Transaction Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Transaction</h3>
              <form onSubmit={handleCreateTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account *
                  </label>
                  <select
                    required
                    value={newTransaction.accountId}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, accountId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an account</option>
                    {accounts.map((account: any) => (
                      <option key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CREDIT">Credit</option>
                    <option value="DEBIT">Debit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    required
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Transaction description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={newTransaction.reference}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, reference: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Transaction reference"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Transaction category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  {newTransaction.tags.map((tag, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tag"
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTag}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Tag
                  </button>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Transaction</h3>
              <form onSubmit={handleUpdateTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    value={editingTransaction.type}
                    onChange={(e) => setEditingTransaction(prev => prev ? { ...prev, type: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CREDIT">Credit</option>
                    <option value="DEBIT">Debit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingTransaction.amount}
                    onChange={(e) => setEditingTransaction(prev => prev ? { ...prev, amount: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTransaction.description}
                    onChange={(e) => setEditingTransaction(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={editingTransaction.reference}
                    onChange={(e) => setEditingTransaction(prev => ({ ...prev, reference: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingTransaction.category}
                    onChange={(e) => setEditingTransaction(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingTransaction.date}
                    onChange={(e) => setEditingTransaction(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingTransaction(null)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Transaction Modal */}
      {viewingTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Transaction Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View comprehensive transaction information and history
                  </p>
                </div>
                <button
                  onClick={() => setViewingTransaction(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                  aria-label="Close modal"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setShowHistory(false)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      !showHistory 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleViewHistory(viewingTransaction)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      showHistory 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    History
                  </button>
                </nav>
              </div>
              
              {!showHistory ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Receipt className="h-5 w-5 text-blue-600 mr-2" />
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {formatDate(viewingTransaction.date)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTransactionTypeColor(viewingTransaction.type)}`}>
                            {getTransactionTypeIcon(viewingTransaction.type)}
                            <span className="ml-1">{viewingTransaction.type}</span>
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {viewingTransaction.account?.code} - {viewingTransaction.account?.name}
                        </p>
                      </div>
                      {viewingTransaction.category && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                            {viewingTransaction.category}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      Financial Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <p className={`text-lg font-semibold ${viewingTransaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'} bg-white px-3 py-2 rounded border`}>
                          {formatCurrency(viewingTransaction.amount)}
                        </p>
                      </div>
                      {viewingTransaction.reference && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                          <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border font-mono">
                            {viewingTransaction.reference}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                      Description
                    </h4>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                      {viewingTransaction.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {viewingTransaction.tags && viewingTransaction.tags.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Tag className="h-5 w-5 text-purple-600 mr-2" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingTransaction.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                      Timestamps
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {new Date(viewingTransaction.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {new Date(viewingTransaction.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center">
                      <History className="h-5 w-5 text-blue-600 mr-2" />
                      Transaction History
                    </h4>
                  </div>
                  
                  {historyLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading transaction history...</p>
                    </div>
                  ) : historyData?.transactionHistory?.auditLogs?.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {historyData.transactionHistory.auditLogs.map((log: any) => {
                        const changes = formatAuditLogChanges(log.oldValues, log.newValues);
                        return (
                          <div key={log.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                                  log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {log.action}
                                </span>
                                <span className="text-sm text-gray-600">
                                  by {log.user.firstName} {log.user.lastName}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(log.createdAt)}
                              </span>
                            </div>
                            
                            {changes.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <h5 className="text-sm font-medium text-gray-700">Changes:</h5>
                                {changes.map((change, index) => (
                                  <div key={index} className="text-sm bg-blue-50 border border-blue-200 p-3 rounded-md">
                                    <span className="font-medium text-gray-900">{change.field}:</span>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-red-700 line-through bg-red-50 px-2 py-1 rounded">
                                        {change.oldValue !== null && change.oldValue !== undefined 
                                          ? change.oldValue.toString() 
                                          : 'null'}
                                      </span>
                                      <span className="text-gray-600 font-medium">→</span>
                                      <span className="text-green-700 font-medium bg-green-50 px-2 py-1 rounded">
                                        {change.newValue !== null && change.newValue !== undefined 
                                          ? change.newValue.toString() 
                                          : 'null'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {log.action === 'CREATE' && (
                              <div className="mt-3 text-sm text-gray-600 bg-green-50 border border-green-200 p-2 rounded">
                                Transaction created with initial values
                              </div>
                            )}
                            
                            {log.action === 'DELETE' && (
                              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                                Transaction was deleted
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="mx-auto h-12 w-12 text-gray-300" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No history available</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No history available for this transaction.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Transactions
            </h3>
            <button
              onClick={() => refetchTransactions()}
              disabled={transactionsLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${transactionsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {transactionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first transaction.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Create Transaction
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortBy === 'date' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center">
                        Description
                        {sortBy === 'description' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center">
                        Category
                        {sortBy === 'category' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center">
                        Type
                        {sortBy === 'type' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center">
                        Amount
                        {sortBy === 'amount' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTransactions.map((transaction: any) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.account?.code} - {transaction.account?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.reference}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.category || (
                            <span className="text-gray-400 italic">No category</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                          {getTransactionTypeIcon(transaction.type)}
                          <span className="ml-1">{transaction.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTransaction(transaction)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 