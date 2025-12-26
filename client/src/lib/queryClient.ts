import { QueryClient } from "@tanstack/react-query";

// Create a default fetch function that works with our backend
export const apiRequest = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Check if response is actually JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    // If we get HTML instead of JSON, it means API route wasn't matched
    const text = await response.text();
    console.error('Expected JSON but got:', text.substring(0, 100));
    throw new Error('API endpoint returned HTML instead of JSON - check server routing');
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => {
        const [url] = queryKey as [string, ...unknown[]];
        return apiRequest(url);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});