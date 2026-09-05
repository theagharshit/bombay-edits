import { useState, useCallback } from 'react';
import { NewsletterService, NewsletterSubscribePayload } from '../services/newsletterService';

export interface UseNewsletterReturn {
  isLoading: boolean;
  isSuccess: boolean;
  isAlreadySubscribed: boolean;
  isUnsubscribed: boolean;
  error: string | null;
  message: string | null;
  subscribe: (payload: string | NewsletterSubscribePayload) => Promise<boolean>;
  unsubscribe: (email: string) => Promise<boolean>;
  reset: () => void;
}

export function useNewsletter(): UseNewsletterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsSuccess(false);
    setIsAlreadySubscribed(false);
    setIsUnsubscribed(false);
    setError(null);
    setMessage(null);
  }, []);

  const subscribe = useCallback(
    async (payload: string | NewsletterSubscribePayload): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      setMessage(null);
      setIsUnsubscribed(false);

      const data = typeof payload === 'string' ? { email: payload } : payload;

      try {
        const response = await NewsletterService.subscribe(data);
        setIsSuccess(true);
        if (!response.isNew) {
          setIsAlreadySubscribed(true);
          setMessage('You are already subscribed to our newsletter.');
        } else {
          setMessage('Thank you for subscribing to The Bombay Edit.');
        }
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to subscribe. Please try again.';
        setError(msg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const unsubscribe = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setIsAlreadySubscribed(false);

    try {
      await NewsletterService.unsubscribe(email.trim());
      setIsSuccess(true);
      setIsUnsubscribed(true);
      setMessage('You have been unsubscribed from the newsletter.');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to unsubscribe. Please try again.';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    isSuccess,
    isAlreadySubscribed,
    isUnsubscribed,
    error,
    message,
    subscribe,
    unsubscribe,
    reset,
  };
}
