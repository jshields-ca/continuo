'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { makeClient } from './apollo-wrapper';

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const client = makeClient();
  
  return (
    <BaseApolloProvider client={client}>
      {children}
    </BaseApolloProvider>
  );
}