const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:4000/graphql';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZDlwa2JzMTAwMDMxYzVkN2wyNmdmZHgiLCJlbWFpbCI6InRlc3RAYml6Zmxvdy5jb20iLCJyb2xlIjoiT1dORVIiLCJjb21wYW55SWQiOiJjbWQ5cGticnowMDAxMWM1ZGNkZHBrZXhsIiwiaWF0IjoxNzUyODk2OTE0LCJleHAiOjE3NTM1MDE3MTR9.RObtWBSYue7WTTnz16y8qXwPiP1x2plM-Ku4MCZbJ7k';

// Test data
let testLeadId;
let testOpportunityId;
let testActivityId;
let testCustomerId;
let currentUserId;

// Helper function to decode JWT token and get user ID
function getUserIdFromToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload).id;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

// Helper function to get current user info
async function getCurrentUser() {
  console.log('🔍 Getting current user information...');
  
  const query = `
    query Me {
      me {
        id
        email
        firstName
        lastName
        role
        companyId
      }
    }
  `;

  const result = await graphqlRequest(query);
  currentUserId = result.me.id;
  
  console.log(`✅ Current user: ${result.me.firstName} ${result.me.lastName} (ID: ${currentUserId})`);
  return result.me;
}

// Helper function to make GraphQL requests
async function graphqlRequest(query, variables = {}) {
  try {
    const response = await axios.post(API_URL, {
      query,
      variables
    }, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.errors) {
      console.error('GraphQL Errors:', response.data.errors);
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data;
  } catch (error) {
    console.error('Request failed:', error.message);
    throw error;
  }
}

// Test functions
async function testCreateCustomer() {
  console.log('\n🧪 Testing: Create Customer for Lead Conversion');
  
  const query = `
    mutation CreateCustomer($input: CreateCustomerInput!) {
      createCustomer(input: $input) {
        id
        name
        type
        status
        email
        phone
        website
        industry
        size
        annualRevenue
        notes
        tags
        createdAt
        updatedAt
      }
    }
  `;

  const variables = {
    input: {
      name: 'Test Company for Lead Conversion',
      type: 'COMPANY',
      status: 'ACTIVE',
      email: 'test@conversioncompany.com',
      phone: '+1-555-0126',
      website: 'https://conversioncompany.com',
      industry: 'Technology',
      size: '11-50',
      annualRevenue: 2000000,
      notes: 'Test customer for lead conversion',
      tags: ['test', 'lead-conversion', 'bus-4']
    }
  };

  const result = await graphqlRequest(query, variables);
  testCustomerId = result.createCustomer.id;
  
  console.log('✅ Customer created successfully for lead conversion');
  console.log(`   ID: ${testCustomerId}`);
  console.log(`   Name: ${result.createCustomer.name}`);
  
  return result.createCustomer;
}

async function testCreateLead() {
  console.log('\n🧪 Testing: Create Lead');
  
  const query = `
    mutation CreateLead($input: CreateLeadInput!) {
      createLead(input: $input) {
        id
        companyId
        name
        email
        phone
        website
        source
        status
        score
        company
        industry
        size
        annualRevenue
        assignedTo
        assignedAt
        lastContactedAt
        notes
        tags
        convertedToCustomerId
        convertedAt
        createdAt
        updatedAt
        company_ref {
          id
          name
        }
        assignedUser {
          id
          firstName
          lastName
        }
      }
    }
  `;

  const variables = {
    input: {
      name: 'John Smith',
      email: 'john.smith@prospectcompany.com',
      phone: '+1-555-0127',
      website: 'https://prospectcompany.com',
      source: 'WEBSITE',
      status: 'NEW',
      score: 75,
      company: 'Prospect Company Inc',
      industry: 'Manufacturing',
      size: '51-200',
      annualRevenue: 5000000,
      notes: 'High-value prospect from website contact form',
      tags: ['high-value', 'website-lead', 'manufacturing']
    }
  };

  const result = await graphqlRequest(query, variables);
  testLeadId = result.createLead.id;
  
  console.log('✅ Lead created successfully');
  console.log(`   ID: ${testLeadId}`);
  console.log(`   Name: ${result.createLead.name}`);
  console.log(`   Email: ${result.createLead.email}`);
  console.log(`   Source: ${result.createLead.source}`);
  console.log(`   Status: ${result.createLead.status}`);
  console.log(`   Score: ${result.createLead.score}`);
  
  return result.createLead;
}

async function testCreateOpportunity() {
  console.log('\n🧪 Testing: Create Opportunity');
  
  const query = `
    mutation CreateOpportunity($input: CreateOpportunityInput!) {
      createOpportunity(input: $input) {
        id
        leadId
        title
        description
        amount
        stage
        probability
        expectedCloseDate
        actualCloseDate
        notes
        tags
        createdAt
        updatedAt
        lead {
          id
          name
          email
        }
      }
    }
  `;

  const variables = {
    input: {
      leadId: testLeadId,
      title: 'Enterprise Software License',
      description: 'Full enterprise software license for 200 users',
      amount: 50000,
      stage: 'PROSPECTING',
      probability: 25,
      expectedCloseDate: '2025-12-31T23:59:59Z',
      notes: 'Initial opportunity from lead qualification',
      tags: ['enterprise', 'software-license', 'high-value']
    }
  };

  const result = await graphqlRequest(query, variables);
  testOpportunityId = result.createOpportunity.id;
  
  console.log('✅ Opportunity created successfully');
  console.log(`   ID: ${testOpportunityId}`);
  console.log(`   Title: ${result.createOpportunity.title}`);
  console.log(`   Amount: $${result.createOpportunity.amount}`);
  console.log(`   Stage: ${result.createOpportunity.stage}`);
  console.log(`   Probability: ${result.createOpportunity.probability}%`);
  
  return result.createOpportunity;
}

async function testCreateLeadActivity() {
  console.log('\n🧪 Testing: Create Lead Activity');
  
  const query = `
    mutation CreateLeadActivity($input: CreateLeadActivityInput!) {
      createLeadActivity(input: $input) {
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
  `;

  const variables = {
    input: {
      leadId: testLeadId,
      activityType: 'MEETING_SCHEDULED',
      description: 'Scheduled initial discovery call for next week',
      metadata: {
        meetingDate: '2025-07-26T14:00:00Z',
        duration: 60,
        location: 'Virtual',
        attendees: ['john.smith@prospectcompany.com', 'sales@ourcompany.com']
      }
    }
  };

  const result = await graphqlRequest(query, variables);
  testActivityId = result.createLeadActivity.id;
  
  console.log('✅ Lead activity created successfully');
  console.log(`   ID: ${testActivityId}`);
  console.log(`   Type: ${result.createLeadActivity.activityType}`);
  console.log(`   Description: ${result.createLeadActivity.description}`);
  
  return result.createLeadActivity;
}

async function testEnhancedLeadSearch() {
  console.log('\n🧪 Testing: Enhanced Lead Search and Filtering');
  
  const query = `
    query SearchLeads($filter: LeadFilterInput) {
      leads(filter: $filter, first: 10) {
        edges {
          node {
            id
            name
            email
            phone
            source
            status
            score
            company
            industry
            assignedTo
            lastContactedAt
            tags
            company_ref {
              id
              name
            }
            assignedUser {
              id
              firstName
              lastName
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `;

  // Test search by name
  console.log('   🔍 Testing search by name...');
  const searchResult = await graphqlRequest(query, {
    filter: { search: 'John' }
  });
  console.log(`   ✅ Found ${searchResult.leads.totalCount} leads with name 'John'`);

  // Test filter by source
  console.log('   🔍 Testing filter by source...');
  const sourceResult = await graphqlRequest(query, {
    filter: { source: 'WEBSITE' }
  });
  console.log(`   ✅ Found ${sourceResult.leads.totalCount} leads from website`);

  // Test filter by status
  console.log('   🔍 Testing filter by status...');
  const statusResult = await graphqlRequest(query, {
    filter: { status: 'NEW' }
  });
  console.log(`   ✅ Found ${statusResult.leads.totalCount} new leads`);

  // Test filter by score range
  console.log('   🔍 Testing filter by score range...');
  const scoreResult = await graphqlRequest(query, {
    filter: { scoreMin: 50, scoreMax: 100 }
  });
  console.log(`   ✅ Found ${scoreResult.leads.totalCount} leads with score 50-100`);

  // Test filter by industry
  console.log('   🔍 Testing filter by industry...');
  const industryResult = await graphqlRequest(query, {
    filter: { industry: 'Manufacturing' }
  });
  console.log(`   ✅ Found ${industryResult.leads.totalCount} leads in manufacturing`);

  return { searchResult, sourceResult, statusResult, scoreResult, industryResult };
}

async function testOpportunities() {
  console.log('\n🧪 Testing: Opportunities');
  
  const query = `
    query GetOpportunities($leadId: ID, $filter: OpportunityFilterInput) {
      opportunities(leadId: $leadId, filter: $filter, first: 10) {
        edges {
          node {
            id
            title
            description
            amount
            stage
            probability
            expectedCloseDate
            actualCloseDate
            notes
            tags
            createdAt
            lead {
              id
              name
              email
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `;

  // Get all opportunities for the lead
  const result = await graphqlRequest(query, {
    leadId: testLeadId
  });
  
  console.log(`✅ Found ${result.opportunities.totalCount} opportunities for lead`);
  
  // Test filter by stage
  const stageResult = await graphqlRequest(query, {
    leadId: testLeadId,
    filter: { stage: 'PROSPECTING' }
  });
  console.log(`   ✅ Found ${stageResult.opportunities.totalCount} prospecting opportunities`);

  // Test filter by amount range
  const amountResult = await graphqlRequest(query, {
    leadId: testLeadId,
    filter: { amountMin: 10000, amountMax: 100000 }
  });
  console.log(`   ✅ Found ${amountResult.opportunities.totalCount} opportunities with amount $10k-$100k`);

  return { result, stageResult, amountResult };
}

async function testLeadActivities() {
  console.log('\n🧪 Testing: Lead Activities');
  
  const query = `
    query GetLeadActivities($leadId: ID) {
      leadActivities(leadId: $leadId, first: 10) {
        edges {
          node {
            id
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
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `;

  const result = await graphqlRequest(query, {
    leadId: testLeadId
  });
  
  console.log(`✅ Found ${result.leadActivities.totalCount} activities for lead`);
  
  if (result.leadActivities.edges.length > 0) {
    const activity = result.leadActivities.edges[0].node;
    console.log(`   Latest activity: ${activity.activityType} - ${activity.description}`);
  }

  return result;
}

async function testLeadManagementOperations() {
  console.log('\n🧪 Testing: Lead Management Operations');
  
  // Test assign lead
  console.log('   🔧 Testing assign lead...');
  const assignQuery = `
    mutation AssignLead($leadId: ID!, $userId: String!) {
      assignLead(leadId: $leadId, userId: $userId) {
        id
        name
        email
        assignedTo
        assignedAt
        updatedAt
        assignedUser {
          id
          firstName
          lastName
        }
      }
    }
  `;
  
  // Note: You'll need to replace 'USER_ID_HERE' with an actual user ID from your system
  const assignResult = await graphqlRequest(assignQuery, {
    leadId: testLeadId,
    userId: currentUserId // Use the actual current user ID
  });
  console.log(`   ✅ Lead assigned to user: ${assignResult.assignLead.assignedTo}`);

  // Test update lead status
  console.log('   🔧 Testing update lead status...');
  const statusQuery = `
    mutation UpdateLeadStatus($leadId: ID!, $status: LeadStatus!) {
      updateLeadStatus(leadId: $leadId, status: $status) {
        id
        name
        email
        status
        updatedAt
      }
    }
  `;
  
  const statusResult = await graphqlRequest(statusQuery, {
    leadId: testLeadId,
    status: 'CONTACTED'
  });
  console.log(`   ✅ Lead status updated to: ${statusResult.updateLeadStatus.status}`);

  // Test update lead score
  console.log('   🔧 Testing update lead score...');
  const scoreQuery = `
    mutation UpdateLeadScore($leadId: ID!, $score: Int!) {
      updateLeadScore(leadId: $leadId, score: $score) {
        id
        name
        email
        score
        updatedAt
      }
    }
  `;
  
  const scoreResult = await graphqlRequest(scoreQuery, {
    leadId: testLeadId,
    score: 85
  });
  console.log(`   ✅ Lead score updated to: ${scoreResult.updateLeadScore.score}`);

  // Test update last contacted
  console.log('   🔧 Testing update last contacted...');
  const contactedQuery = `
    mutation UpdateLeadLastContacted($leadId: ID!) {
      updateLeadLastContacted(leadId: $leadId) {
        id
        name
        email
        lastContactedAt
        updatedAt
      }
    }
  `;
  
  const contactedResult = await graphqlRequest(contactedQuery, {
    leadId: testLeadId
  });
  console.log(`   ✅ Last contacted updated: ${contactedResult.updateLeadLastContacted.lastContactedAt}`);

  return { assignResult, statusResult, scoreResult, contactedResult };
}

async function testLeadConversion() {
  console.log('\n🧪 Testing: Lead Conversion to Customer');
  
  const query = `
    mutation ConvertLeadToCustomer($leadId: ID!, $customerId: ID!) {
      convertLeadToCustomer(leadId: $leadId, customerId: $customerId) {
        id
        name
        email
        status
        convertedToCustomerId
        convertedAt
        updatedAt
        company_ref {
          id
          name
        }
      }
    }
  `;

  const variables = {
    leadId: testLeadId,
    customerId: testCustomerId
  };

  const result = await graphqlRequest(query, variables);
  
  console.log('✅ Lead converted to customer successfully');
  console.log(`   Lead ID: ${result.convertLeadToCustomer.id}`);
  console.log(`   Customer ID: ${result.convertLeadToCustomer.convertedToCustomerId}`);
  console.log(`   Status: ${result.convertLeadToCustomer.status}`);
  console.log(`   Converted At: ${result.convertLeadToCustomer.convertedAt}`);
  
  return result.convertLeadToCustomer;
}

async function testLeadPipeline() {
  console.log('\n🧪 Testing: Lead Pipeline Analytics');
  
  const query = `
    query GetLeadPipeline {
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

  const result = await graphqlRequest(query);
  
  console.log('✅ Lead pipeline analytics retrieved successfully');
  console.log(`   Total Leads: ${result.leadPipeline.totalLeads}`);
  console.log(`   New Leads: ${result.leadPipeline.newLeads}`);
  console.log(`   Contacted Leads: ${result.leadPipeline.contactedLeads}`);
  console.log(`   Qualified Leads: ${result.leadPipeline.qualifiedLeads}`);
  console.log(`   Proposal Leads: ${result.leadPipeline.proposalLeads}`);
  console.log(`   Negotiation Leads: ${result.leadPipeline.negotiationLeads}`);
  console.log(`   Converted Leads: ${result.leadPipeline.convertedLeads}`);
  console.log(`   Lost Leads: ${result.leadPipeline.lostLeads}`);
  console.log(`   Total Opportunities: ${result.leadPipeline.totalOpportunities}`);
  console.log(`   Total Pipeline Value: $${result.leadPipeline.totalPipelineValue}`);
  console.log(`   Conversion Rate: ${result.leadPipeline.conversionRate}%`);
  
  return result.leadPipeline;
}

async function testUpdateLead() {
  console.log('\n🧪 Testing: Update Lead');
  
  const query = `
    mutation UpdateLead($id: ID!, $input: UpdateLeadInput!) {
      updateLead(id: $id, input: $input) {
        id
        name
        email
        phone
        website
        source
        status
        score
        company
        industry
        size
        annualRevenue
        assignedTo
        notes
        tags
        updatedAt
      }
    }
  `;

  const variables = {
    id: testLeadId,
    input: {
      name: 'John Smith Updated',
      email: 'john.updated@prospectcompany.com',
      phone: '+1-555-0128',
      website: 'https://updatedprospectcompany.com',
      source: 'REFERRAL',
      status: 'QUALIFIED',
      score: 90,
      company: 'Updated Prospect Company Inc',
      industry: 'Technology',
      size: '201-500',
      annualRevenue: 7500000,
      notes: 'Updated lead information after qualification',
      tags: ['high-value', 'qualified', 'technology', 'referral']
    }
  };

  const result = await graphqlRequest(query, variables);
  
  console.log('✅ Lead updated successfully');
  console.log(`   Name: ${result.updateLead.name}`);
  console.log(`   Email: ${result.updateLead.email}`);
  console.log(`   Source: ${result.updateLead.source}`);
  console.log(`   Status: ${result.updateLead.status}`);
  console.log(`   Score: ${result.updateLead.score}`);
  
  return result.updateLead;
}

async function testGetLeadWithRelations() {
  console.log('\n🧪 Testing: Get Lead with Relations');
  
  const query = `
    query GetLead($id: ID!) {
      lead(id: $id) {
        id
        name
        email
        phone
        website
        source
        status
        score
        company
        industry
        size
        annualRevenue
        assignedTo
        assignedAt
        lastContactedAt
        notes
        tags
        convertedToCustomerId
        convertedAt
        createdAt
        updatedAt
        company_ref {
          id
          name
          industry
        }
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
          createdAt
        }
        activities {
          id
          activityType
          description
          createdAt
        }
      }
    }
  `;

  const result = await graphqlRequest(query, { id: testLeadId });
  
  console.log('✅ Lead retrieved with all relations');
  console.log(`   Name: ${result.lead.name}`);
  console.log(`   Company: ${result.lead.company_ref.name}`);
  console.log(`   Opportunities: ${result.lead.opportunities.length}`);
  console.log(`   Activities: ${result.lead.activities.length}`);
  
  return result.lead;
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting BUS-4 Lead Management API Tests');
  console.log('=' .repeat(60));
  
  try {
    // Get current user information first
    await getCurrentUser();
    
    // Create test data
    await testCreateCustomer();
    await testCreateLead();
    await testCreateOpportunity();
    await testCreateLeadActivity();
    
    // Test enhanced features
    await testEnhancedLeadSearch();
    await testOpportunities();
    await testLeadActivities();
    await testLeadManagementOperations();
    await testUpdateLead();
    await testGetLeadWithRelations();
    await testLeadConversion();
    await testLeadPipeline();
    
    console.log('\n🎉 All BUS-4 Lead Management tests completed successfully!');
    console.log('=' .repeat(60));
    console.log('✅ Lead CRUD operations working');
    console.log('✅ Opportunity management working');
    console.log('✅ Lead activity tracking working');
    console.log('✅ Enhanced lead search and filtering working');
    console.log('✅ Lead management operations working');
    console.log('✅ Lead conversion workflow working');
    console.log('✅ Lead pipeline analytics working');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  if (JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.error('❌ Please set a valid JWT_TOKEN in the script before running tests');
    process.exit(1);
  }
  
  runTests();
}

module.exports = {
  runTests,
  testCreateCustomer,
  testCreateLead,
  testCreateOpportunity,
  testCreateLeadActivity,
  testEnhancedLeadSearch,
  testOpportunities,
  testLeadActivities,
  testLeadManagementOperations,
  testLeadConversion,
  testLeadPipeline,
  testUpdateLead,
  testGetLeadWithRelations
}; 