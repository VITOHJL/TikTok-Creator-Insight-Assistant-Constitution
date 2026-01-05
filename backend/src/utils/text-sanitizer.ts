/**
 * Text sanitization utilities for handling special characters
 * Per Edge Case: 特殊字符处理
 * 
 * This module provides functions to sanitize text input to prevent:
 * - JSON parsing errors
 * - API call failures
 * - Database storage issues
 * - Security vulnerabilities
 */

/**
 * Sanitize text for use in prompts and API calls
 * Removes or escapes characters that could break JSON parsing or API calls
 * 
 * @param text - The text to sanitize
 * @returns Sanitized text safe for use in prompts and API calls
 */
export function sanitizeForPrompt(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove control characters (except newlines and tabs)
  let sanitized = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize whitespace (preserve intentional newlines and spaces)
  // Replace multiple consecutive spaces with single space
  sanitized = sanitized.replace(/[ \t]+/g, ' ');
  
  // Replace multiple consecutive newlines with double newline
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  // Trim leading and trailing whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize text for JSON storage
 * Escapes special characters that could break JSON parsing
 * 
 * @param text - The text to sanitize
 * @returns Sanitized text safe for JSON storage
 */
export function sanitizeForJSON(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // First apply prompt sanitization
  let sanitized = sanitizeForPrompt(text);

  // Escape backslashes first (must be done before other escapes)
  sanitized = sanitized.replace(/\\/g, '\\\\');
  
  // Escape quotes (both single and double)
  sanitized = sanitized.replace(/"/g, '\\"');
  sanitized = sanitized.replace(/'/g, "\\'");

  // Escape newlines and tabs for JSON (optional, depends on use case)
  // For most cases, we want to preserve newlines in JSON strings
  // sanitized = sanitized.replace(/\n/g, '\\n');
  // sanitized = sanitized.replace(/\t/g, '\\t');

  return sanitized;
}

/**
 * Sanitize user input before storing or processing
 * Removes potentially dangerous characters while preserving content
 * 
 * @param text - The user input to sanitize
 * @returns Sanitized user input
 */
export function sanitizeUserInput(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove null bytes and other dangerous control characters
  let sanitized = text.replace(/\0/g, '');
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize line endings (convert Windows \r\n to \n)
  sanitized = sanitized.replace(/\r\n/g, '\n');
  sanitized = sanitized.replace(/\r/g, '\n');

  // Remove excessive whitespace
  sanitized = sanitized.replace(/[ \t]+/g, ' ');
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  // Trim
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Clean text extracted from AI responses
 * Removes markdown code blocks, extra whitespace, and formatting artifacts
 * 
 * @param text - The text extracted from AI response
 * @returns Cleaned text
 */
export function cleanAIResponse(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '');
  cleaned = cleaned.replace(/```\s*/g, '');
  cleaned = cleaned.replace(/`/g, '');

  // Remove leading/trailing whitespace from each line
  cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');

  // Normalize whitespace
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Trim
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Validate and sanitize text length
 * Ensures text doesn't exceed maximum length and handles truncation gracefully
 * 
 * @param text - The text to validate
 * @param maxLength - Maximum allowed length (default: 5000)
 * @param truncate - Whether to truncate if too long (default: false)
 * @returns Object with sanitized text and validation info
 */
export function validateAndSanitizeLength(
  text: string,
  maxLength: number = 5000,
  truncate: boolean = false
): { text: string; isValid: boolean; wasTruncated: boolean } {
  if (!text || typeof text !== 'string') {
    return { text: '', isValid: false, wasTruncated: false };
  }

  const sanitized = sanitizeUserInput(text);
  const isValid = sanitized.length <= maxLength;
  let finalText = sanitized;
  let wasTruncated = false;

  if (!isValid && truncate) {
    // Truncate at word boundary if possible
    const truncated = sanitized.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    finalText = lastSpace > maxLength * 0.8 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
    wasTruncated = true;
  }

  return {
    text: finalText,
    isValid: isValid || truncate,
    wasTruncated,
  };
}

