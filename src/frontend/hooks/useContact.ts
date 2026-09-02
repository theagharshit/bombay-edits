import { useState, useCallback } from 'react';
import { ContactService } from '../services/contactService';
import { ContactSubmissionDTO } from '@/backend/types/api';

export interface UseContactReturn {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  message: string | null;
  submitContact: (data: ContactSubmissionDTO) => Promise<boolean>;
  reset: () => void;
}

export function useContact(): UseContactReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
    setMessage(null);
  }, []);

  const submitContact = useCallback(async (data: ContactSubmissionDTO): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await ContactService.submit(data);
      setIsSuccess(true);
      setMessage('Your message has been sent successfully. We will get back to you shortly.');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    isSuccess,
    error,
    message,
    submitContact,
    reset,
  };
}
