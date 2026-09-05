import { ApiClient } from './apiClient';
import { ContactSubmissionDTO } from '@/backend/types/api';

export interface ContactResponseData {
  submissionId: string;
  status: string;
  createdAt: string;
}

export class ContactService {
  public static async submit(data: ContactSubmissionDTO): Promise<ContactResponseData> {
    return ApiClient.post<ContactResponseData>('/api/contact', data);
  }
}
