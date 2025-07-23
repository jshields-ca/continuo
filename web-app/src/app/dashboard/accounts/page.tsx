'use client';

import { useRequireAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  BarChart3, 
  Search, 
  Download, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Archive,
  BookOpen,
  Settings,
  FileText,
  Calendar
} from 'lucide-react';
import { useRef } from 'react';

// GraphQL Queries
const GET_ACCOUNTS = gql`
  query GetAccounts($filter: AccountFilterInput, $limit: Int) {
    accounts(filter: $filter, limit: $limit) {
      id
      name
      code
      type
      category
      status
      balance
      openingBalance
      description
      isSystem
      isReconcilable
      isTaxable
      parent {
        id
        name
        code
      }
      children {
        id
        name
        code
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_ACCOUNT_SUMMARY = gql`
  query GetAccountSummary {
    accountSummary {
      totalAccounts
      activeAccounts
      totalBalance
      accountsByType {
        type
        count
        balance
      }
      accountsByCategory {
        category
        count
        balance
      }
    }
  }
`;

const CREATE_DEFAULT_CHART = gql`
  mutation CreateDefaultChartOfAccounts {
    createDefaultChartOfAccounts {
      id
      name
      code
      type
      category
      isSystem
    }
  }
`;

const EXPORT_ACCOUNTS = gql`
  mutation ExportAccounts {
    exportAccounts
  }
`;

const GET_ACCOUNT_DETAILS = gql`
  query GetAccountDetails($id: ID!) {
    account(id: $id) {
      id
      name
      code
      type
      category
      status
      balance
      openingBalance
      description
      isSystem
      isReconcilable
      isTaxable
      parent {
        id
        name
        code
      }
      children {
        id
        name
        code
        balance
        status
      }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_ACCOUNT = gql`
  mutation UpdateAccount($id: ID!, $input: UpdateAccountInput!) {
    updateAccount(id: $id, input: $input) {
      id
      name
      code
      type
      category
      status
      description
      isSystem
      isReconcilable
      isTaxable
      parent {
        id
        name
        code
      }
      children {
        id
        name
        code
      }
      createdAt
      updatedAt
    }
  }
`;

const CREATE_ACCOUNT = gql`
  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
      name
      code
      type
      category
      status
      description
      balance
      openingBalance
      isSystem
      isReconcilable
      isTaxable
      parent {
        id
        name
        code
      }
      children {
        id
        name
        code
      }
      createdAt
      updatedAt
    }
  }
`;

export default function AccountsPage() {
  const { user } = useRequireAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [viewingAccount, setViewingAccount] = useState<any>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState<any>({
    name: '',
    code: '',
    type: 'ASSET',
    category: 'CURRENT_ASSETS',
    description: '',
    openingBalance: '',
    isReconcilable: true,
    isTaxable: false,
    parentId: '',
  });

  // Queries
  const { data: accountsData, loading: accountsLoading, refetch: refetchAccounts } = useQuery(GET_ACCOUNTS, {
    variables: {
      filter: {
        search: searchTerm || undefined,
        type: selectedType || undefined,
        category: selectedCategory || undefined,
      },
      limit: 100,
    },
  });

  const { data: summaryData, loading: summaryLoading, refetch: refetchAccountSummary } = useQuery(GET_ACCOUNT_SUMMARY);
  
  // Account details query
  const { data: accountDetailsData, loading: accountDetailsLoading } = useQuery(GET_ACCOUNT_DETAILS, {
    variables: { id: viewingAccount?.id || '' },
    skip: !viewingAccount?.id || !showAccountModal,
  });

  // Mutations
  const [createDefaultChart, { loading: creatingDefault }] = useMutation(CREATE_DEFAULT_CHART, {
    onCompleted: () => {
      refetchAccounts();
      refetchAccountSummary();
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000); // Hide after 5 seconds
    },
  });

  const [exportAccounts, { loading: exporting }] = useMutation(EXPORT_ACCOUNTS);

  const [updateAccount, { loading: updatingAccount }] = useMutation(UPDATE_ACCOUNT, {
    onCompleted: () => {
      setShowEditModal(false);
      setEditingAccount(null);
      refetchAccounts();
      refetchAccountSummary();
    },
  });

  const [createAccount, { loading: creatingAccount }] = useMutation(CREATE_ACCOUNT, {
    onCompleted: () => {
      setShowAddModal(false);
      setNewAccount({
        name: '',
        code: '',
        type: 'ASSET',
        category: 'CURRENT_ASSETS',
        description: '',
        openingBalance: '',
        isReconcilable: true,
        isTaxable: false,
        parentId: '',
      });
      refetchAccounts();
      refetchAccountSummary();
    },
  });

  const accounts = accountsData?.accounts || [];
  const summary = summaryData?.accountSummary;

  const toggleAccountExpansion = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const handleViewAccount = (account: any) => {
    setViewingAccount(account);
    setShowAccountModal(true);
  };

  const handleCreateDefaultChart = async () => {
    try {
      await createDefaultChart();
    } catch (error) {
      console.error('Error creating default chart:', error);
    }
  };

  const handleExportAccounts = async () => {
    try {
      const result = await exportAccounts();
      const data = JSON.parse(result.data.exportAccounts);
      
      // Create and download CSV
      const csvContent = convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chart-of-accounts.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting accounts:', error);
    }
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount({ ...account });
    setShowEditModal(true);
  };

  const convertToCSV = (data: any[]) => {
    const headers = ['Code', 'Name', 'Type', 'Category', 'Balance', 'Status'];
    const rows = data.map(account => [
      account.code,
      account.name,
      account.type,
      account.category,
      account.balance,
      account.status,
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      ASSET: 'text-green-600 bg-green-100',
      LIABILITY: 'text-red-600 bg-red-100',
      EQUITY: 'text-blue-600 bg-blue-100',
      REVENUE: 'text-purple-600 bg-purple-100',
      EXPENSE: 'text-orange-600 bg-orange-100',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getBalanceColor = (balance: number) => {
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Default chart of accounts created successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Chart of Accounts</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your financial accounts and transactions</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCreateDefaultChart}
              disabled={creatingDefault}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {creatingDefault ? 'Creating...' : 'Create Default Chart'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Account
            </button>
            <button
              onClick={handleExportAccounts}
              disabled={exporting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {!summaryLoading && summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Accounts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.totalAccounts}
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
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Accounts
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {summary.activeAccounts}
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
                  <DollarSign className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Balance
                    </dt>
                    <dd className={`text-lg font-medium ${getBalanceColor(summary.totalBalance)}`}>
                      {formatCurrency(summary.totalBalance)}
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
                  <RefreshCw className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Last Updated
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Today
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Accounts
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
              >
                <option value="">All Types</option>
                <option value="ASSET">Assets</option>
                <option value="LIABILITY">Liabilities</option>
                <option value="EQUITY">Equity</option>
                <option value="REVENUE">Revenue</option>
                <option value="EXPENSE">Expenses</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
              >
                <option value="">All Categories</option>
                <option value="CURRENT_ASSETS">Current Assets</option>
                <option value="FIXED_ASSETS">Fixed Assets</option>
                <option value="CURRENT_LIABILITIES">Current Liabilities</option>
                <option value="LONG_TERM_LIABILITIES">Long-term Liabilities</option>
                <option value="COMMON_STOCK">Common Stock</option>
                <option value="RETAINED_EARNINGS">Retained Earnings</option>
                <option value="OPERATING_REVENUE">Operating Revenue</option>
                <option value="NON_OPERATING_REVENUE">Non-operating Revenue</option>
                <option value="COST_OF_GOODS_SOLD">Cost of Goods Sold</option>
                <option value="OPERATING_EXPENSES">Operating Expenses</option>
                <option value="MARKETING_EXPENSES">Marketing Expenses</option>
                <option value="ADMINISTRATIVE_EXPENSES">Administrative Expenses</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('');
                  setSelectedCategory('');
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Chart of Accounts
            </h3>
            <button
              onClick={() => refetchAccounts()}
              disabled={accountsLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${accountsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {accountsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a default chart of accounts.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateDefaultChart}
                  disabled={creatingDefault}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {creatingDefault ? 'Creating...' : 'Create Default Chart'}
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accounts.map((account: any) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {account.children && account.children.length > 0 && (
                            <button
                              onClick={() => toggleAccountExpansion(account.id)}
                              className="mr-2 text-gray-400 hover:text-gray-600"
                            >
                              {expandedAccounts.has(account.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {account.code} - {account.name}
                            </div>
                            {account.description && (
                              <div className="text-sm text-gray-500">
                                {account.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
                          {account.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {account.category.replace(/_/g, ' ')}
                        {account.isSystem && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            System
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getBalanceColor(account.balance)}`}>
                          {formatCurrency(account.balance)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          account.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {account.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewAccount(account)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {!account.isSystem && (
                            <>
                              <button className="text-green-600 hover:text-green-900" onClick={() => handleEditAccount(account)}>
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Archive className="h-4 w-4" />
                              </button>
                            </>
                          )}
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

      {/* Account Details Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Account Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View comprehensive account information
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAccountModal(false);
                    setViewingAccount(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                  aria-label="Close modal"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {accountDetailsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading account details...</p>
                </div>
              ) : accountDetailsData?.account ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
                        <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                          {accountDetailsData.account.code}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {accountDetailsData.account.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAccountTypeColor(accountDetailsData.account.type)}`}>
                            {accountDetailsData.account.type}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {accountDetailsData.account.category.replace(/_/g, ' ')}
                        </p>
                      </div>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
                        <p className={`text-lg font-semibold ${getBalanceColor(accountDetailsData.account.balance)} bg-white px-3 py-2 rounded border`}>
                          {formatCurrency(accountDetailsData.account.balance)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
                        <p className={`text-sm font-medium ${getBalanceColor(accountDetailsData.account.openingBalance)} bg-white px-3 py-2 rounded border`}>
                          {formatCurrency(accountDetailsData.account.openingBalance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Settings className="h-5 w-5 text-purple-600 mr-2" />
                      Account Settings
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            accountDetailsData.account.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {accountDetailsData.account.status}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">System Account</label>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            accountDetailsData.account.isSystem 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {accountDetailsData.account.isSystem ? 'Yes' : 'No'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reconcilable</label>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            accountDetailsData.account.isReconcilable 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {accountDetailsData.account.isReconcilable ? 'Yes' : 'No'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Taxable</label>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            accountDetailsData.account.isTaxable 
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {accountDetailsData.account.isTaxable ? 'Yes' : 'No'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {accountDetailsData.account.description && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                        Description
                      </h4>
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {accountDetailsData.account.description}
                      </p>
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
                          {new Date(accountDetailsData.account.createdAt).toLocaleDateString('en-US', {
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
                          {new Date(accountDetailsData.account.updatedAt).toLocaleDateString('en-US', {
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
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Account not found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    The requested account could not be loaded.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateAccount({
                  variables: {
                    id: editingAccount.id,
                    input: {
                      name: editingAccount.name,
                      description: editingAccount.description,
                      isTaxable: editingAccount.isTaxable,
                    },
                  },
                });
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Account</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAccount(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Name</label>
                  <input
                    type="text"
                    value={editingAccount.name}
                    onChange={e => setEditingAccount({ ...editingAccount, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={editingAccount.description || ''}
                    onChange={e => setEditingAccount({ ...editingAccount, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="isTaxable"
                    type="checkbox"
                    checked={!!editingAccount.isTaxable}
                    onChange={e => setEditingAccount({ ...editingAccount, isTaxable: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isTaxable" className="ml-2 block text-sm text-gray-700">
                    Taxable
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAccount(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingAccount}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {updatingAccount ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createAccount({
                  variables: {
                    input: {
                      name: newAccount.name,
                      code: newAccount.code,
                      type: newAccount.type,
                      category: newAccount.category,
                      description: newAccount.description,
                      openingBalance: parseFloat(newAccount.openingBalance) || 0,
                      isReconcilable: newAccount.isReconcilable,
                      isTaxable: newAccount.isTaxable,
                      parentId: newAccount.parentId || undefined,
                    },
                  },
                });
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Account</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Name *</label>
                  <input
                    type="text"
                    value={newAccount.name}
                    onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Code *</label>
                  <input
                    type="text"
                    value={newAccount.code}
                    onChange={e => setNewAccount({ ...newAccount, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type *</label>
                  <select
                    value={newAccount.type}
                    onChange={e => {
                      const type = e.target.value;
                      setNewAccount({ ...newAccount, type, category: type === 'ASSET' ? 'CURRENT_ASSETS' : type === 'LIABILITY' ? 'CURRENT_LIABILITIES' : type === 'EQUITY' ? 'OWNERS_EQUITY' : type === 'REVENUE' ? 'OPERATING_REVENUE' : 'COST_OF_GOODS_SOLD' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    required
                  >
                    <option value="ASSET">Asset</option>
                    <option value="LIABILITY">Liability</option>
                    <option value="EQUITY">Equity</option>
                    <option value="REVENUE">Revenue</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    value={newAccount.category}
                    onChange={e => setNewAccount({ ...newAccount, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    required
                  >
                    {/* Dynamically filter categories by type */}
                    {newAccount.type === 'ASSET' && <>
                      <option value="CURRENT_ASSETS">Current Assets</option>
                      <option value="FIXED_ASSETS">Fixed Assets</option>
                      <option value="INTANGIBLE_ASSETS">Intangible Assets</option>
                      <option value="OTHER_ASSETS">Other Assets</option>
                    </>}
                    {newAccount.type === 'LIABILITY' && <>
                      <option value="CURRENT_LIABILITIES">Current Liabilities</option>
                      <option value="LONG_TERM_LIABILITIES">Long-term Liabilities</option>
                      <option value="OTHER_LIABILITIES">Other Liabilities</option>
                    </>}
                    {newAccount.type === 'EQUITY' && <>
                      <option value="OWNERS_EQUITY">Owner's Equity</option>
                      <option value="RETAINED_EARNINGS">Retained Earnings</option>
                      <option value="COMMON_STOCK">Common Stock</option>
                      <option value="PREFERRED_STOCK">Preferred Stock</option>
                    </>}
                    {newAccount.type === 'REVENUE' && <>
                      <option value="OPERATING_REVENUE">Operating Revenue</option>
                      <option value="NON_OPERATING_REVENUE">Non-operating Revenue</option>
                      <option value="OTHER_REVENUE">Other Revenue</option>
                    </>}
                    {newAccount.type === 'EXPENSE' && <>
                      <option value="COST_OF_GOODS_SOLD">Cost of Goods Sold</option>
                      <option value="OPERATING_EXPENSES">Operating Expenses</option>
                      <option value="ADMINISTRATIVE_EXPENSES">Administrative Expenses</option>
                      <option value="MARKETING_EXPENSES">Marketing Expenses</option>
                      <option value="RESEARCH_AND_DEVELOPMENT">Research & Development</option>
                      <option value="OTHER_EXPENSES">Other Expenses</option>
                    </>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Opening Balance</label>
                  <input
                    type="number"
                    value={newAccount.openingBalance}
                    onChange={e => setNewAccount({ ...newAccount, openingBalance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={newAccount.description}
                    onChange={e => setNewAccount({ ...newAccount, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="isReconcilable"
                    type="checkbox"
                    checked={!!newAccount.isReconcilable}
                    onChange={e => setNewAccount({ ...newAccount, isReconcilable: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isReconcilable" className="ml-2 block text-sm text-gray-700">
                    Reconcilable
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="isTaxable"
                    type="checkbox"
                    checked={!!newAccount.isTaxable}
                    onChange={e => setNewAccount({ ...newAccount, isTaxable: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isTaxable" className="ml-2 block text-sm text-gray-700">
                    Taxable
                  </label>
                </div>
                {/* Parent Account selection (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Parent Account (optional)</label>
                  <select
                    value={newAccount.parentId}
                    onChange={e => setNewAccount({ ...newAccount, parentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="">None</option>
                    {accounts.filter((a: any) => !a.isSystem).map((a: any) => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAccount}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {creatingAccount ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 