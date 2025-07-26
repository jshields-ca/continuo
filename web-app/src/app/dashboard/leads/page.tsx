'use client';

import { useRequireAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { 
  Target, 
  Plus, 
  Search, 
  Download, 
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  Star,
  User,
  Building,
  DollarSign,
  ArrowRight,
  Briefcase,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Users,
  PhoneCall,
  Mail as MailIcon,
  Target as TargetIcon,
  Handshake,
  Award,
  AlertCircle,
  X
} from 'lucide-react';

// GraphQL Queries
const GET_LEADS = gql`
  query GetLeads($filter: LeadFilterInput, $first: Int) {
    leads(filter: $filter, first: $first) {
      edges {
        node {
          id
          name
          email
          phone
          company
          source
          status
          score
          assignedTo
          assignedUser {
            id
            firstName
            lastName
            email
          }
          opportunities {
            id
            title
            amount
            stage
            probability
            expectedCloseDate
          }
          activities {
            id
            activityType
            description
            createdAt
          }
          createdAt
          updatedAt
        }
      }
      totalCount
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

const GET_USERS = gql`
  query GetUsers($companyId: String!) {
    users(companyId: $companyId) {
      id
      firstName
      lastName
      email
    }
  }
`;

const GET_LEAD_DETAILS = gql`
  query GetLead($id: ID!) {
    lead(id: $id) {
      id
      name
      email
      phone
      company
      source
      status
      score
      assignedTo
      assignedUser {
        id
        firstName
        lastName
        email
      }
      opportunities {
        id
        title
        amount
        stage
        probability
        expectedCloseDate
        description
        notes
        tags
        createdAt
        updatedAt
      }
      activities {
        id
        activityType
        description
        metadata
        createdAt
        createdBy
      }
      createdAt
      updatedAt
      notes
    }
  }
`;

const CREATE_LEAD = gql`
  mutation CreateLead($input: CreateLeadInput!) {
    createLead(input: $input) {
      id
      name
      email
      phone
      company
      source
      status
      score
      assignedTo
      notes
    }
  }
`;

const DELETE_LEAD = gql`
  mutation DeleteLead($id: ID!) {
    deleteLead(id: $id)
  }
`;

const UPDATE_LEAD_STATUS = gql`
  mutation UpdateLeadStatus($id: ID!, $status: LeadStatus!) {
    updateLeadStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const UPDATE_LEAD = gql`
  mutation UpdateLead($id: ID!, $input: UpdateLeadInput!) {
    updateLead(id: $id, input: $input) {
      id
      name
      email
      phone
      company
      source
      status
      score
      assignedTo
      notes
      updatedAt
    }
  }
`;

const CREATE_OPPORTUNITY = gql`
  mutation CreateOpportunity($input: CreateOpportunityInput!) {
    createOpportunity(input: $input) {
      id
      title
      description
      amount
      stage
      probability
      expectedCloseDate
      notes
      tags
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_OPPORTUNITY = gql`
  mutation UpdateOpportunity($id: ID!, $input: UpdateOpportunityInput!) {
    updateOpportunity(id: $id, input: $input) {
      id
      title
      description
      amount
      stage
      probability
      expectedCloseDate
      notes
      tags
      updatedAt
    }
  }
`;

const DELETE_OPPORTUNITY = gql`
  mutation DeleteOpportunity($id: ID!) {
    deleteOpportunity(id: $id)
  }
`;

export default function LeadsPage() {
  const { user } = useRequireAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewingLead, setViewingLead] = useState<any>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [leadNote, setLeadNote] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [showAddOpportunity, setShowAddOpportunity] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<any>(null);
  const [showEditOpportunity, setShowEditOpportunity] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    amount: '',
    stage: 'PROSPECTING',
    probability: 10,
    expectedCloseDate: '',
    notes: '',
  });
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    assignedTo: '',
    notes: '',
    status: '',
    score: 0,
  });
  const [leadDetailsId, setLeadDetailsId] = useState<string | null>(null);
  const { data: leadDetailsData, loading: leadDetailsLoading, refetch: refetchLeadDetails } = useQuery(GET_LEAD_DETAILS, {
    variables: { id: leadDetailsId },
    skip: !leadDetailsId,
  });

  // Queries
  const { data: leadsData, loading: leadsLoading, refetch: refetchLeads } = useQuery(GET_LEADS, {
    variables: {
      filter: {
        search: searchTerm || undefined,
        status: selectedStatus || undefined,
        source: selectedSource || undefined,
        assignedTo: selectedAssignee === 'unassigned' ? null : (selectedAssignee || undefined),
      },
      first: 50,
    },
  });

  const { data: summaryData, loading: summaryLoading, refetch: refetchLeadSummary } = useQuery(GET_LEAD_SUMMARY);
  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS, {
    variables: { companyId: user?.companyId },
    skip: !user?.companyId,
  });

  const [getLeadDetails] = useLazyQuery(GET_LEAD_DETAILS);

  // Mutations
  const [createLead, { loading: creating }] = useMutation(CREATE_LEAD, {
    onCompleted: () => {
      refetchLeads();
      refetchLeadSummary();
      setShowCreateForm(false);
      setNewLead({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: '',
        assignedTo: '',
        notes: '',
        status: '',
        score: 0,
      });
    },
  });

  const [deleteLead, { loading: deleting }] = useMutation(DELETE_LEAD, {
    onCompleted: () => {
      refetchLeads();
      refetchLeadSummary();
    },
  });

  const [updateLeadStatus, { loading: updatingStatus }] = useMutation(UPDATE_LEAD_STATUS, {
    onCompleted: () => {
      refetchLeads();
    },
  });

  const [updateLead, { loading: updatingLead }] = useMutation(UPDATE_LEAD, {
    onCompleted: () => {
      refetchLeads();
      refetchLeadSummary();
    },
  });

  const [createOpportunity, { loading: creatingOpportunity }] = useMutation(CREATE_OPPORTUNITY, {
    onCompleted: () => {
      refetchLeads();
      refetchLeadSummary();
    },
  });

  const [updateOpportunity, { loading: updatingOpportunity }] = useMutation(UPDATE_OPPORTUNITY, {
    onCompleted: () => {
      refetchLeads();
      refetchLeadSummary();
    },
  });

  const [deleteOpportunity, { loading: deletingOpportunity }] = useMutation(DELETE_OPPORTUNITY, {
    onCompleted: () => {
      refetchLeads();
      refetchLeadSummary();
    },
  });

  const leads = leadsData?.leads?.edges?.map((edge: any) => edge.node) || [];
  const summary = summaryData?.leadPipeline;
  const users = usersData?.users || [];

  // Sorting logic
  const sortedLeads = [...leads].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'name':
        aValue = a.name?.toLowerCase() || '';
        bValue = b.name?.toLowerCase() || '';
        break;
      case 'company':
        aValue = a.company?.toLowerCase() || '';
        bValue = b.company?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status?.toLowerCase() || '';
        bValue = b.status?.toLowerCase() || '';
        break;
      case 'score':
        aValue = a.score || 0;
        bValue = b.score || 0;
        break;
      case 'email':
        aValue = a.email?.toLowerCase() || '';
        bValue = b.email?.toLowerCase() || '';
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        aValue = a[sortField] || '';
        bValue = b[sortField] || '';
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!newLead.name.trim()) {
      alert('Please enter a lead name.');
      return;
    }
    
    if (!newLead.email.trim()) {
      alert('Please enter an email address.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newLead.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    
    if (!newLead.source) {
      alert('Please select a source for the lead.');
      return;
    }
    
    // Phone validation (if provided)
    if (newLead.phone && newLead.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = newLead.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        alert('Please enter a valid phone number.');
        return;
      }
    }
    
    // Check for duplicate email
    const existingLead = leads.find((lead: any) => 
      lead.email.toLowerCase() === newLead.email.toLowerCase()
    );
    if (existingLead) {
      alert('A lead with this email address already exists.');
      return;
    }
    
    try {
      // Filter out empty values to prevent GraphQL validation errors
      const leadInput = {
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone || undefined,
        company: newLead.company || undefined,
        source: newLead.source,
        assignedTo: newLead.assignedTo || undefined,
        notes: newLead.notes || undefined,
        status: 'NEW',
        score: 0,
      };

      await createLead({
        variables: {
          input: leadInput,
        },
      });
      
      // Reset form
      setNewLead({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: '',
        status: '',
        score: 0,
        assignedTo: '',
        notes: '',
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Error creating lead. Please try again.');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead({
          variables: { id: leadId },
        });
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadStatus({
        variables: { id: leadId, status: newStatus },
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const handleViewLead = (lead: any) => {
    setLeadDetailsId(lead.id);
    setShowLeadModal(true);
    setActiveTab('basic');
  };

  const handleEditLead = (lead: any) => {
    setEditingLead({ ...lead });
    setShowEditModal(true);
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!editingLead.source) {
      alert('Please select a source for the lead.');
      return;
    }
    
    try {
      // Filter out empty values to prevent GraphQL validation errors
      const updateInput = {
        name: editingLead.name,
        email: editingLead.email,
        phone: editingLead.phone || undefined,
        company: editingLead.company || undefined,
        source: editingLead.source, // No longer defaulting - validation ensures it's selected
        status: editingLead.status,
        score: editingLead.score,
        notes: editingLead.notes || undefined,
        assignedTo: editingLead.assignedTo || null,
      };

      await updateLead({
        variables: {
          id: editingLead.id,
          input: updateInput,
        },
      });
      
      setShowEditModal(false);
      setEditingLead(null);
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead. Please try again.');
    }
  };

  const refetchViewingLead = async (leadId: string) => {
    const { data } = await getLeadDetails({ variables: { id: leadId } });
    if (data && data.lead) {
      setViewingLead(data.lead);
      setLeadNote(data.lead.notes || '');
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createOpportunity({
        variables: {
          input: {
            leadId: leadDetailsId,
            title: newOpportunity.title,
            description: newOpportunity.description,
            amount: newOpportunity.amount ? parseFloat(newOpportunity.amount) : null,
            stage: newOpportunity.stage,
            probability: newOpportunity.probability,
            expectedCloseDate: newOpportunity.expectedCloseDate ? new Date(newOpportunity.expectedCloseDate).toISOString() : null,
            notes: newOpportunity.notes,
            tags: [],
          },
        },
      });
      await refetchLeadDetails();
      setShowAddOpportunity(false);
      setNewOpportunity({
        title: '',
        description: '',
        amount: '',
        stage: 'PROSPECTING',
        probability: 10,
        expectedCloseDate: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating opportunity:', error);
      alert('Failed to create opportunity. Please try again.');
    }
  };

  const handleUpdateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateOpportunity({
        variables: {
          id: editingOpportunity.id,
          input: {
            title: editingOpportunity.title,
            description: editingOpportunity.description,
            amount: editingOpportunity.amount ? parseFloat(editingOpportunity.amount) : null,
            stage: editingOpportunity.stage,
            probability: editingOpportunity.probability,
            expectedCloseDate: editingOpportunity.expectedCloseDate ? new Date(editingOpportunity.expectedCloseDate).toISOString() : null,
            notes: editingOpportunity.notes,
          },
        },
      });
      await refetchLeadDetails();
      setShowEditOpportunity(false);
      setEditingOpportunity(null);
    } catch (error) {
      console.error('Error updating opportunity:', error);
      alert('Failed to update opportunity. Please try again.');
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await deleteOpportunity({
          variables: { id: opportunityId },
        });
        await refetchLeadDetails();
      } catch (error) {
        console.error('Error deleting opportunity:', error);
        alert('Failed to delete opportunity. Please try again.');
      }
    }
  };

  const handleEditOpportunity = (opportunity: any) => {
    setEditingOpportunity({ ...opportunity });
    setShowEditOpportunity(true);
  };

  const handleAddOpportunityForLead = (lead: any) => {
    setLeadDetailsId(lead.id);
    setActiveTab('opportunities');
    setShowLeadModal(true);
    setShowAddOpportunity(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      NEW: 'text-gray-600 bg-gray-100',
      CONTACTED: 'text-blue-600 bg-blue-100',
      QUALIFIED: 'text-green-600 bg-green-100',
      PROPOSAL: 'text-purple-600 bg-purple-100',
      NEGOTIATION: 'text-orange-600 bg-orange-100',
      CONVERTED: 'text-green-600 bg-green-100',
      LOST: 'text-red-600 bg-red-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
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

  const formatDetailedDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getUserDisplayName = (userId: string) => {
    if (!usersData?.users) return 'Unknown User';
    const user = usersData.users.find((u: any) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  const parseActivityMetadata = (metadata: any) => {
    if (!metadata) return null;
    
    try {
      if (typeof metadata === 'string') {
        return JSON.parse(metadata);
      }
      return metadata;
    } catch (error) {
      console.error('Error parsing activity metadata:', error);
      return null;
    }
  };

  const getActivityChangeDetails = (activity: any) => {
    const metadata = parseActivityMetadata(activity.metadata);
    if (!metadata) return null;

    const changes = [];
    
    // Handle opportunity changes
    if (metadata.opportunityId) {
      if (activity.activityType === 'OTHER' && activity.description?.includes('Created opportunity')) {
        changes.push('New opportunity created');
      } else if (activity.activityType === 'OTHER' && activity.description?.includes('Updated opportunity')) {
        // Parse opportunity changes more clearly
        if (metadata.changes) {
          Object.entries(metadata.changes).forEach(([field, value]: [string, any]) => {
            const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
            
            if (field === 'amount') {
              const fromAmount = value.from ? `$${value.from.toLocaleString()}` : '$0';
              const toAmount = value.to ? `$${value.to.toLocaleString()}` : '$0';
              changes.push({
                type: 'amount',
                label: 'Amount',
                from: fromAmount,
                to: toAmount
              });
            } else if (field === 'stage') {
              changes.push({
                type: 'stage',
                label: 'Stage',
                from: value.from,
                to: value.to
              });
            } else if (field === 'probability') {
              changes.push({
                type: 'probability',
                label: 'Probability',
                from: `${value.from}%`,
                to: `${value.to}%`
              });
            } else if (field === 'expectedCloseDate') {
              changes.push({
                type: 'date',
                label: 'Expected Close Date',
                from: value.from ? new Date(value.from).toLocaleDateString() : 'Not set',
                to: value.to ? new Date(value.to).toLocaleDateString() : 'Not set'
              });
            } else if (field === 'title') {
              changes.push({
                type: 'text',
                label: 'Title',
                from: value.from,
                to: value.to
              });
            } else if (field === 'notes') {
              changes.push({
                type: 'notes',
                label: 'Notes',
                from: value.from || 'None',
                to: value.to || 'None'
              });
            } else {
              changes.push({
                type: 'text',
                label: fieldLabel,
                from: value.from,
                to: value.to
              });
            }
          });
        }
      } else if (activity.activityType === 'OTHER' && activity.description?.includes('Deleted opportunity')) {
        changes.push('Opportunity deleted');
      }
    }
    
    // Handle lead changes
    if (metadata.changes && !metadata.opportunityId) {
      Object.entries(metadata.changes).forEach(([field, value]: [string, any]) => {
        const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
        changes.push({
          type: 'text',
          label: fieldLabel,
          from: value.from,
          to: value.to
        });
      });
    }
    
    return changes.length > 0 ? changes : null;
  };

  const getActivityIcon = (activityType: string) => {
    const iconMap: { [key: string]: any } = {
      CREATED: Plus,
      CONTACTED: PhoneCall,
      QUALIFIED: CheckCircle,
      PROPOSAL_SENT: FileText,
      MEETING_SCHEDULED: Calendar,
      MEETING_COMPLETED: CheckCircle,
      FOLLOW_UP: Clock,
      CONVERTED: Star,
      LOST: XCircle,
      REASSIGNED: Users,
      NOTE_ADDED: MessageSquare,
      EMAIL_SENT: MailIcon,
      PHONE_CALL: PhoneCall,
      OTHER: FileText
    };
    return iconMap[activityType] || FileText;
  };

  const getActivityTypeLabel = (activityType: string) => {
    const labelMap: { [key: string]: string } = {
      CREATED: 'Lead Created',
      CONTACTED: 'Contacted',
      QUALIFIED: 'Qualified',
      PROPOSAL_SENT: 'Proposal Sent',
      MEETING_SCHEDULED: 'Meeting Scheduled',
      MEETING_COMPLETED: 'Meeting Completed',
      FOLLOW_UP: 'Follow Up',
      CONVERTED: 'Converted',
      LOST: 'Lost',
      REASSIGNED: 'Reassigned',
      NOTE_ADDED: 'Note Added',
      EMAIL_SENT: 'Email Sent',
      PHONE_CALL: 'Phone Call',
      OTHER: 'Activity'
    };
    return labelMap[activityType] || 'Activity';
  };

  const getActivityColor = (activityType: string) => {
    const colorMap: { [key: string]: string } = {
      CREATED: 'text-blue-600 bg-blue-50 border-blue-200',
      CONTACTED: 'text-green-600 bg-green-50 border-green-200',
      QUALIFIED: 'text-purple-600 bg-purple-50 border-purple-200',
      PROPOSAL_SENT: 'text-orange-600 bg-orange-50 border-orange-200',
      MEETING_SCHEDULED: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      MEETING_COMPLETED: 'text-green-600 bg-green-50 border-green-200',
      FOLLOW_UP: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      CONVERTED: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      LOST: 'text-red-600 bg-red-50 border-red-200',
      REASSIGNED: 'text-gray-600 bg-gray-50 border-gray-200',
      NOTE_ADDED: 'text-blue-600 bg-blue-50 border-blue-200',
      EMAIL_SENT: 'text-blue-600 bg-blue-50 border-blue-200',
      PHONE_CALL: 'text-green-600 bg-green-50 border-green-200',
      OTHER: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colorMap[activityType] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getOpportunityStageIcon = (stage: string) => {
    const iconMap: { [key: string]: any } = {
      PROSPECTING: TargetIcon,
      QUALIFICATION: Search,
      PROPOSAL: FileText,
      NEGOTIATION: Handshake,
      CLOSED_WON: Award,
      CLOSED_LOST: XCircle
    };
    return iconMap[stage] || TargetIcon;
  };

  const getOpportunityStageLabel = (stage: string) => {
    const labelMap: { [key: string]: string } = {
      PROSPECTING: 'Prospecting',
      QUALIFICATION: 'Qualification',
      PROPOSAL: 'Proposal',
      NEGOTIATION: 'Negotiation',
      CLOSED_WON: 'Closed Won',
      CLOSED_LOST: 'Closed Lost'
    };
    return labelMap[stage] || stage;
  };

  const getOpportunityStageColor = (stage: string) => {
    const colorMap: { [key: string]: string } = {
      PROSPECTING: 'text-blue-600 bg-blue-50 border-blue-200',
      QUALIFICATION: 'text-purple-600 bg-purple-50 border-purple-200',
      PROPOSAL: 'text-orange-600 bg-orange-50 border-orange-200',
      NEGOTIATION: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      CLOSED_WON: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      CLOSED_LOST: 'text-red-600 bg-red-50 border-red-200'
    };
    return colorMap[stage] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-emerald-600 bg-emerald-50';
    if (probability >= 60) return 'text-blue-600 bg-blue-50';
    if (probability >= 40) return 'text-yellow-600 bg-yellow-50';
    if (probability >= 20) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6" role="main" aria-label="Leads Management">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Leads</h1>
            <p className="mt-1 text-sm text-gray-600">Track leads and sales opportunities</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Create new lead"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Lead
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
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Leads
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {summary.totalLeads}
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
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Conversion Rate
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {summary.conversionRate}%
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
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pipeline Value
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {formatCurrency(summary.totalPipelineValue)}
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
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      This Month
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {leads.filter((lead: any) => new Date(lead.createdAt).getMonth() === new Date().getMonth()).length}
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
                  placeholder="Search leads by name, email, or company..."
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
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Sources</option>
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="EMAIL_CAMPAIGN">Email Campaign</option>
                <option value="PHONE_CALL">Phone Call</option>
                <option value="TRADE_SHOW">Trade Show</option>
                <option value="CONFERENCE">Conference</option>
                <option value="PARTNER">Partner</option>
                <option value="COLD_OUTREACH">Cold Outreach</option>
                <option value="ADVERTISING">Advertising</option>
                <option value="SEARCH_ENGINE">Search Engine</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
              >
                <option value="">All Assignments</option>
                <option value="unassigned">Unassigned</option>
                {usersData?.users?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('');
                  setSelectedSource('');
                  setSelectedAssignee('');
                }}
                disabled={!searchTerm && !selectedStatus && !selectedSource && !selectedAssignee}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
                {(searchTerm || selectedStatus || selectedSource || selectedAssignee) && (
                  <span className="ml-2 bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {[searchTerm, selectedStatus, selectedSource, selectedAssignee].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Lead Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Lead</h3>
              <form onSubmit={handleCreateLead}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newLead.name}
                      onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Lead name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={newLead.email}
                      onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="lead@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={newLead.company}
                      onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newLead.source}
                      onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      required
                    >
                      <option value="">Select Source</option>
                      <option value="WEBSITE">Website</option>
                      <option value="REFERRAL">Referral</option>
                      <option value="SOCIAL_MEDIA">Social Media</option>
                      <option value="EMAIL_CAMPAIGN">Email Campaign</option>
                      <option value="PHONE_CALL">Phone Call</option>
                      <option value="TRADE_SHOW">Trade Show</option>
                      <option value="CONFERENCE">Conference</option>
                      <option value="PARTNER">Partner</option>
                      <option value="COLD_OUTREACH">Cold Outreach</option>
                      <option value="ADVERTISING">Advertising</option>
                      <option value="SEARCH_ENGINE">Search Engine</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newLead.status || ''}
                      onChange={(e) => setNewLead({...newLead, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    >
                      <option value="">Select Status</option>
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="PROPOSAL_SENT">Proposal Sent</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="CONVERTED">Converted</option>
                      <option value="LOST">Lost</option>
                      <option value="DISQUALIFIED">Disqualified</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newLead.score || 0}
                      onChange={(e) => setNewLead({...newLead, score: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <select
                      value={newLead.assignedTo || ''}
                      onChange={(e) => setNewLead({...newLead, assignedTo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    >
                      <option value="">Unassigned</option>
                      {usersData?.users?.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={newLead.notes || ''}
                      onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Notes about this lead"
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
                      {creating ? 'Creating...' : 'Create Lead'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Lead Pipeline
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {leadsLoading 
                  ? 'Loading leads...' 
                  : `${leads.length} lead${leads.length !== 1 ? 's' : ''} found`
                }
                {(searchTerm || selectedStatus || selectedSource || selectedAssignee) && (
                  <span className="ml-2 text-blue-600">
                    (filtered)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => refetchLeads()}
                disabled={leadsLoading}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${leadsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Lead
              </button>
            </div>
          </div>

          {leadsLoading ? (
            <div className="space-y-4">
              {/* Skeleton loader for table */}
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
                ))}
              </div>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedStatus || selectedSource || selectedAssignee 
                  ? 'No leads match your filters' 
                  : 'No leads found'
                }
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || selectedStatus || selectedSource || selectedAssignee 
                  ? 'Try adjusting your search criteria or filters to find more leads.'
                  : 'Get started by creating your first lead to begin tracking sales opportunities.'
                }
              </p>
              <div className="flex justify-center space-x-3">
                {(searchTerm || selectedStatus || selectedSource || selectedAssignee) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('');
                      setSelectedSource('');
                      setSelectedAssignee('');
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
                  Create Lead
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Leads table">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                      role="columnheader"
                      aria-sort={sortField === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSort('name')}
                    >
                      <div className="flex items-center">
                        Lead
                        {sortField === 'name' && (
                          <span className="ml-1" aria-hidden="true">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('company')}
                      role="columnheader"
                      aria-sort={sortField === 'company' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSort('company')}
                    >
                      <div className="flex items-center">
                        Company
                        {sortField === 'company' && (
                          <span className="ml-1" aria-hidden="true">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                      role="columnheader"
                      aria-sort={sortField === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortField === 'status' && (
                          <span className="ml-1" aria-hidden="true">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('score')}
                      role="columnheader"
                      aria-sort={sortField === 'score' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSort('score')}
                    >
                      <div className="flex items-center">
                        Score
                        {sortField === 'score' && (
                          <span className="ml-1" aria-hidden="true">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                      role="columnheader"
                      aria-sort={sortField === 'email' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSort('email')}
                    >
                      <div className="flex items-center">
                        Contact Info
                        {sortField === 'email' && (
                          <span className="ml-1" aria-hidden="true">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                      role="columnheader"
                      aria-sort={sortField === 'createdAt' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Created
                        {sortField === 'createdAt' && (
                          <span className="ml-1" aria-hidden="true">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" role="columnheader">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedLeads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {lead.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.source}
                            </div>
                            <div className="text-sm text-gray-400">
                              {lead.assignedUser 
                                ? `Assigned to ${lead.assignedUser.firstName} ${lead.assignedUser.lastName}`
                                : 'Unassigned'
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.company || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                          {lead.score}/100
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-1" />
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center mt-1">
                              <Phone className="h-4 w-4 text-gray-400 mr-1" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewLead(lead)} 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-150" 
                            title="View Lead Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleAddOpportunityForLead(lead)} 
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors duration-150" 
                            title="Add Opportunity"
                          >
                            <Briefcase className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditLead(lead)} 
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors duration-150" 
                            title="Edit Lead"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteLead(lead.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-150"
                            title="Delete Lead"
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

      {showLeadModal && leadDetailsData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Lead Details - {leadDetailsData.lead.name}</h3>
                <button onClick={() => setShowLeadModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'basic'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Basic Info
                  </button>
                  <button
                    onClick={() => setActiveTab('opportunities')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'opportunities'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Opportunities ({leadDetailsData.lead.opportunities?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('activities')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'activities'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Activities ({leadDetailsData.lead.activities?.length || 0})
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Contact Information Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <User className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Name</p>
                          <p className="text-sm font-medium text-gray-900">{leadDetailsData.lead.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900">{leadDetailsData.lead.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Phone className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{leadDetailsData.lead.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Building className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Company</p>
                          <p className="text-sm font-medium text-gray-900">{leadDetailsData.lead.company || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lead Status & Details Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Target className="w-5 h-5 text-indigo-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Lead Status & Details</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Target className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leadDetailsData.lead.status)}`}>
                            {leadDetailsData.lead.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Score</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(leadDetailsData.lead.score)}`}>
                            {leadDetailsData.lead.score}/100
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Source</p>
                          <p className="text-sm font-medium text-gray-900">{leadDetailsData.lead.source.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Assigned To</p>
                          <p className="text-sm font-medium text-gray-900">
                            {leadDetailsData.lead.assignedUser 
                              ? `${leadDetailsData.lead.assignedUser.firstName} ${leadDetailsData.lead.assignedUser.lastName}`
                              : 'Unassigned'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Information Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Timeline</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Plus className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Created</p>
                          <p className="text-sm font-medium text-gray-900">{formatDetailedDateTime(leadDetailsData.lead.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Edit className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Last Updated</p>
                          <p className="text-sm font-medium text-gray-900">{formatDetailedDateTime(leadDetailsData.lead.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Notes</h4>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px]">
                      {leadDetailsData.lead.notes ? (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{leadDetailsData.lead.notes}</p>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No notes available for this lead.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'opportunities' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Opportunities</h4>
                    <button
                      onClick={() => setShowAddOpportunity(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Opportunity</span>
                    </button>
                  </div>
                  
                  {leadDetailsData.lead.opportunities && leadDetailsData.lead.opportunities.length > 0 ? (
                    <div className="space-y-4">
                      {leadDetailsData.lead.opportunities.map((opp: any) => {
                        const StageIcon = getOpportunityStageIcon(opp.stage);
                        const stageLabel = getOpportunityStageLabel(opp.stage);
                        const stageColor = getOpportunityStageColor(opp.stage);
                        const probabilityColor = getProbabilityColor(opp.probability);
                        
                        return (
                          <div key={opp.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${stageColor}`}>
                                  <StageIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-lg font-semibold text-gray-900">{opp.title}</h5>
                                    <div className="flex items-center space-x-2">
                                      <button 
                                        onClick={() => handleEditOpportunity(opp)} 
                                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                                        title="Edit Opportunity"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteOpportunity(opp.id)} 
                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                        title="Delete Opportunity"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div className="flex items-center space-x-2">
                                      <DollarSign className="w-4 h-4 text-gray-400" />
                                      <div>
                                        <p className="text-xs text-gray-500">Amount</p>
                                        <p className="text-sm font-medium text-gray-900">
                                          {opp.amount ? formatCurrency(opp.amount) : 'Not set'}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <TargetIcon className="w-4 h-4 text-gray-400" />
                                      <div>
                                        <p className="text-xs text-gray-500">Stage</p>
                                        <p className="text-sm font-medium text-gray-900">{stageLabel}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <TrendingUp className="w-4 h-4 text-gray-400" />
                                      <div>
                                        <p className="text-xs text-gray-500">Probability</p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${probabilityColor}`}>
                                          {opp.probability}%
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="w-4 h-4 text-gray-400" />
                                      <div>
                                        <p className="text-xs text-gray-500">Expected Close</p>
                                        <p className="text-sm font-medium text-gray-900">
                                          {opp.expectedCloseDate ? formatDate(opp.expectedCloseDate) : 'Not set'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {(opp.description || opp.notes) && (
                                    <div className="space-y-2">
                                      {opp.description && (
                                        <div>
                                          <p className="text-xs text-gray-500 mb-1">Description</p>
                                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{opp.description}</p>
                                        </div>
                                      )}
                                      {opp.notes && (
                                        <div>
                                          <p className="text-xs text-gray-500 mb-1">Notes</p>
                                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{opp.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">No opportunities yet</p>
                      <p className="text-sm text-gray-500 mb-4">Create opportunities to track potential deals and revenue.</p>
                      <button
                        onClick={() => setShowAddOpportunity(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add First Opportunity</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activities' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Activities</h4>
                  {leadDetailsData.lead.activities && leadDetailsData.lead.activities.length > 0 ? (
                    <div className="space-y-4">
                      {leadDetailsData.lead.activities.map((act: any) => {
                        const IconComponent = getActivityIcon(act.activityType);
                        const activityLabel = getActivityTypeLabel(act.activityType);
                        const activityColor = getActivityColor(act.activityType);
                        const changeDetails = getActivityChangeDetails(act);
                        const userDisplayName = getUserDisplayName(act.createdBy);
                        
                        return (
                          <div key={act.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start space-x-3">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${activityColor}`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="text-sm font-medium text-gray-900">{activityLabel}</h5>
                                    {act.description && (
                                      <p className="text-sm text-gray-600 mt-1">{act.description}</p>
                                    )}
                                  </div>
                                  <div className="text-right ml-4">
                                    <div className="text-xs text-gray-500 font-medium">
                                      {formatDetailedDateTime(act.createdAt)}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      by {userDisplayName}
                                    </div>
                                  </div>
                                </div>
                                
                                {changeDetails && changeDetails.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center space-x-2 mb-3">
                                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                      <span className="text-xs font-medium text-gray-700">Changes Made:</span>
                                    </div>
                                    <div className="space-y-2">
                                      {changeDetails.map((change: any, index: number) => (
                                        <div key={index} className="bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              {change.type === 'amount' && <DollarSign className="w-3 h-3 text-green-600" />}
                                              {change.type === 'stage' && <TargetIcon className="w-3 h-3 text-blue-600" />}
                                              {change.type === 'probability' && <TrendingUp className="w-3 h-3 text-purple-600" />}
                                              {change.type === 'date' && <Calendar className="w-3 h-3 text-orange-600" />}
                                              {change.type === 'text' && <FileText className="w-3 h-3 text-gray-600" />}
                                              {change.type === 'notes' && <MessageSquare className="w-3 h-3 text-blue-600" />}
                                              <span className="text-xs font-medium text-gray-700">{change.label}:</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                                                {change.from || 'None'}
                                              </span>
                                              <ArrowRight className="w-3 h-3 text-gray-400" />
                                              <span className="text-xs text-gray-900 bg-white px-2 py-1 rounded border font-medium">
                                                {change.to || 'None'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">No activities yet</p>
                      <p className="text-sm text-gray-500">Activities will appear here as you interact with this lead.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowLeadModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Opportunity Modal */}
      {showAddOpportunity && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Opportunity</h3>
              <form onSubmit={handleCreateOpportunity}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={newOpportunity.title}
                      onChange={(e) => setNewOpportunity({...newOpportunity, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Opportunity title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newOpportunity.description}
                      onChange={(e) => setNewOpportunity({...newOpportunity, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newOpportunity.amount}
                      onChange={(e) => setNewOpportunity({...newOpportunity, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                    <select
                      value={newOpportunity.stage}
                      onChange={(e) => setNewOpportunity({...newOpportunity, stage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    >
                      <option value="PROSPECTING">Prospecting</option>
                      <option value="QUALIFICATION">Qualification</option>
                      <option value="PROPOSAL">Proposal</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="CLOSED_WON">Closed Won</option>
                      <option value="CLOSED_LOST">Closed Lost</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newOpportunity.probability}
                      onChange={(e) => setNewOpportunity({...newOpportunity, probability: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                    <input
                      type="date"
                      value={newOpportunity.expectedCloseDate}
                      onChange={(e) => setNewOpportunity({...newOpportunity, expectedCloseDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={newOpportunity.notes}
                      onChange={(e) => setNewOpportunity({...newOpportunity, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Notes"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => setShowAddOpportunity(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                    <button type="submit" disabled={creatingOpportunity} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {creatingOpportunity ? 'Creating...' : 'Create Opportunity'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Opportunity Modal */}
      {showEditOpportunity && editingOpportunity && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Opportunity</h3>
              <form onSubmit={handleUpdateOpportunity}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={editingOpportunity.title}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Opportunity title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editingOpportunity.description || ''}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingOpportunity.amount || ''}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                    <select
                      value={editingOpportunity.stage}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, stage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    >
                      <option value="PROSPECTING">Prospecting</option>
                      <option value="QUALIFICATION">Qualification</option>
                      <option value="PROPOSAL">Proposal</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="CLOSED_WON">Closed Won</option>
                      <option value="CLOSED_LOST">Closed Lost</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingOpportunity.probability}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, probability: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                    <input
                      type="date"
                      value={editingOpportunity.expectedCloseDate ? editingOpportunity.expectedCloseDate.split('T')[0] : ''}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, expectedCloseDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={editingOpportunity.notes || ''}
                      onChange={(e) => setEditingOpportunity({...editingOpportunity, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Notes"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => setShowEditOpportunity(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                    <button type="submit" disabled={updatingOpportunity} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {updatingOpportunity ? 'Updating...' : 'Update Opportunity'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Lead</h3>
              <form onSubmit={handleUpdateLead}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" required value={editingLead.name} onChange={e => setEditingLead({...editingLead, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500" placeholder="Lead name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" required value={editingLead.email} onChange={e => setEditingLead({...editingLead, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500" placeholder="lead@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={editingLead.phone || ''} onChange={e => setEditingLead({...editingLead, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input type="text" value={editingLead.company || ''} onChange={e => setEditingLead({...editingLead, company: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500" placeholder="Company name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source <span className="text-red-500">*</span></label>
                    <select
                      value={editingLead.source || ''}
                      onChange={e => setEditingLead({...editingLead, source: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      required
                    >
                      <option value="">Select Source</option>
                      <option value="WEBSITE">Website</option>
                      <option value="REFERRAL">Referral</option>
                      <option value="SOCIAL_MEDIA">Social Media</option>
                      <option value="EMAIL_CAMPAIGN">Email Campaign</option>
                      <option value="PHONE_CALL">Phone Call</option>
                      <option value="TRADE_SHOW">Trade Show</option>
                      <option value="CONFERENCE">Conference</option>
                      <option value="PARTNER">Partner</option>
                      <option value="COLD_OUTREACH">Cold Outreach</option>
                      <option value="ADVERTISING">Advertising</option>
                      <option value="SEARCH_ENGINE">Search Engine</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      value={editingLead.status || ''} 
                      onChange={e => setEditingLead({...editingLead, status: e.target.value})} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    >
                      <option value="">Select Status</option>
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="PROPOSAL_SENT">Proposal Sent</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="CONVERTED">Converted</option>
                      <option value="LOST">Lost</option>
                      <option value="DISQUALIFIED">Disqualified</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                    <input type="number" value={editingLead.score || 0} onChange={e => setEditingLead({...editingLead, score: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500" placeholder="Score" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                    <select
                      value={editingLead.assignedTo || ''}
                      onChange={e => setEditingLead({...editingLead, assignedTo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    >
                      <option value="">Unassigned</option>
                      {usersData?.users?.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea value={editingLead.notes || ''} onChange={e => setEditingLead({...editingLead, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500" placeholder="Notes about this lead" rows={3} />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update Lead</button>
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