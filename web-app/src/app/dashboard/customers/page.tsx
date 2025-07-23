'use client';

import { useRequireAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  Users, 
  Plus, 
  Search, 
  Download, 
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  X,
  FileText
} from 'lucide-react';

// GraphQL Queries
const GET_CUSTOMERS = gql`
  query GetCustomers($filter: CustomerFilterInput, $first: Int) {
    customers(filter: $filter, first: $first) {
      edges {
        node {
          id
          name
          email
          phone
          address
          status
          industry
          website
          notes
          contacts {
            id
            firstName
            lastName
            email
            phone
            role
            isPrimary
          }
          createdAt
          updatedAt
        }
      }
      totalCount
    }
  }
`;

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

const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      id
      name
      email
      phone
      status
      industry
    }
  }
`;

const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id)
  }
`;

const GET_CUSTOMER_DETAILS = gql`
  query GetCustomerDetails($id: ID!) {
    customer(id: $id) {
      id
      name
      email
      phone
      address
      status
      industry
      website
      notes
      contacts {
        id
        firstName
        lastName
        email
        phone
        role
        isPrimary
      }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: ID!, $input: UpdateCustomerInput!) {
    updateCustomer(id: $id, input: $input) {
      id
      name
      email
      phone
      address
      status
      industry
      website
      notes
      contacts {
        id
        firstName
        lastName
        email
        phone
        role
        isPrimary
      }
      createdAt
      updatedAt
    }
  }
`;

export default function CustomersPage() {
  const { user } = useRequireAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: {},
    industry: '',
    website: '',
    notes: '',
  });

  // Queries
  const { data: customersData, loading: customersLoading, refetch: refetchCustomers } = useQuery(GET_CUSTOMERS, {
    variables: {
      filter: {
        search: searchTerm || undefined,
        status: selectedStatus || undefined,
        industry: selectedIndustry || undefined,
      },
      first: 50,
    },
  });

  const { data: summaryData, loading: summaryLoading, refetch: refetchCustomerSummary } = useQuery(GET_CUSTOMER_SUMMARY);

  // Mutations
  const [createCustomer, { loading: creating }] = useMutation(CREATE_CUSTOMER, {
    onCompleted: () => {
      refetchCustomers();
      refetchCustomerSummary();
      setShowCreateForm(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: {},
        industry: '',
        website: '',
        notes: '',
      });
    },
  });

  const [deleteCustomer, { loading: deleting }] = useMutation(DELETE_CUSTOMER, {
    onCompleted: () => {
      refetchCustomers();
      refetchCustomerSummary();
    },
  });

  const [updateCustomer, { loading: updating }] = useMutation(UPDATE_CUSTOMER, {
    onCompleted: () => {
      setShowEditModal(false);
      setEditingCustomer(null);
      refetchCustomers();
      refetchCustomerSummary();
    },
  });

  const customers = customersData?.customers?.edges?.map((edge: any) => edge.node) || [];
  const summary = summaryData?.customerSummary;

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer({
        variables: {
          input: {
            ...newCustomer,
            status: 'ACTIVE',
          },
        },
      });
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer({
          variables: { id: customerId },
        });
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleViewCustomer = (customer: any) => {
    setViewingCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer({ ...customer });
    setShowEditModal(true);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCustomer({
        variables: {
          id: editingCustomer.id,
          input: {
            name: editingCustomer.name,
            email: editingCustomer.email,
            phone: editingCustomer.phone,
            address: editingCustomer.address,
            industry: editingCustomer.industry,
            website: editingCustomer.website,
            notes: editingCustomer.notes,
            status: editingCustomer.status,
          },
        },
      });
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'text-green-600 bg-green-100',
      INACTIVE: 'text-red-600 bg-red-100',
      PROSPECT: 'text-yellow-600 bg-yellow-100',
      LEAD: 'text-blue-600 bg-blue-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6" role="main" aria-label="Customers Management">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Customers</h1>
            <p className="text-sm text-gray-600">Manage your customer database and relationships</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Create new customer"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Customer
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {!summaryLoading && summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
                      Total Customers
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {summary.totalCustomers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Customers
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {summary.activeCustomers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      This Month
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {customers.filter((c: any) => new Date(c.createdAt).getMonth() === new Date().getMonth()).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Contacts
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {customers.reduce((total: number, customer: any) => total + (customer.contacts?.length || 0), 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards Loading State */}
      {summaryLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="animate-pulse">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="ml-4 w-0 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="Search customers by name, email, or company..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PROSPECT">Prospect</option>
                <option value="LEAD">Lead</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('');
                  setSelectedIndustry('');
                }}
                disabled={!searchTerm && !selectedStatus && !selectedIndustry}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
                {(searchTerm || selectedStatus || selectedIndustry) && (
                  <span className="ml-2 bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {[searchTerm, selectedStatus, selectedIndustry].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Customer Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Customer</h3>
              <form onSubmit={handleCreateCustomer}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                      placeholder="contact@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      value={newCustomer.industry}
                      onChange={(e) => setNewCustomer({...newCustomer, industry: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                    >
                      <option value="">Select Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={newCustomer.website}
                      onChange={(e) => setNewCustomer({...newCustomer, website: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                      placeholder="https://www.company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={newCustomer.notes}
                      onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                      placeholder="Additional notes about the customer"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {creating ? 'Creating...' : 'Create Customer'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Customer List
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {customersLoading 
                  ? 'Loading customers...' 
                  : `${customers.length} customer${customers.length !== 1 ? 's' : ''} found`
                }
                {(searchTerm || selectedStatus || selectedIndustry) && (
                  <span className="ml-2 text-blue-600">
                    (filtered)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => refetchCustomers()}
                disabled={customersLoading}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${customersLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Customer
              </button>
            </div>
          </div>

          {customersLoading ? (
            <div className="space-y-4">
              {/* Skeleton loader for table */}
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
                ))}
              </div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <Building className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedStatus || selectedIndustry 
                  ? 'No customers match your filters' 
                  : 'No customers found'
                }
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || selectedStatus || selectedIndustry 
                  ? 'Try adjusting your search criteria or filters to find more customers.'
                  : 'Get started by creating your first customer to begin managing relationships.'
                }
              </p>
              <div className="flex justify-center space-x-3">
                {(searchTerm || selectedStatus || selectedIndustry) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('');
                      setSelectedIndustry('');
                    }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Create Customer
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Customers table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="columnheader">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="columnheader">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="columnheader">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="columnheader">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="columnheader">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="columnheader">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer: any) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Building className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            {customer.website && (
                              <div className="text-sm text-gray-500">
                                <a href={customer.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                  {customer.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-1" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center mt-1">
                              <Phone className="h-4 w-4 text-gray-400 mr-1" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.industry || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewCustomer(customer)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-150"
                            title="View Customer Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCustomer(customer)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors duration-150"
                            title="Edit Customer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150"
                            title="Delete Customer"
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

      {/* Customer Details Modal */}
      {showCustomerModal && viewingCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Customer Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View comprehensive customer information and relationships
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                  aria-label="Close modal"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 text-blue-600 mr-2" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {viewingCustomer.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingCustomer.status)}`}>
                          {viewingCustomer.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {viewingCustomer.industry || 'N/A'}
                      </p>
                    </div>
                    {viewingCustomer.website && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          <a href={viewingCustomer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            {viewingCustomer.website}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Mail className="h-5 w-5 text-green-600 mr-2" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {viewingCustomer.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {viewingCustomer.phone || 'N/A'}
                      </p>
                    </div>
                    {viewingCustomer.address && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                          {viewingCustomer.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contacts Summary */}
                {viewingCustomer.contacts && viewingCustomer.contacts.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Users className="h-5 w-5 text-purple-600 mr-2" />
                      Contacts ({viewingCustomer.contacts.length})
                    </h4>
                    <div className="space-y-2">
                      {viewingCustomer.contacts.slice(0, 3).map((contact: any) => (
                        <div key={contact.id} className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {contact.firstName} {contact.lastName}
                                {contact.isPrimary && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Primary
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600">{contact.role}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-900">{contact.email}</p>
                              {contact.phone && (
                                <p className="text-sm text-gray-600">{contact.phone}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {viewingCustomer.contacts.length > 3 && (
                        <p className="text-sm text-gray-600 text-center">
                          +{viewingCustomer.contacts.length - 3} more contacts
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {viewingCustomer.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                      Notes
                    </h4>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                      {viewingCustomer.notes}
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
                        {new Date(viewingCustomer.createdAt).toLocaleDateString('en-US', {
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
                        {new Date(viewingCustomer.updatedAt).toLocaleDateString('en-US', {
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
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Customer</h3>
              <form onSubmit={handleUpdateCustomer}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCustomer.name}
                      onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={editingCustomer.email}
                      onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="contact@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editingCustomer.phone || ''}
                      onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      value={editingCustomer.industry || ''}
                      onChange={(e) => setEditingCustomer({...editingCustomer, industry: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    >
                      <option value="">Select Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editingCustomer.status}
                      onChange={(e) => setEditingCustomer({...editingCustomer, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="PROSPECT">Prospect</option>
                      <option value="LEAD">Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={editingCustomer.website || ''}
                      onChange={(e) => setEditingCustomer({...editingCustomer, website: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="https://www.company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editingCustomer.notes || ''}
                      onChange={(e) => setEditingCustomer({...editingCustomer, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Additional notes about the customer"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updating ? 'Updating...' : 'Update Customer'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 