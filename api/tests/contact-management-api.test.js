const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:4000/graphql';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual JWT token

// Test data
let testCustomerId;
let testContactId;
let testCommunicationId;
let testActivityId;

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
  console.log('\n🧪 Testing: Create Customer');
  
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
      name: 'Test Company for Contact Management',
      type: 'COMPANY',
      status: 'ACTIVE',
      email: 'test@company.com',
      phone: '+1-555-0123',
      website: 'https://testcompany.com',
      industry: 'Technology',
      size: '11-50',
      annualRevenue: 1000000,
      notes: 'Test customer for contact management features',
      tags: ['test', 'contact-management', 'bus-3']
    }
  };

  const result = await graphqlRequest(query, variables);
  testCustomerId = result.createCustomer.id;
  
  console.log('✅ Customer created successfully');
  console.log(`   ID: ${testCustomerId}`);
  console.log(`   Name: ${result.createCustomer.name}`);
  
  return result.createCustomer;
}

async function testCreateContact() {
  console.log('\n🧪 Testing: Create Contact');
  
  const query = `
    mutation CreateContact($input: CreateContactInput!) {
      createContact(input: $input) {
        id
        customerId
        firstName
        lastName
        email
        phone
        role
        isPrimary
        notes
        lastContactedAt
        contactFrequency
        createdAt
        updatedAt
        customer {
          id
          name
        }
      }
    }
  `;

  const variables = {
    input: {
      customerId: testCustomerId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@testcompany.com',
      phone: '+1-555-0124',
      role: 'CEO',
      isPrimary: true,
      notes: 'Primary contact for the company',
      contactFrequency: 'WEEKLY'
    }
  };

  const result = await graphqlRequest(query, variables);
  testContactId = result.createContact.id;
  
  console.log('✅ Contact created successfully');
  console.log(`   ID: ${testContactId}`);
  console.log(`   Name: ${result.createContact.firstName} ${result.createContact.lastName}`);
  console.log(`   Role: ${result.createContact.role}`);
  console.log(`   Primary: ${result.createContact.isPrimary}`);
  
  return result.createContact;
}

async function testCreateContactCommunication() {
  console.log('\n🧪 Testing: Create Contact Communication');
  
  const query = `
    mutation CreateContactCommunication($input: CreateContactCommunicationInput!) {
      createContactCommunication(input: $input) {
        id
        contactId
        type
        subject
        content
        direction
        status
        channel
        duration
        scheduledAt
        createdAt
        updatedAt
        contact {
          id
          firstName
          lastName
        }
      }
    }
  `;

  const variables = {
    input: {
      contactId: testContactId,
      type: 'EMAIL',
      subject: 'Follow-up on proposal',
      content: 'Hi John, I wanted to follow up on the proposal we discussed last week.',
      direction: 'OUTBOUND',
      status: 'SENT',
      channel: 'EMAIL',
      duration: null,
      scheduledAt: null
    }
  };

  const result = await graphqlRequest(query, variables);
  testCommunicationId = result.createContactCommunication.id;
  
  console.log('✅ Contact communication created successfully');
  console.log(`   ID: ${testCommunicationId}`);
  console.log(`   Type: ${result.createContactCommunication.type}`);
  console.log(`   Subject: ${result.createContactCommunication.subject}`);
  console.log(`   Direction: ${result.createContactCommunication.direction}`);
  
  return result.createContactCommunication;
}

async function testCreateContactActivity() {
  console.log('\n🧪 Testing: Create Contact Activity');
  
  const query = `
    mutation CreateContactActivity($input: CreateContactActivityInput!) {
      createContactActivity(input: $input) {
        id
        contactId
        activityType
        description
        metadata
        createdAt
        contact {
          id
          firstName
          lastName
        }
      }
    }
  `;

  const variables = {
    input: {
      contactId: testContactId,
      activityType: 'MEETING_SCHEDULED',
      description: 'Scheduled follow-up meeting for next week',
      metadata: {
        meetingDate: '2025-07-26T10:00:00Z',
        duration: 60,
        location: 'Virtual'
      }
    }
  };

  const result = await graphqlRequest(query, variables);
  testActivityId = result.createContactActivity.id;
  
  console.log('✅ Contact activity created successfully');
  console.log(`   ID: ${testActivityId}`);
  console.log(`   Type: ${result.createContactActivity.activityType}`);
  console.log(`   Description: ${result.createContactActivity.description}`);
  
  return result.createContactActivity;
}

async function testEnhancedContactSearch() {
  console.log('\n🧪 Testing: Enhanced Contact Search and Filtering');
  
  const query = `
    query SearchContacts($filter: ContactFilterInput) {
      contacts(filter: $filter, first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            email
            phone
            role
            isPrimary
            lastContactedAt
            contactFrequency
            customer {
              id
              name
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
  console.log(`   ✅ Found ${searchResult.contacts.totalCount} contacts with name 'John'`);

  // Test filter by role
  console.log('   🔍 Testing filter by role...');
  const roleResult = await graphqlRequest(query, {
    filter: { role: 'CEO' }
  });
  console.log(`   ✅ Found ${roleResult.contacts.totalCount} contacts with role 'CEO'`);

  // Test filter by primary contact
  console.log('   🔍 Testing filter by primary contact...');
  const primaryResult = await graphqlRequest(query, {
    filter: { isPrimary: true }
  });
  console.log(`   ✅ Found ${primaryResult.contacts.totalCount} primary contacts`);

  // Test filter by has email
  console.log('   🔍 Testing filter by has email...');
  const emailResult = await graphqlRequest(query, {
    filter: { hasEmail: true }
  });
  console.log(`   ✅ Found ${emailResult.contacts.totalCount} contacts with email`);

  return { searchResult, roleResult, primaryResult, emailResult };
}

async function testContactCommunications() {
  console.log('\n🧪 Testing: Contact Communications');
  
  const query = `
    query GetContactCommunications($contactId: ID, $filter: ContactCommunicationFilterInput) {
      contactCommunications(contactId: $contactId, filter: $filter, first: 10) {
        edges {
          node {
            id
            type
            subject
            content
            direction
            status
            channel
            duration
            scheduledAt
            createdAt
            contact {
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

  // Get all communications for the contact
  const result = await graphqlRequest(query, {
    contactId: testContactId
  });
  
  console.log(`✅ Found ${result.contactCommunications.totalCount} communications for contact`);
  
  // Test filter by type
  const typeResult = await graphqlRequest(query, {
    contactId: testContactId,
    filter: { type: 'EMAIL' }
  });
  console.log(`   ✅ Found ${typeResult.contactCommunications.totalCount} email communications`);

  return { result, typeResult };
}

async function testContactActivities() {
  console.log('\n🧪 Testing: Contact Activities');
  
  const query = `
    query GetContactActivities($contactId: ID) {
      contactActivities(contactId: $contactId, first: 10) {
        edges {
          node {
            id
            activityType
            description
            metadata
            createdAt
            contact {
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

  const result = await graphqlRequest(query, {
    contactId: testContactId
  });
  
  console.log(`✅ Found ${result.contactActivities.totalCount} activities for contact`);
  
  if (result.contactActivities.edges.length > 0) {
    const activity = result.contactActivities.edges[0].node;
    console.log(`   Latest activity: ${activity.activityType} - ${activity.description}`);
  }

  return result;
}

async function testContactManagementOperations() {
  console.log('\n🧪 Testing: Contact Management Operations');
  
  // Test set primary contact
  console.log('   🔧 Testing set primary contact...');
  const setPrimaryQuery = `
    mutation SetPrimaryContact($contactId: ID!) {
      setPrimaryContact(contactId: $contactId) {
        id
        firstName
        lastName
        isPrimary
        updatedAt
      }
    }
  `;
  
  const primaryResult = await graphqlRequest(setPrimaryQuery, {
    contactId: testContactId
  });
  console.log(`   ✅ Contact set as primary: ${primaryResult.setPrimaryContact.isPrimary}`);

  // Test update last contacted
  console.log('   🔧 Testing update last contacted...');
  const updateContactedQuery = `
    mutation UpdateContactLastContacted($contactId: ID!) {
      updateContactLastContacted(contactId: $contactId) {
        id
        firstName
        lastName
        lastContactedAt
        updatedAt
      }
    }
  `;
  
  const contactedResult = await graphqlRequest(updateContactedQuery, {
    contactId: testContactId
  });
  console.log(`   ✅ Last contacted updated: ${contactedResult.updateContactLastContacted.lastContactedAt}`);

  return { primaryResult, contactedResult };
}

async function testUpdateContact() {
  console.log('\n🧪 Testing: Update Contact');
  
  const query = `
    mutation UpdateContact($id: ID!, $input: UpdateContactInput!) {
      updateContact(id: $id, input: $input) {
        id
        firstName
        lastName
        email
        phone
        role
        isPrimary
        notes
        contactFrequency
        lastContactedAt
        updatedAt
      }
    }
  `;

  const variables = {
    id: testContactId,
    input: {
      firstName: 'John Updated',
      lastName: 'Doe Updated',
      email: 'john.updated@testcompany.com',
      phone: '+1-555-0125',
      role: 'CEO & Founder',
      notes: 'Updated contact information',
      contactFrequency: 'MONTHLY'
    }
  };

  const result = await graphqlRequest(query, variables);
  
  console.log('✅ Contact updated successfully');
  console.log(`   Name: ${result.updateContact.firstName} ${result.updateContact.lastName}`);
  console.log(`   Role: ${result.updateContact.role}`);
  console.log(`   Email: ${result.updateContact.email}`);
  
  return result.updateContact;
}

async function testGetContactWithRelations() {
  console.log('\n🧪 Testing: Get Contact with Relations');
  
  const query = `
    query GetContact($id: ID!) {
      contact(id: $id) {
        id
        firstName
        lastName
        email
        phone
        role
        isPrimary
        notes
        lastContactedAt
        contactFrequency
        createdAt
        updatedAt
        customer {
          id
          name
          type
          status
        }
        communications {
          id
          type
          subject
          direction
          status
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

  const result = await graphqlRequest(query, { id: testContactId });
  
  console.log('✅ Contact retrieved with all relations');
  console.log(`   Name: ${result.contact.firstName} ${result.contact.lastName}`);
  console.log(`   Customer: ${result.contact.customer.name}`);
  console.log(`   Communications: ${result.contact.communications.length}`);
  console.log(`   Activities: ${result.contact.activities.length}`);
  
  return result.contact;
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting BUS-3 Contact Management API Tests');
  console.log('=' .repeat(60));
  
  try {
    // Create test data
    await testCreateCustomer();
    await testCreateContact();
    await testCreateContactCommunication();
    await testCreateContactActivity();
    
    // Test enhanced features
    await testEnhancedContactSearch();
    await testContactCommunications();
    await testContactActivities();
    await testContactManagementOperations();
    await testUpdateContact();
    await testGetContactWithRelations();
    
    console.log('\n🎉 All BUS-3 Contact Management tests completed successfully!');
    console.log('=' .repeat(60));
    console.log('✅ Contact communication history working');
    console.log('✅ Contact activity tracking working');
    console.log('✅ Enhanced contact search and filtering working');
    console.log('✅ Contact role management working');
    console.log('✅ Contact management operations working');
    
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
  testCreateContact,
  testCreateContactCommunication,
  testCreateContactActivity,
  testEnhancedContactSearch,
  testContactCommunications,
  testContactActivities,
  testContactManagementOperations,
  testUpdateContact,
  testGetContactWithRelations
}; 