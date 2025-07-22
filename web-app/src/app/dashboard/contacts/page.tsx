'use client';

import { useRequireAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  User, 
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
  Calendar,
  Star,
  Users,
  X
} from 'lucide-react';

// GraphQL Queries
const GET_CONTACTS = gql`
  query GetContacts($filter: ContactFilterInput, $first: Int) {
    contacts(filter: $filter, first: $first) {
      edges {
        node {
          id
          firstName
          lastName
          email
          phone
          role
          isPrimary
          customer {
            id
            name
            industry
          }
          createdAt
          updatedAt
        }
      }
      totalCount
    }
  }
`;

const GET_CUSTOMERS = gql`
  query GetCustomers {
    customers {
      edges {
        node {
          id
          name
          industry
          status
        }
      }
    }
  }
`;

const CREATE_CONTACT = gql`
  mutation CreateContact($input: CreateContactInput!) {
    createContact(input: $input) {
      id
      firstName
      lastName
      email
      phone
      role
      isPrimary
      customer {
        id
        name
      }
    }
  }
`;

const DELETE_CONTACT = gql`
  mutation DeleteContact($id: ID!) {
    deleteContact(id: $id)
  }
`;

const UPDATE_CONTACT = gql`
  mutation UpdateContact($id: ID!, $input: UpdateContactInput!) {
    updateContact(id: $id, input: $input) {
      id
      firstName
      lastName
      email
      phone
      role
      isPrimary
      customer {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export default function ContactsPage() {
  const { user } = useRequireAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewingContact, setViewingContact] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    customerId: '',
    isPrimary: false,
  });

  // Queries
  const { data: contactsData, loading: contactsLoading, refetch: refetchContacts } = useQuery(GET_CONTACTS, {
    variables: {
      filter: {
        search: searchTerm || undefined,
        customerId: selectedCustomer || undefined,
        role: selectedRole || undefined,
      },
      first: 50,
    },
  });

  const { data: customersData, loading: customersLoading } = useQuery(GET_CUSTOMERS);

  // Mutations
  const [createContact, { loading: creating }] = useMutation(CREATE_CONTACT, {
    onCompleted: () => {
      refetchContacts();
      setShowCreateForm(false);
      setNewContact({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        customerId: '',
        isPrimary: false,
      });
    },
  });

  const [deleteContact, { loading: deleting }] = useMutation(DELETE_CONTACT, {
    onCompleted: () => {
      refetchContacts();
    },
  });

  const [updateContact, { loading: updating }] = useMutation(UPDATE_CONTACT, {
    onCompleted: () => {
      setShowEditModal(false);
      setEditingContact(null);
      refetchContacts();
    },
  });

  const contacts = contactsData?.contacts?.edges?.map((edge: any) => edge.node) || [];
  const customers = customersData?.customers?.edges?.map((edge: any) => edge.node) || [];

  // Filter contacts by selected customer
  const filteredContacts = selectedCustomer
    ? contacts.filter((c: any) => c.customer?.id === selectedCustomer)
    : contacts;

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContact({
        variables: {
          input: {
            ...newContact,
            customerId: newContact.customerId,
          },
        },
      });
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact({
          variables: { id: contactId },
        });
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleViewContact = (contact: any) => {
    setViewingContact(contact);
    setShowContactModal(true);
  };

  const handleEditContact = (contact: any) => {
    setEditingContact({ ...contact });
    setShowEditModal(true);
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateContact({
        variables: {
          id: editingContact.id,
          input: {
            firstName: editingContact.firstName,
            lastName: editingContact.lastName,
            email: editingContact.email,
            phone: editingContact.phone,
            role: editingContact.role,
            isPrimary: editingContact.isPrimary,
          },
        },
      });
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'Decision Maker': 'text-purple-600 bg-purple-100',
      'Influencer': 'text-blue-600 bg-blue-100',
      'User': 'text-green-600 bg-green-100',
      'Technical Contact': 'text-orange-600 bg-orange-100',
      'Billing Contact': 'text-red-600 bg-red-100',
    };
    return colors[role as keyof typeof colors] || 'text-gray-600 bg-gray-100';
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
    <div className="p-6" role="main" aria-label="Contacts Management">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="mt-1 text-sm text-gray-600">Manage customer contacts and relationships</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Create new contact"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Contact
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
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
                    Total Contacts
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {contacts.length}
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
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Primary Contacts
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {contacts.filter((contact: any) => contact.isPrimary).length}
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
                    {new Set(contacts.map((contact: any) => contact.customer?.id)).size}
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
                    {contacts.filter((contact: any) => new Date(contact.createdAt).getMonth() === new Date().getMonth()).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  placeholder="Search contacts by name, email, or company..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Customers</option>
                {customers.map((customer: any) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Roles</option>
                <option value="Decision Maker">Decision Maker</option>
                <option value="Influencer">Influencer</option>
                <option value="User">User</option>
                <option value="Technical Contact">Technical Contact</option>
                <option value="Billing Contact">Billing Contact</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCustomer('');
                  setSelectedRole('');
                }}
                disabled={!searchTerm && !selectedCustomer && !selectedRole}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
                {(searchTerm || selectedCustomer || selectedRole) && (
                  <span className="ml-2 bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {[searchTerm, selectedCustomer, selectedRole].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Contact Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Contact</h3>
              <form onSubmit={handleCreateContact}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer
                    </label>
                    <select
                      required
                      value={newContact.customerId}
                      onChange={(e) => setNewContact({...newContact, customerId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                    >
                      <option value="">Select Customer</option>
                      {customers.map((customer: any) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newContact.firstName}
                      onChange={(e) => setNewContact({...newContact, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                      placeholder="First name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newContact.lastName}
                      onChange={(e) => setNewContact({...newContact, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                      placeholder="Last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newContact.email}
                      onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                      placeholder="contact@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={newContact.role}
                      onChange={(e) => setNewContact({...newContact, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                    >
                      <option value="">Select Role</option>
                      <option value="Decision Maker">Decision Maker</option>
                      <option value="Influencer">Influencer</option>
                      <option value="User">User</option>
                      <option value="Technical Contact">Technical Contact</option>
                      <option value="Billing Contact">Billing Contact</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={newContact.isPrimary}
                      onChange={(e) => setNewContact({...newContact, isPrimary: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white text-gray-900 bg-white placeholder-gray-500 text-gray-900 bg-white"
                    />
                    <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900">
                      Primary Contact
                    </label>
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
                      {creating ? 'Creating...' : 'Create Contact'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Contacts Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Contact List
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {contactsLoading 
                  ? 'Loading contacts...' 
                  : `${filteredContacts.length} contact${filteredContacts.length !== 1 ? 's' : ''} found`
                }
                {(searchTerm || selectedCustomer || selectedRole) && (
                  <span className="ml-2 text-blue-600">
                    (filtered)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => refetchContacts()}
                disabled={contactsLoading}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${contactsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Contact
              </button>
            </div>
          </div>

          {contactsLoading ? (
            <div className="space-y-4">
              {/* Skeleton loader for table */}
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
                ))}
              </div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedCustomer || selectedRole 
                  ? 'No contacts match your filters' 
                  : 'No contacts found'
                }
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || selectedCustomer || selectedRole 
                  ? 'Try adjusting your search criteria or filters to find more contacts.'
                  : 'Get started by creating your first contact to begin managing relationships.'
                }
              </p>
              <div className="flex justify-center space-x-3">
                {(searchTerm || selectedCustomer || selectedRole) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCustomer('');
                      setSelectedRole('');
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
                  Create Contact
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Contacts table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="columnheader">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="columnheader">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="columnheader">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="columnheader">
                      Contact Info
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
                  {filteredContacts.map((contact: any) => (
                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {`${contact.firstName} ${contact.lastName}`}
                              {contact.isPrimary && (
                                <Star className="inline h-4 w-4 text-yellow-500 ml-1" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {contact.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contact.customer?.name || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contact.customer?.industry || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(contact.role)}`}>
                          {contact.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-1" />
                            {contact.email}
                          </div>
                          {contact.phone && (
                            <div className="flex items-center mt-1">
                              <Phone className="h-4 w-4 text-gray-400 mr-1" />
                              {contact.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(contact.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewContact(contact)} 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-150"
                            title="View Contact Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditContact(contact)} 
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors duration-150"
                            title="Edit Contact"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150"
                            title="Delete Contact"
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

      {/* Contact Details Modal */}
      {showContactModal && viewingContact && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Contact Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View comprehensive contact information and relationships
                  </p>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
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
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {viewingContact.firstName} {viewingContact.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(viewingContact.role)}`}>
                          {viewingContact.role}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact</label>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          viewingContact.isPrimary 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {viewingContact.isPrimary ? 'Yes' : 'No'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {viewingContact.customer?.name || 'N/A'}
                      </p>
                    </div>
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
                        {viewingContact.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {viewingContact.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

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
                        {new Date(viewingContact.createdAt).toLocaleDateString('en-US', {
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
                        {new Date(viewingContact.updatedAt).toLocaleDateString('en-US', {
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

      {/* Edit Contact Modal */}
      {showEditModal && editingContact && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Contact</h3>
              <form onSubmit={handleUpdateContact}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" required value={editingContact.firstName} onChange={e => setEditingContact({...editingContact, firstName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500" placeholder="First name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" required value={editingContact.lastName} onChange={e => setEditingContact({...editingContact, lastName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500" placeholder="Last name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" required value={editingContact.email} onChange={e => setEditingContact({...editingContact, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500" placeholder="contact@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={editingContact.phone || ''} onChange={e => setEditingContact({...editingContact, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select value={editingContact.role} onChange={e => setEditingContact({...editingContact, role: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500">
                      <option value="">Select Role</option>
                      <option value="Decision Maker">Decision Maker</option>
                      <option value="Influencer">Influencer</option>
                      <option value="User">User</option>
                      <option value="Technical Contact">Technical Contact</option>
                      <option value="Billing Contact">Billing Contact</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="isPrimaryEdit" checked={editingContact.isPrimary} onChange={e => setEditingContact({...editingContact, isPrimary: e.target.checked})} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="isPrimaryEdit" className="ml-2 block text-sm text-gray-900">Primary Contact</label>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={updating}>
                      {updating ? 'Updating...' : 'Update Contact'}
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