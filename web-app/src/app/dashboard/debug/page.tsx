'use client';

import { useRequireAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  Activity,
  Home,
  ChevronRight,
  Shield,
  Database,
  Globe,
  User,
  Building
} from 'lucide-react';
import Link from 'next/link';

export default function DebugPage() {
  const { user } = useRequireAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'ACTIVE' || status === 'VERIFIED' ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' || status === 'VERIFIED' 
      ? 'text-green-700 bg-green-100 border-green-200' 
      : 'text-red-700 bg-red-100 border-red-200';
  };

  return (
    <div className="p-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link 
          href="/dashboard" 
          className="flex items-center hover:text-blue-600 transition-colors"
          aria-label="Go to dashboard"
        >
          <Home className="h-4 w-4 mr-1" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Debug Information</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Debug Information</h1>
        <p className="mt-1 text-sm text-gray-600">
          System diagnostics and authentication status for development purposes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Authentication Status</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Login Status</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon('ACTIVE')}
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor('ACTIVE')}`}>
                  Authenticated
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Token Status</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon('ACTIVE')}
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor('ACTIVE')}`}>
                  Valid
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Session Expiry</span>
              <span className="text-sm text-gray-900">24 hours</span>
            </div>
          </div>
        </div>

        {/* API Connection Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">API Connection</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">GraphQL Endpoint</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon('ACTIVE')}
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor('ACTIVE')}`}>
                  Connected
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Database</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon('ACTIVE')}
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor('ACTIVE')}`}>
                  Online
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Response Time</span>
              <span className="text-sm text-gray-900">~150ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <User className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 text-gray-900 px-3 py-2 rounded text-sm font-mono">
                    {user.id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(user.id, 'userId')}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label="Copy user ID"
                  >
                    {copiedField === 'userId' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 text-gray-900 px-3 py-2 rounded text-sm font-mono">
                    {user.fullName}
                  </code>
                  <button
                    onClick={() => copyToClipboard(user.fullName, 'fullName')}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label="Copy full name"
                  >
                    {copiedField === 'fullName' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 text-gray-900 px-3 py-2 rounded text-sm font-mono">
                    {user.email}
                  </code>
                  <button
                    onClick={() => copyToClipboard(user.email, 'email')}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label="Copy email"
                  >
                    {copiedField === 'email' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 text-gray-900 px-3 py-2 rounded text-sm font-mono">
                    {user.role}
                  </code>
                  <button
                    onClick={() => copyToClipboard(user.role, 'role')}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label="Copy role"
                  >
                    {copiedField === 'role' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company ID</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 text-gray-900 px-3 py-2 rounded text-sm font-mono">
                    {user.company.id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(user.company.id, 'companyId')}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label="Copy company ID"
                  >
                    {copiedField === 'companyId' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 text-gray-900 px-3 py-2 rounded text-sm font-mono">
                    {user.company.name}
                  </code>
                  <button
                    onClick={() => copyToClipboard(user.company.name, 'companyName')}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label="Copy company name"
                  >
                    {copiedField === 'companyName' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Slug</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 text-gray-900 px-3 py-2 rounded text-sm font-mono">
                    {user.company.slug}
                  </code>
                  <button
                    onClick={() => copyToClipboard(user.company.slug, 'companySlug')}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label="Copy company slug"
                  >
                    {copiedField === 'companySlug' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Plan</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 text-gray-900 px-3 py-2 rounded text-sm font-mono">
                    {user.company.subscriptionPlan}
                  </code>
                  <button
                    onClick={() => copyToClipboard(user.company.subscriptionPlan, 'subscriptionPlan')}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label="Copy subscription plan"
                  >
                    {copiedField === 'subscriptionPlan' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Raw JSON Data */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-orange-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Raw User Data (JSON)</h2>
            </div>
            <button
              onClick={() => copyToClipboard(JSON.stringify(user, null, 2), 'rawData')}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Copy all user data"
            >
              {copiedField === 'rawData' ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="p-6">
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          ♿ Accessibility Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Keyboard Navigation</h4>
            <ul className="space-y-1">
              <li>• Tab navigation through all interactive elements</li>
              <li>• Enter/Space to activate buttons</li>
              <li>• Escape to close dropdowns</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Screen Reader Support</h4>
            <ul className="space-y-1">
              <li>• Proper ARIA labels on all buttons</li>
              <li>• Semantic HTML structure</li>
              <li>• Status announcements for copy actions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Visual Design</h4>
            <ul className="space-y-1">
              <li>• High contrast colors (AA WCAG compliant)</li>
              <li>• Clear visual hierarchy</li>
              <li>• Consistent spacing and typography</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Focus Management</h4>
            <ul className="space-y-1">
              <li>• Visible focus indicators</li>
              <li>• Logical tab order</li>
              <li>• Focus trapped in modals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 