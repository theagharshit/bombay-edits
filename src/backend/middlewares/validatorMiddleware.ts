import { AppError } from './errorHandlerMiddleware';

export class Validator {
  public static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static requireFields<T extends Record<string, unknown>>(
    obj: T,
    requiredFields: (keyof T)[]
  ): void {
    const missing: string[] = [];
    for (const field of requiredFields) {
      const val = obj[field];
      if (val === undefined || val === null || val === '') {
        missing.push(String(field));
      }
    }

    if (missing.length > 0) {
      throw new AppError(
        `Missing required fields: ${missing.join(', ')}`,
        400,
        'VALIDATION_ERROR',
        { missingFields: missing }
      );
    }
  }

  public static validateEmail(email: string, fieldName = 'Email'): void {
    if (!email || !this.isEmail(email)) {
      throw new AppError(
        `A valid ${fieldName.toLowerCase()} address is required.`,
        400,
        'INVALID_EMAIL'
      );
    }
  }
}
