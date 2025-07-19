import client from './apollo-client';

export function makeClient() {
  return client;
}

// For server-side queries, we'll use the client directly
export const getClient = () => client;