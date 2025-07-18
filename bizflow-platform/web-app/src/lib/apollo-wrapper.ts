import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc';
import client from './apollo-client';

export const { getClient, query } = registerApolloClient(() => client);

export function makeClient() {
  return client;
}