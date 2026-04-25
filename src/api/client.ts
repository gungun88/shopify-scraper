export type Platform =
  | 'Auto Detect'
  | 'Shopify'
  | 'Shopline'
  | 'Shoplazza'
  | 'Shopyy'
  | 'XShopyy'
  | 'Shoplus';

export type Status = 'queued' | 'running' | 'completed' | 'failed';

export interface ScrapeTask {
  id: string;
  url: string;
  platform: Platform;
  status: Status;
  progress: number;
  productsFound: number;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  price: string;
  sourceUrl: string;
  imageUrl: string;
  platform: Platform;
  variantsCount: number;
  category: string;
  scrapedAt: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const BASE_URL = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
      ...options,
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed',
      0,
    );
  }

  if (!response.ok) {
    let message = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const body = (await response.json()) as { error?: string; message?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      // Keep the fallback message when response body is not JSON.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError('Failed to parse JSON response', response.status);
  }
}

export const tasksApi = {
  createSingle(data: { urls: string[]; platform: string }): Promise<ScrapeTask> {
    return apiFetch<ScrapeTask>('/tasks/single', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createBatch(data: { url: string; platform: string; limit?: number }): Promise<ScrapeTask> {
    return apiFetch<ScrapeTask>('/tasks/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  list(): Promise<ScrapeTask[]> {
    return apiFetch<ScrapeTask[]>('/tasks');
  },

  get(id: string): Promise<ScrapeTask> {
    return apiFetch<ScrapeTask>(`/tasks/${encodeURIComponent(id)}`);
  },
};

export const productsApi = {
  list(page = 1, pageSize = 20): Promise<ProductListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    return apiFetch<ProductListResponse>(`/products?${params.toString()}`);
  },
};
