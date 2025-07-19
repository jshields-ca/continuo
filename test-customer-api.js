const { ApolloClient, InMemoryCache, gql, createHttpLink } = require('@apollo/client');
const { setContext } = require('@apollo/client/link/context');

// Create Apollo Client
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // You'll need to get a valid token from login first
  const token = 'your-jwt-token-here';
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

// Test queries and mutations
const CREATE_CUSTOMER = gql`
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

const GET_CUSTOMERS = gql`
  query GetCustomers($first: Int, $filter: CustomerFilterInput) {
    customers(first: $first, filter: $filter) {
      edges {
        node {
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
        cursor
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

const CREATE_CONTACT = gql`
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
      customer {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

async function testCustomerAPI() {
  try {
    console.log('🧪 Testing Customer API...\n');

    // Test 1: Create a customer
    console.log('1. Creating a test customer...');
    const createCustomerResult = await client.mutate({
      mutation: CREATE_CUSTOMER,
      variables: {
        input: {
          name: "Acme Corporation",
          type: "COMPANY",
          status: "ACTIVE",
          email: "info@acme.com",
          phone: "+1-555-0123",
          website: "https://acme.com",
          industry: "Technology",
          size: "51-200",
          annualRevenue: 5000000.00,
          notes: "Test customer for API validation",
          tags: ["test", "technology", "enterprise"]
        }
      }
    });

    console.log('✅ Customer created successfully:');
    console.log(JSON.stringify(createCustomerResult.data.createCustomer, null, 2));

    const customerId = createCustomerResult.data.createCustomer.id;

    // Test 2: Get customers
    console.log('\n2. Fetching customers...');
    const getCustomersResult = await client.query({
      query: GET_CUSTOMERS,
      variables: {
        first: 10
      }
    });

    console.log('✅ Customers fetched successfully:');
    console.log(`Total customers: ${getCustomersResult.data.customers.totalCount}`);
    console.log(`First customer: ${getCustomersResult.data.customers.edges[0]?.node.name}`);

    // Test 3: Create a contact for the customer
    console.log('\n3. Creating a contact for the customer...');
    const createContactResult = await client.mutate({
      mutation: CREATE_CONTACT,
      variables: {
        input: {
          customerId: customerId,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@acme.com",
          phone: "+1-555-0124",
          role: "CEO",
          isPrimary: true,
          notes: "Primary contact for Acme Corporation"
        }
      }
    });

    console.log('✅ Contact created successfully:');
    console.log(JSON.stringify(createContactResult.data.createContact, null, 2));

    console.log('\n🎉 All tests passed! Customer API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach(err => {
        console.error('GraphQL Error:', err.message);
      });
    }
  }
}

// Note: You'll need to get a valid JWT token first by logging in
console.log('⚠️  Note: You need to update the JWT token in this script before running the tests.');
console.log('   You can get a token by logging in through the web interface or API.');

// Uncomment the line below to run the test (after updating the token)
// testCustomerAPI(); 