import sqlite3 from 'sqlite3';
import { join } from 'path';
import { existsSync } from 'fs';
import { logger } from './logger.js';
import { GenerationResult } from '../types/index.js';

// Prompt version - update this when modifying prompts to improve results
const PROMPT_VERSION = process.env.PROMPT_VERSION || 'v1.0';

// Database file path
const DB_PATH = join(process.cwd(), 'dev-debug.db');

// Check if database is enabled
export function isDatabaseEnabled(): boolean {
  const enabled = process.env.ENABLE_DATABASE === 'true' || 
                  (process.env.NODE_ENV === 'development' && process.env.ENABLE_DATABASE !== 'false');
  return enabled;
}

// Initialize database
export async function initializeDatabase(): Promise<boolean> {
  if (!isDatabaseEnabled()) {
    logger.info('Database is disabled');
    return false;
  }

  return new Promise((resolve) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        logger.warn('Failed to connect to database', { error: err.message });
        resolve(false);
        return;
      }

      // Create table
      db.run(`
        CREATE TABLE IF NOT EXISTS api_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          prompt TEXT NOT NULL,
          model TEXT NOT NULL,
          prompt_version TEXT NOT NULL,
          scripts TEXT NOT NULL,
          hashtags TEXT NOT NULL,
          music_style TEXT NOT NULL,
          response_time INTEGER NOT NULL,
          status TEXT NOT NULL,
          error_message TEXT
        )
      `, (err) => {
        if (err) {
          logger.warn('Failed to create table', { error: err.message });
          db.close();
          resolve(false);
          return;
        }

        // Create indexes
        db.run('CREATE INDEX IF NOT EXISTS idx_timestamp ON api_logs(timestamp)', () => {});
        db.run('CREATE INDEX IF NOT EXISTS idx_status ON api_logs(status)', () => {});
        db.run('CREATE INDEX IF NOT EXISTS idx_prompt_version ON api_logs(prompt_version)', () => {});

        db.close((err) => {
          if (err) {
            logger.warn('Failed to close database after initialization', { error: err.message });
          }
          logger.info('Database initialized successfully', { path: DB_PATH, promptVersion: PROMPT_VERSION });
          resolve(true);
        });
      });
    });
  });
}

// Log API request/response
export async function logRequest(
  prompt: string,
  model: string,
  result: GenerationResult | null,
  responseTime: number,
  status: 'success' | 'failed',
  errorMessage?: string
): Promise<void> {
  if (!isDatabaseEnabled()) {
    return;
  }

  // Don't block the main flow - run asynchronously
  setImmediate(() => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        // Silently fail - don't log to avoid spam
        return;
      }

      const timestamp = new Date().toISOString();
      const scripts = result ? JSON.stringify(result.scripts) : '[]';
      const hashtags = result ? JSON.stringify(result.hashtags) : '[]';
      const musicStyle = result ? JSON.stringify(result.musicStyle) : '{}';

      db.run(
        `INSERT INTO api_logs 
         (timestamp, prompt, model, prompt_version, scripts, hashtags, music_style, response_time, status, error_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [timestamp, prompt, model, PROMPT_VERSION, scripts, hashtags, musicStyle, responseTime, status, errorMessage || null],
        (err) => {
          if (err) {
            // Silently fail - don't log to avoid spam
          }
          db.close();
        }
      );
    });
  });
}

// Get recent logs
export async function getRecentLogs(limit: number = 50): Promise<any[]> {
  if (!isDatabaseEnabled()) {
    return [];
  }

  return new Promise((resolve) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        logger.warn('Failed to connect to database for query', { error: err.message });
        resolve([]);
        return;
      }

      db.all(
        `SELECT * FROM api_logs ORDER BY timestamp DESC LIMIT ?`,
        [limit],
        (err, rows) => {
          db.close();
          if (err) {
            logger.warn('Failed to query logs', { error: err.message });
            resolve([]);
            return;
          }
          resolve(rows || []);
        }
      );
    });
  });
}

// Get logs by prompt version
export async function getLogsByVersion(version: string, limit: number = 50): Promise<any[]> {
  if (!isDatabaseEnabled()) {
    return [];
  }

  return new Promise((resolve) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        logger.warn('Failed to connect to database for query', { error: err.message });
        resolve([]);
        return;
      }

      db.all(
        `SELECT * FROM api_logs WHERE prompt_version = ? ORDER BY timestamp DESC LIMIT ?`,
        [version, limit],
        (err, rows) => {
          db.close();
          if (err) {
            logger.warn('Failed to query logs by version', { error: err.message });
            resolve([]);
            return;
          }
          resolve(rows || []);
        }
      );
    });
  });
}

// Get current prompt version
export function getPromptVersion(): string {
  return PROMPT_VERSION;
}

