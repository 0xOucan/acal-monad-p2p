import { GraphQLClient } from "graphql-request";

// Environment-aware endpoint configuration
const ENVIO_GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_ENVIO_ENDPOINT ||
  (process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_ENVIO_PRODUCTION_URL || "https://envio-production-endpoint.herokuapp.com/v1/graphql"
    : "http://localhost:8080/v1/graphql");

export const graphqlClient = new GraphQLClient(ENVIO_GRAPHQL_ENDPOINT, {
  headers: {
    "Content-Type": "application/json",
  },
});

// Error handling wrapper for GraphQL requests
export async function executeGraphQLQuery<T>(query: string, variables?: Record<string, any>, retries = 2): Promise<T> {
  try {
    return await graphqlClient.request<T>(query, variables);
  } catch (error) {
    console.error("GraphQL request failed:", error);

    if (retries > 0) {
      console.log(`Retrying GraphQL request... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return executeGraphQLQuery<T>(query, variables, retries - 1);
    }

    // If all retries failed, return empty/default data structure to prevent UI crashes
    console.warn("GraphQL request failed after retries, returning fallback data");
    throw new Error("Failed to fetch data from indexer. Please try again later.");
  }
}
