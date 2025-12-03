import { NextResponse } from 'next/server';

export interface ErrorResponse {
  error: string;
  code: string;
  details?: any[];
  timestamp?: string;
}

// Validation errors (400)
export function createValidationError(details: any[]): NextResponse {
  return NextResponse.json({
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details,
    timestamp: new Date().toISOString(),
  }, { status: 400 });
}

// Authentication errors (401)
export function createAuthError(message: string = 'Authentication required'): NextResponse {
  return NextResponse.json({
    error: message,
    code: 'AUTH_ERROR',
    timestamp: new Date().toISOString(),
  }, { status: 401 });
}

// Forbidden errors (403)
export function createForbiddenError(message: string = 'Access denied'): NextResponse {
  return NextResponse.json({
    error: message,
    code: 'FORBIDDEN_ERROR',
    timestamp: new Date().toISOString(),
  }, { status: 403 });
}

// Not found errors (404)
export function createNotFoundError(message: string = 'Resource not found'): NextResponse {
  return NextResponse.json({
    error: message,
    code: 'NOT_FOUND_ERROR',
    timestamp: new Date().toISOString(),
  }, { status: 404 });
}

// Conflict errors (409)
export function createConflictError(message: string = 'Resource conflict'): NextResponse {
  return NextResponse.json({
    error: message,
    code: 'CONFLICT_ERROR',
    timestamp: new Date().toISOString(),
  }, { status: 409 });
}

// Rate limit errors (429)
export function createRateLimitError(message: string = 'Too many requests. Please try again later.'): NextResponse {
  return NextResponse.json({
    error: message,
    code: 'RATE_LIMIT_ERROR',
    timestamp: new Date().toISOString(),
  }, { status: 429 });
}

// Server errors (500)
export function createServerError(message: string = 'Internal server error'): NextResponse {
  return NextResponse.json({
    error: message,
    code: 'SERVER_ERROR',
    timestamp: new Date().toISOString(),
  }, { status: 500 });
}

// Bad request errors (400) - general
export function createBadRequestError(message: string = 'Bad request'): NextResponse {
  return NextResponse.json({
    error: message,
    code: 'BAD_REQUEST_ERROR',
    timestamp: new Date().toISOString(),
  }, { status: 400 });
}