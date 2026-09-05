export class ApiError extends Error {
  constructor(public statusCode: number, public message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `/api/v1${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    
    throw new ApiError(
      response.status, 
      errorData?.error?.message || 'An unexpected error occurred',
      errorData
    );
  }

  return response.json();
};
