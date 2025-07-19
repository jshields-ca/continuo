'use client';

import { useRequireAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Archive,
  MoreHorizontal
} from 'lucide-react';

// GraphQL Queries
const GET_ACCOUNTS = gql`
  query GetAccounts($filter: AccountFilterInput, $limit: Int, $offset: Int) {
    accounts(filter: $filter, limit: $limit, offset: $offset) {
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

export default function AccountsPage() {
  const { user } = useRequireAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  // Queries
  const { data: accountsData, loading: accountsLoading, refetch: refetchAccounts } = useQuery(GET_ACCOUNTS, {
    variables: {
      filter: {
        search: searchTerm || undefined,
        type: selectedType || undefined,
        category: selectedCategory || undefined,
      },
      limit: 100,
      offset: 0,
    },
  });

  const { data: summaryData, loading: summaryLoading } = useQuery(GET_ACCOUNT_SUMMARY);

  // Mutations
  const [createDefaultChart, { loading: creatingDefault }] = useMutation(CREATE_DEFAULT_CHART, {
    onCompleted: () => {
      refetchAccounts();
    },
  });

  const [exportAccounts, { loading: exporting }] = useMutation(EXPORT_ACCOUNTS);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Chart of Accounts</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateDefaultChart}
                disabled={creatingDefault}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingDefault ? 'Creating...' : 'Create Default Chart'}
              </button>
              <button
                onClick={handleExportAccounts}
                disabled={exporting}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            {!account.isSystem && (
                              <>
                                <button className="text-green-600 hover:text-green-900">
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
      </main>
    </div>
  );
} 