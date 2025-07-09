// API Client -  (Type-safe & DRY!)
import { ApiResponse } from './types';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Generic CRUD methods
  async list<T>(resource: string, params?: Record<string, any>): Promise<ApiResponse<T[]>> {
    const searchParams = new URLSearchParams(params);
    return this.request(`/${resource}?${searchParams}`);
  }

  async get<T>(resource: string, id: string): Promise<ApiResponse<T>> {
    return this.request(`/${resource}/${id}`);
  }

  async create<T>(resource: string, data: any): Promise<ApiResponse<T>> {
    return this.request(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update<T>(resource: string, id: string, data: any): Promise<ApiResponse<T>> {
    return this.request(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(resource: string, id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/${resource}/${id}`, {
      method: 'DELETE',
    });
  }

  // Specific resource methods (type-safe!)
  issues = {
    list: (params?: any) => this.list('issues', params),
    get: (id: string) => this.get('issues', id),
    create: (data: any) => this.create('issues', data),
    update: (id: string, data: any) => this.update('issues', id, data),
    delete: (id: string) => this.delete('issues', id),
  };

  projects = {
    list: (params?: any) => this.list('projects', params),
    get: (id: string) => this.get('projects', id),
    create: (data: any) => this.create('projects', data),
    update: (id: string, data: any) => this.update('projects', id, data),
    delete: (id: string) => this.delete('projects', id),
  };

  teams = {
    list: (params?: any) => this.list('teams', params),
    get: (id: string) => this.get('teams', id),
    create: (data: any) => this.create('teams', data),
    update: (id: string, data: any) => this.update('teams', id, data),
    delete: (id: string) => this.delete('teams', id),
  };
}

export const api = new ApiClient(); 