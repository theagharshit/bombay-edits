import { ApiClient } from './apiClient';
import { ContactSubmissionDTO } from '@/backend/types/api';

export class ContactService {
  public static async submit(data: ContactSubmissionDTO): Promise<{ submissionId: string }> {
    return ApiClient.post<{ submissionId: string }>('/api/contact', data);
  }
}
