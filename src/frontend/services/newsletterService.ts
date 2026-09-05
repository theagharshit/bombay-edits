import { ApiClient } from './apiClient';

export interface NewsletterSubscribePayload {
  email: string;
  source?: string;
}

export interface NewsletterSubscribeResponse {
  email: string;
  isNew: boolean;
}

export class NewsletterService {
  public static async subscribe(
    payload: NewsletterSubscribePayload
  ): Promise<NewsletterSubscribeResponse> {
    return ApiClient.post<NewsletterSubscribeResponse>('/api/newsletter', payload);
  }

  public static async unsubscribe(
    email: string
  ): Promise<{ email: string; unsubscribed: boolean }> {
    return ApiClient.delete<{ email: string; unsubscribed: boolean }>('/api/newsletter', { email });
  }
}
