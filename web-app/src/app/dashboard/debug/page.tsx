'use client';

import { useRequireAuth } from '@/lib/auth-context';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      fullName
      role
      status
      companyId
      company {
        id
        name
        slug
        subscriptionPlan
        status
      }
    }
  }
`;

export default function DebugPage() {
  const { user, loading } = useRequireAuth();
  const { data: meData, loading: meLoading, error: meError } = useQuery(ME_QUERY);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Information</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Status</h2>
          <div className="space-y-4">
            <div>
              <strong>Auth Loading:</strong> {loading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}
            </div>
            {user && (
              <div>
                <strong>User ID:</strong> {user.id}
              </div>
            )}
            <div>
              <strong>Token in localStorage:</strong> {typeof window !== 'undefined' && localStorage.getItem('authToken') ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">GraphQL ME Query</h2>
          <div className="space-y-4">
            <div>
              <strong>Query Loading:</strong> {meLoading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Query Error:</strong> {meError ? meError.message : 'None'}
            </div>
            <div>
              <strong>Query Data:</strong> {meData ? 'Received' : 'None'}
            </div>
            {meData && (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(meData, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <div>
              <strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}
            </div>
            <div>
              <strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'Not set'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 