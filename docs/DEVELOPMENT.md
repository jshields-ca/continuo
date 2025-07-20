# Continuo Development Guide

> **Note**: "Continuo" is a placeholder name and may not reflect the final chosen name for the software.

## Overview

This guide provides comprehensive information for developers working on the Continuo platform, including setup, architecture, coding standards, and best practices.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Docker** and Docker Compose
- **Git**
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - GraphQL
  - Prisma
  - Tailwind CSS IntelliSense

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd continuo
   ```

2. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

3. **Install dependencies** (if developing locally)
   ```bash
   npm run install:all
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec api npm run db:migrate
   ```

5. **Seed the database**
   ```bash
   docker-compose exec api npm run db:seed
   ```

6. **Access the application**
   - **Web App**: http://localhost:3000
   - **API**: http://localhost:4000/graphql
   - **Database Admin**: http://localhost:8080

## 🏗️ Architecture Overview

### Backend Architecture

```
api/
├── src/
│   ├── graphql/           # GraphQL layer
│   │   ├── context.js     # Request context
│   │   ├── resolvers/     # Query/Mutation resolvers
│   │   └── typeDefs/      # Schema definitions
│   ├── shared/            # Shared utilities
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Helper functions
│   └── index.js           # Server entry point
├── prisma/                # Database layer
│   └── schema.prisma      # Database schema
└── database/              # Database utilities
    └── seeds/             # Seed data
```

### Frontend Architecture

```
web-app/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   └── lib/               # Utilities and configs
│       ├── graphql/       # GraphQL queries/mutations
│       ├── apollo-*.ts    # Apollo Client setup
│       └── auth-context.tsx # Authentication context
```

## 🔧 Development Workflow

### 1. Database Changes

When modifying the database schema:

1. **Update Prisma schema**
   ```bash
   # Edit api/prisma/schema.prisma
   ```

2. **Create migration**
   ```bash
   docker-compose exec api npx prisma migrate dev --name descriptive-name
   ```

3. **Update GraphQL schema** (if needed)
   ```bash
   # Edit api/src/graphql/typeDefs/
   ```

4. **Update resolvers** (if needed)
   ```bash
   # Edit api/src/graphql/resolvers/
   ```

5. **Update frontend queries** (if needed)
   ```bash
   # Edit web-app/src/lib/graphql/
   ```

### 2. Adding New Features

#### Backend Feature

1. **Create GraphQL types**
   ```javascript
   // api/src/graphql/typeDefs/feature.js
   const { gql } = require('apollo-server-express');
   
   const featureTypeDefs = gql`
     type Feature {
       id: ID!
       name: String!
       description: String
       createdAt: DateTime!
     }
   
     extend type Query {
       features: [Feature!]!
       feature(id: ID!): Feature
     }
   
     extend type Mutation {
       createFeature(input: CreateFeatureInput!): Feature!
       updateFeature(id: ID!, input: UpdateFeatureInput!): Feature!
       deleteFeature(id: ID!): Boolean!
     }
   
     input CreateFeatureInput {
       name: String!
       description: String
     }
   
     input UpdateFeatureInput {
       name: String
       description: String
     }
   `;
   
   module.exports = { featureTypeDefs };
   ```

2. **Create resolvers**
   ```javascript
   // api/src/graphql/resolvers/feature.js
   const { UserInputError } = require('apollo-server-express');
   
   const featureResolvers = {
     Query: {
       features: async (parent, args, { user, prisma, requireAuth }) => {
         const currentUser = requireAuth();
         return await prisma.feature.findMany({
           where: { companyId: currentUser.companyId }
         });
       },
       
       feature: async (parent, { id }, { user, prisma, requireAuth }) => {
         const currentUser = requireAuth();
         return await prisma.feature.findFirst({
           where: { 
             id,
             companyId: currentUser.companyId 
           }
         });
       },
     },
   
     Mutation: {
       createFeature: async (parent, { input }, { user, prisma, requireAuth }) => {
         const currentUser = requireAuth();
         return await prisma.feature.create({
           data: {
             ...input,
             companyId: currentUser.companyId
           }
         });
       },
       
       updateFeature: async (parent, { id, input }, { user, prisma, requireAuth }) => {
         const currentUser = requireAuth();
         return await prisma.feature.update({
           where: { 
             id,
             companyId: currentUser.companyId 
           },
           data: input
         });
       },
       
       deleteFeature: async (parent, { id }, { user, prisma, requireAuth }) => {
         const currentUser = requireAuth();
         await prisma.feature.delete({
           where: { 
             id,
             companyId: currentUser.companyId 
           }
         });
         return true;
       },
     },
   };
   
   module.exports = { featureResolvers };
   ```

3. **Register in index files**
   ```javascript
   // api/src/graphql/typeDefs/index.js
   const { featureTypeDefs } = require('./feature');
   
   const typeDefs = [
     baseTypes,
     authTypeDefs,
     userTypeDefs,
     companyTypeDefs,
     featureTypeDefs, // Add this
   ];
   ```

   ```javascript
   // api/src/graphql/resolvers/index.js
   const { featureResolvers } = require('./feature');
   
   const resolvers = [
     authResolvers,
     userResolvers,
     companyResolvers,
     featureResolvers, // Add this
   ];
   ```

#### Frontend Feature

1. **Create GraphQL queries/mutations**
   ```typescript
   // web-app/src/lib/graphql/queries.ts
   export const GET_FEATURES = gql`
     query GetFeatures {
       features {
         id
         name
         description
         createdAt
       }
     }
   `;
   
   export const GET_FEATURE = gql`
     query GetFeature($id: ID!) {
       feature(id: $id) {
         id
         name
         description
         createdAt
       }
     }
   `;
   ```

   ```typescript
   // web-app/src/lib/graphql/mutations.ts
   export const CREATE_FEATURE = gql`
     mutation CreateFeature($input: CreateFeatureInput!) {
       createFeature(input: $input) {
         id
         name
         description
         createdAt
       }
     }
   `;
   
   export const UPDATE_FEATURE = gql`
     mutation UpdateFeature($id: ID!, $input: UpdateFeatureInput!) {
       updateFeature(id: $id, input: $input) {
         id
         name
         description
         updatedAt
       }
     }
   `;
   
   export const DELETE_FEATURE = gql`
     mutation DeleteFeature($id: ID!) {
       deleteFeature(id: $id)
     }
   `;
   ```

2. **Create React components**
   ```typescript
   // web-app/src/app/features/page.tsx
   'use client';
   
   import { useQuery, useMutation } from '@apollo/client';
   import { GET_FEATURES, DELETE_FEATURE } from '@/lib/graphql/queries';
   
   export default function FeaturesPage() {
     const { data, loading, error } = useQuery(GET_FEATURES);
     const [deleteFeature] = useMutation(DELETE_FEATURE);
   
     if (loading) return <div>Loading...</div>;
     if (error) return <div>Error: {error.message}</div>;
   
     return (
       <div>
         <h1>Features</h1>
         {data.features.map((feature) => (
           <div key={feature.id}>
             <h3>{feature.name}</h3>
             <p>{feature.description}</p>
           </div>
         ))}
       </div>
     );
   }
   ```

### 3. Testing

#### Backend Testing

```javascript
// api/tests/feature.test.js
const { gql } = require('apollo-server-express');
const { createTestClient } = require('apollo-server-testing');
const { server } = require('../src/index');

describe('Feature Resolvers', () => {
  it('should create a feature', async () => {
    const { mutate } = createTestClient(server);
    
    const CREATE_FEATURE = gql`
      mutation CreateFeature($input: CreateFeatureInput!) {
        createFeature(input: $input) {
          id
          name
          description
        }
      }
    `;
    
    const result = await mutate({
      mutation: CREATE_FEATURE,
      variables: {
        input: {
          name: 'Test Feature',
          description: 'Test Description'
        }
      }
    });
    
    expect(result.data.createFeature.name).toBe('Test Feature');
  });
});
```

#### Frontend Testing

```typescript
// web-app/src/app/features/__tests__/page.test.tsx
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import FeaturesPage from '../page';
import { GET_FEATURES } from '@/lib/graphql/queries';

const mocks = [
  {
    request: {
      query: GET_FEATURES,
    },
    result: {
      data: {
        features: [
          {
            id: '1',
            name: 'Test Feature',
            description: 'Test Description',
            createdAt: '2025-07-19T00:00:00Z',
          },
        ],
      },
    },
  },
];

describe('FeaturesPage', () => {
  it('renders features', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <FeaturesPage />
      </MockedProvider>
    );
    
    expect(await screen.findByText('Test Feature')).toBeInTheDocument();
  });
});
```

## 📝 Coding Standards

### JavaScript/TypeScript

#### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProfile`)

#### Code Style

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};

// ❌ Bad
interface user_profile {
  ID: string;
  first_name: string;
  last_name: string;
  EMAIL: string;
}

const GetUserProfile = async (user_id: string) => {
  const response = await fetch(`/api/users/${user_id}`);
  return response.json();
};
```

#### GraphQL Standards

```graphql
# ✅ Good - Clear, descriptive names
type User {
  id: ID!
  email: String!
  firstName: String!
  lastName: String!
  fullName: String!
  role: UserRole!
  status: UserStatus!
  company: Company!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# ❌ Bad - Unclear, inconsistent naming
type user {
  user_id: ID!
  user_email: String!
  first_name: String!
  last_name: String!
  user_role: String!
  created_at: DateTime!
}
```

### CSS/Tailwind

#### Component Styling

```tsx
// ✅ Good - Consistent, readable
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
  <div className="flex items-center space-x-3">
    <Avatar className="h-10 w-10" />
    <div>
      <h3 className="text-sm font-medium text-gray-900">
        {user.fullName}
      </h3>
      <p className="text-sm text-gray-500">{user.email}</p>
    </div>
  </div>
  <Button variant="outline" size="sm">
    Edit
  </Button>
</div>

// ❌ Bad - Inconsistent, hard to read
<div className="flex justify-between p-4 bg-white rounded shadow border">
  <div className="flex items-center">
    <Avatar className="h-10 w-10" />
    <div className="ml-3">
      <h3>{user.fullName}</h3>
      <p>{user.email}</p>
    </div>
  </div>
  <button>Edit</button>
</div>
```

## 🔒 Security Best Practices

### Authentication & Authorization

1. **Always validate user permissions**
   ```javascript
   // ✅ Good
   const currentUser = requireAuth();
   if (currentUser.companyId !== targetUser.companyId) {
     throw new ForbiddenError('Access denied');
   }
   ```

2. **Use role-based access control**
   ```javascript
   // ✅ Good
   const currentUser = requireRole(['OWNER', 'ADMIN']);
   ```

3. **Validate input data**
   ```javascript
   // ✅ Good
   if (!validateEmail(input.email)) {
     throw new UserInputError('Invalid email format');
   }
   ```

### Data Protection

1. **Never expose sensitive data**
   ```javascript
   // ✅ Good
   const user = await prisma.user.findUnique({
     where: { id },
     select: {
       id: true,
       email: true,
       firstName: true,
       lastName: true,
       // password: false - Never select password
     }
   });
   ```

2. **Use environment variables**
   ```javascript
   // ✅ Good
   const jwtSecret = process.env.JWT_SECRET;
   const dbUrl = process.env.DATABASE_URL;
   ```

## 🐛 Debugging

### Backend Debugging

1. **Check logs**
   ```bash
   docker-compose logs api -f
   ```

2. **Use GraphQL Playground**
   - Visit http://localhost:4000/graphql
   - Test queries and mutations interactively

3. **Database debugging**
   ```bash
   # Access database directly
   docker-compose exec postgres psql -U postgres -d bizflow_dev
   
   # View Prisma Studio
   docker-compose exec api npx prisma studio
   ```

### Frontend Debugging

1. **Browser DevTools**
   - Network tab for API calls
   - Console for errors
   - React DevTools for component state

2. **Apollo Client DevTools**
   - Install Apollo Client DevTools extension
   - Monitor GraphQL queries and cache

3. **TypeScript errors**
   ```bash
   cd web-app
   npm run type-check
   ```

## 🚀 Performance Optimization

### Backend Optimization

1. **Database queries**
   ```javascript
   // ✅ Good - Single query with includes
   const user = await prisma.user.findUnique({
     where: { id },
     include: { company: true }
   });
   
   // ❌ Bad - N+1 queries
   const user = await prisma.user.findUnique({ where: { id } });
   const company = await prisma.company.findUnique({ 
     where: { id: user.companyId } 
   });
   ```

2. **Caching**
   ```javascript
   // Use Redis for caching
   const cached = await redis.get(`user:${id}`);
   if (cached) return JSON.parse(cached);
   ```

### Frontend Optimization

1. **Code splitting**
   ```typescript
   // ✅ Good - Lazy load components
   const LazyComponent = lazy(() => import('./LazyComponent'));
   ```

2. **GraphQL optimization**
   ```typescript
   // ✅ Good - Only fetch needed fields
   const { data } = useQuery(gql`
     query GetUser($id: ID!) {
       user(id: $id) {
         id
         firstName
         lastName
         # Don't fetch unnecessary fields
       }
     }
   `);
   ```

## 📚 Resources

### Documentation
- [GraphQL Documentation](https://graphql.org/learn/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools
- [GraphQL Playground](http://localhost:4000/graphql)
- [Prisma Studio](http://localhost:5555)
- [Database Admin](http://localhost:8080)

### Testing
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Apollo Client Testing](https://www.apollographql.com/docs/react/development-testing/testing/)

---

*Last updated: July 19, 2025* 