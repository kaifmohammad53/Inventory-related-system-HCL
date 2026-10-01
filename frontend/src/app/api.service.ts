import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8081/api';

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });

    return this.parseJson<T>(response, `GET ${endpoint}`);
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data ?? {}),
    });

    return this.parseJson<T>(response, `POST ${endpoint}`);
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.parseJson<T>(response, `PUT ${endpoint}`);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.parseJson<T>(response, `DELETE ${endpoint}`);
  }

  private async parseJson<T>(response: Response, label: string): Promise<T> {
    if (!response.ok) {
      throw new Error(await this.readErrorMessage(response, `${label} failed: ${response.status}`));
    }

    return response.json();
  }

  private async readErrorMessage(response: Response, fallback: string): Promise<string> {
    try {
      const body = await response.json();
      if (body && typeof body.error === 'string' && body.error.trim()) {
        return body.error;
      }
    } catch {
      // Use the status fallback when the body is not JSON.
    }

    return fallback;
  }
}
