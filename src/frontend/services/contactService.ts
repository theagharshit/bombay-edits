import { ApiClient } from './apiClient';
import { ContactSubmissionDTO } from '@/backend/types/api';

export interface ContactResponseData {
  submissionId: string;
  status: string;
  createdAt: string;
}

export interface ContactTicketRecord {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  orderNumber?: string;
  status: 'new' | 'in_progress' | 'replied' | 'resolved';
  createdAt: string;
}

export class ContactService {
  public static async submit(data: ContactSubmissionDTO): Promise<ContactResponseData> {
    return ApiClient.post<ContactResponseData>('/api/contact', data);
  }

  public static async getTickets(params?: { email?: string }): Promise<ContactTicketRecord[]> {
    const query = params?.email
      ? `?email=${encodeURIComponent(params.email.toLowerCase().trim())}`
      : '';
    return ApiClient.get<ContactTicketRecord[]>(`/api/contact${query}`);
  }
}
