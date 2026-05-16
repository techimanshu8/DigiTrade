// Logger utility
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: string, meta?: Record<string, unknown>) {
    console.log(JSON.stringify({
      level: 'INFO',
      context: this.context,
      message,
      ...meta,
      timestamp: new Date().toISOString(),
    }));
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>) {
    console.error(JSON.stringify({
      level: 'ERROR',
      context: this.context,
      message,
      error: error?.message,
      stack: error?.stack,
      ...meta,
      timestamp: new Date().toISOString(),
    }));
  }

  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(JSON.stringify({
      level: 'WARN',
      context: this.context,
      message,
      ...meta,
      timestamp: new Date().toISOString(),
    }));
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(JSON.stringify({
        level: 'DEBUG',
        context: this.context,
        message,
        ...meta,
        timestamp: new Date().toISOString(),
      }));
    }
  }
}

// Error utility
export class ApiException extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

export class ValidationException extends ApiException {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', 400, message, details);
    this.name = 'ValidationException';
  }
}

export class UnauthorizedException extends ApiException {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', 401, message);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends ApiException {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', 403, message);
    this.name = 'ForbiddenException';
  }
}

export class NotFoundException extends ApiException {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with id ${identifier} not found`
      : `${resource} not found`;
    super('NOT_FOUND', 404, message);
    this.name = 'NotFoundException';
  }
}

export class ConflictException extends ApiException {
  constructor(message: string) {
    super('CONFLICT', 409, message);
    this.name = 'ConflictException';
  }
}

// Date utilities
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

export function isExpired(expiryDate: Date): boolean {
  return expiryDate < new Date();
}

// String utilities
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length - 3) + '...';
}

// Email utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone utilities
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Number utilities
export function roundToDecimals(num: number, decimals: number = 2): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Object utilities
export function omit<T extends Record<string, unknown>>(
  obj: T,
  keysToOmit: string[],
): Partial<T> {
  const result = { ...obj };
  keysToOmit.forEach((key) => {
    delete result[key as keyof T];
  });
  return result;
}

export function pick<T extends Record<string, unknown>>(
  obj: T,
  keysToPick: string[],
): Partial<T> {
  const result = {} as Partial<T>;
  keysToPick.forEach((key) => {
    if (key in obj) {
      result[key as keyof T] = obj[key as keyof T];
    }
  });
  return result;
}

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const output = { ...target };
  Object.keys(source).forEach((key) => {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      output[key as keyof T] = deepMerge(
        output[key as keyof T] as Record<string, unknown>,
        source[key] as Record<string, unknown>,
      ) as T[keyof T];
    } else {
      output[key as keyof T] = source[key] as T[keyof T];
    }
  });
  return output;
}

// Retry utility
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delayMs?: number } = {},
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000 } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// Pagination utilities
export function getPaginationParams(page: number = 1, pageSize: number = 10) {
  const skip = (Math.max(page, 1) - 1) * pageSize;
  return {
    skip,
    take: pageSize,
  };
}

export function getPaginationMeta(
  total: number,
  page: number = 1,
  pageSize: number = 10,
) {
  return {
    total,
    page: Math.max(page, 1),
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
