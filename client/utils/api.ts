// Utility function to safely handle fetch responses and avoid "body stream already read" errors
export const safeFetch = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
    });

    // Clone the response to avoid body stream issues
    const responseClone = response.clone();

    let data;
    const responseText = await responseClone.text();

    if (!response.ok) {
      console.error(`❌ HTTP ${response.status} for ${url}:`, responseText);
      throw new Error(
        `HTTP ${response.status}: ${responseText || "Request failed"}`,
      );
    }

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ JSON parse error for", url, ":", parseError);
      throw new Error("Invalid JSON response");
    }

    return data;
  } catch (error) {
    console.error(`❌ Fetch error for ${url}:`, error);
    throw error;
  }
};

// Specific utility for authenticated API calls
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return safeFetch(url, options);
};
