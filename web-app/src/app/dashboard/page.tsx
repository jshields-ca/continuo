'use client';

import { useRequireAuth } from '@/lib/auth-context';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Users, DollarSign, Calendar, Building, BookOpen, Receipt, Target, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// GraphQL Queries
const GET_CUSTOMER_SUMMARY = gql`
  query GetCustomerSummary {
    customerSummary {
      totalCustomers
      activeCustomers
      customersByStatus {
        status
        count
      }
      customersByIndustry {
        industry
        count
      }
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

const GET_USERS = gql`
  query GetUsers($companyId: String!) {
    users(companyId: $companyId) {
      id
      firstName
      lastName
      email
      role
      status
    }
  }
`;

export default function DashboardPage() {
  const { user } = useRequireAuth();

  // Queries
  const { data: customerSummaryData, loading: customerSummaryLoading } = useQuery(GET_CUSTOMER_SUMMARY);
  const { data: accountSummaryData, loading: accountSummaryLoading } = useQuery(GET_ACCOUNT_SUMMARY);
  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS, {
    variables: { companyId: user?.company.id },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const customerSummary = customerSummaryData?.customerSummary;
  const accountSummary = accountSummaryData?.accountSummary;
  const users = usersData?.users;

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here&apos;s what&apos;s happening with {user.company.name} today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Users */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Team Members
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {usersLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                    ) : (
                      users?.length || 0
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Balance
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {accountSummaryLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                    ) : (
                      new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(accountSummary?.totalBalance || 0)
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Accounts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {accountSummaryLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                    ) : (
                      accountSummary?.totalAccounts || 0
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Customers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {customerSummaryLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
                    ) : (
                      customerSummary?.totalCustomers || 0
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/accounts"
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">Chart of Accounts</h3>
                <p className="text-sm text-gray-500">Manage your financial accounts and transactions</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Link>
          
          <Link
            href="/dashboard/transactions"
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-green-600" />
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
                <p className="text-sm text-gray-500">Create and manage financial transactions</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Link>
          
          <Link
            href="/dashboard/customers"
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">Customers</h3>
                <p className="text-sm text-gray-500">Manage customer database and relationships</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Link>
          
          <Link
            href="/dashboard/contacts"
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
                <p className="text-sm text-gray-500">Manage customer contacts and relationships</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Link>
          
          <Link
            href="/dashboard/leads"
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">Leads</h3>
                <p className="text-sm text-gray-500">Track leads and sales opportunities</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Link>
          
          <div className="bg-white shadow rounded-lg p-6 opacity-50">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-gray-400" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-500">Project Management</h3>
                <p className="text-sm text-gray-400">Coming soon - Track projects and tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
            <p className="mt-1 text-sm text-gray-500">
              Activity tracking will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}