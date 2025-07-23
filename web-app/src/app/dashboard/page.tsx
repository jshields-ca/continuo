'use client';

import { useRequireAuth } from '@/lib/auth-context';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Users, DollarSign, Calendar, Building, BookOpen, Receipt, Target, TrendingUp, ArrowRight, Plus, Eye, Edit, Trash2, User, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GET_INVOICE_STATS, GET_INVOICES } from '@/lib/graphql/queries';

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

const GET_LEAD_SUMMARY = gql`
  query GetLeadSummary {
    leadPipeline {
      totalLeads
      newLeads
      contactedLeads
      qualifiedLeads
      proposalLeads
      negotiationLeads
      convertedLeads
      lostLeads
      totalOpportunities
      totalPipelineValue
      conversionRate
    }
  }
`;

const GET_RECENT_LEAD_ACTIVITIES = gql`
  query GetRecentLeadActivities {
    leadActivities(first: 5) {
      edges {
        node {
          id
          leadId
          activityType
          description
          metadata
          createdAt
          lead {
            id
            name
            email
          }
        }
      }
    }
  }
`;

const GET_RECENT_LEADS = gql`
  query GetRecentLeads {
    leads(first: 5) {
      edges {
        node {
          id
          name
          email
          status
          source
          createdAt
          updatedAt
          assignedUser {
            id
            firstName
            lastName
          }
        }
      }
    }
  }
`;

const GET_RECENT_TRANSACTIONS = gql`
  query GetRecentTransactions {
    transactions(limit: 5) {
      id
      type
      amount
      description
      date
      createdAt
      updatedAt
      account {
        id
        name
        code
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

  // Staggered loading approach to reduce API load
  const [showActivityFeed, setShowActivityFeed] = useState(false);

  // Load essential data first
  const { data: customerSummaryData, loading: customerSummaryLoading, error: customerSummaryError } = useQuery(GET_CUSTOMER_SUMMARY, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
  });
  
  const { data: accountSummaryData, loading: accountSummaryLoading, error: accountSummaryError } = useQuery(GET_ACCOUNT_SUMMARY, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
  });
  
  const { data: leadSummaryData, loading: leadSummaryLoading, error: leadSummaryError } = useQuery(GET_LEAD_SUMMARY, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
  });
  
  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_USERS, {
    variables: { companyId: user?.company.id },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
    skip: !user?.company?.id,
  });

  // Load activity data after a delay to reduce initial load
  const { data: recentLeadActivitiesData, loading: recentLeadActivitiesLoading, error: recentLeadActivitiesError } = useQuery(GET_RECENT_LEAD_ACTIVITIES, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
    fetchPolicy: 'cache-and-network',
    skip: !showActivityFeed,
  });
  
  const { data: recentLeadsData, loading: recentLeadsLoading, error: recentLeadsError } = useQuery(GET_RECENT_LEADS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
    fetchPolicy: 'cache-and-network',
    skip: !showActivityFeed,
  });
  
  const { data: recentTransactionsData, loading: recentTransactionsLoading, error: recentTransactionsError } = useQuery(GET_RECENT_TRANSACTIONS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
    fetchPolicy: 'cache-and-network',
    skip: !showActivityFeed,
  });

  // Invoice queries
  const { data: invoiceStatsData, loading: invoiceStatsLoading, error: invoiceStatsError } = useQuery(GET_INVOICE_STATS, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
  });
  
  const { data: recentInvoicesData, loading: recentInvoicesLoading, error: recentInvoicesError } = useQuery(GET_INVOICES, {
    variables: {
      limit: 5,
      offset: 0,
      orderBy: { field: 'CREATED_AT', direction: 'DESC' }
    },
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
    fetchPolicy: 'cache-and-network',
  });

  // Enable activity feed after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowActivityFeed(true);
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

  // Check for rate limiting errors
  const hasRateLimitError = 
    (customerSummaryError?.networkError as any)?.statusCode === 429 ||
    (accountSummaryError?.networkError as any)?.statusCode === 429 ||
    (leadSummaryError?.networkError as any)?.statusCode === 429 ||
    (recentLeadActivitiesError?.networkError as any)?.statusCode === 429 ||
    (recentLeadsError?.networkError as any)?.statusCode === 429 ||
    (recentTransactionsError?.networkError as any)?.statusCode === 429 ||
    (usersError?.networkError as any)?.statusCode === 429;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show rate limit error message
  if (hasRateLimitError) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                API Rate Limit Reached
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  We're experiencing high API usage. Please wait a moment and refresh the page, or try again in a few minutes.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-200"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const customerSummary = customerSummaryData?.customerSummary;
  const accountSummary = accountSummaryData?.accountSummary;
  const leadSummary = leadSummaryData?.leadPipeline;
  const recentLeadActivities = recentLeadActivitiesData?.leadActivities?.edges || [];
  const recentLeads = recentLeadsData?.leads?.edges || [];
  const recentTransactions = recentTransactionsData?.transactions || [];
  const users = usersData?.users;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'LEAD_CREATED':
      case 'LEAD_UPDATED':
      case 'CREATED':
      case 'CONTACTED':
      case 'QUALIFIED':
      case 'PROPOSAL_SENT':
      case 'MEETING_SCHEDULED':
      case 'MEETING_COMPLETED':
      case 'FOLLOW_UP':
      case 'CONVERTED':
      case 'LOST':
      case 'REASSIGNED':
      case 'NOTE_ADDED':
      case 'EMAIL_SENT':
      case 'PHONE_CALL':
      case 'OTHER':
        return <Target className="h-4 w-4 text-orange-600" />;
      case 'TRANSACTION_CREATED':
      case 'TRANSACTION_UPDATED':
      case 'CREDIT':
      case 'DEBIT':
        return <Receipt className="h-4 w-4 text-green-600" />;
      case 'CUSTOMER_CREATED':
      case 'CUSTOMER_UPDATED':
        return <Building className="h-4 w-4 text-blue-600" />;
      case 'CONTACT_CREATED':
      case 'CONTACT_UPDATED':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'ACCOUNT_CREATED':
      case 'ACCOUNT_UPDATED':
        return <BookOpen className="h-4 w-4 text-indigo-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'LEAD_CREATED':
      case 'LEAD_UPDATED':
      case 'CREATED':
      case 'CONTACTED':
      case 'QUALIFIED':
      case 'PROPOSAL_SENT':
      case 'MEETING_SCHEDULED':
      case 'MEETING_COMPLETED':
      case 'FOLLOW_UP':
      case 'CONVERTED':
      case 'LOST':
      case 'REASSIGNED':
      case 'NOTE_ADDED':
      case 'EMAIL_SENT':
      case 'PHONE_CALL':
      case 'OTHER':
        return 'bg-orange-50 border-orange-200';
      case 'TRANSACTION_CREATED':
      case 'TRANSACTION_UPDATED':
      case 'CREDIT':
      case 'DEBIT':
        return 'bg-green-50 border-green-200';
      case 'CUSTOMER_CREATED':
      case 'CUSTOMER_UPDATED':
        return 'bg-blue-50 border-blue-200';
      case 'CONTACT_CREATED':
      case 'CONTACT_UPDATED':
        return 'bg-purple-50 border-purple-200';
      case 'ACCOUNT_CREATED':
      case 'ACCOUNT_UPDATED':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

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
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Team Members
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {usersLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
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
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Balance
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {accountSummaryLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
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
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Accounts
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {accountSummaryLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      accountSummary?.totalAccounts || 0
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Leads */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Leads
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {leadSummaryLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      leadSummary?.totalLeads || 0
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Invoices
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {invoiceStatsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      invoiceStatsData?.invoiceStats?.totalInvoices || 0
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
            href="/dashboard/invoices"
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-indigo-600" />
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
                <p className="text-sm text-gray-500">Create and manage customer invoices</p>
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
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <div className="text-sm text-gray-500">
              {!showActivityFeed ? 'Loading...' : 
               recentLeadActivitiesLoading || recentLeadsLoading || recentTransactionsLoading ? 'Loading...' : 
               `${(recentLeadActivitiesData?.leadActivities?.edges?.length || 0) + (recentLeadsData?.leads?.edges?.length || 0) + (recentTransactionsData?.transactions?.length || 0)} activities`}
            </div>
          </div>
          
          {!showActivityFeed ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading activity feed...</p>
            </div>
          ) : recentLeadActivitiesLoading || recentLeadsLoading || recentTransactionsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : ((recentLeadActivitiesData?.leadActivities?.edges?.length || 0) + (recentLeadsData?.leads?.edges?.length || 0) + (recentTransactionsData?.transactions?.length || 0)) === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">
                Activity will appear here as you use the system.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentLeadActivitiesData?.leadActivities?.edges?.map((activity: any) => (
                <div
                  key={activity.node.id}
                  className={`p-4 rounded-lg border ${getActivityColor(activity.node.activityType)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.node.activityType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.node.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(activity.node.createdAt)}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        {activity.node.lead && (
                          <span className="text-xs text-gray-600">
                            on lead {activity.node.lead.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {recentLeadsData?.leads?.edges?.map((lead: any) => (
                <div
                  key={lead.node.id}
                  className={`p-4 rounded-lg border ${getActivityColor('LEAD_CREATED')}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon('LEAD_CREATED')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          New Lead: {lead.node.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(lead.node.createdAt)}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        {lead.node.assignedUser && (
                          <span className="text-xs text-gray-600">
                            Assigned to {lead.node.assignedUser.firstName} {lead.node.assignedUser.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {recentTransactionsData?.transactions?.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className={`p-4 rounded-lg border ${getActivityColor(transaction.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.type === 'CREDIT' ? 'Credit' : 'Debit'} Transaction: {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        {transaction.account && (
                          <span className="text-xs text-gray-600">
                            Account: {transaction.account.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}