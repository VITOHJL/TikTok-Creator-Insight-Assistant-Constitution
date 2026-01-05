import sqlite3 from 'sqlite3';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

// Database file path
const DB_PATH = join(process.cwd(), 'dev-debug.db');

// Types
export interface Hook {
  id: string;
  text: string;
  isSelected: boolean;
}

export interface ContentPoint {
  id: string;
  title?: string;
  content: string;
  order: number;
  isExpanded?: boolean;
}

export interface ScriptOutline {
  style: string;
  title?: string;
  points: string[];
  description?: string;
  emotionalAnchors?: string[];
  memoryPoints?: string[];
  conflictDesign?: string;
  informationDensity?: string;
}

export interface CreationSession {
  id: string;
  userInput: string;
  currentStage: 1 | 2 | 3;
  hooks?: Hook[];  // Store generated hooks for stage 1 recovery
  selectedHook?: Hook | null;
  contentOutline?: ContentPoint[];
  generatedScripts?: ScriptOutline[];
  createdAt: string;
  updatedAt: string;
  interactionHistory?: any[];
}

// Create a new session
export async function createSession(userInput: string): Promise<CreationSession> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        logger.error('Failed to connect to database for session creation', { error: err.message });
        reject(new Error('Database connection failed'));
        return;
      }

      const sessionId = randomUUID();
      const now = new Date().toISOString();
      const session: CreationSession = {
        id: sessionId,
        userInput,
        currentStage: 1,
        createdAt: now,
        updatedAt: now,
      };

      db.run(
        `INSERT INTO creation_sessions 
         (id, user_input, current_stage, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [sessionId, userInput, 1, now, now],
        (err) => {
          db.close();
          if (err) {
            logger.error('Failed to create session', { error: err.message });
            reject(new Error('Failed to create session'));
            return;
          }
          logger.info('Session created', { sessionId, userInput });
          resolve(session);
        }
      );
    });
  });
}

// Get session by ID
export async function getSession(sessionId: string): Promise<CreationSession | null> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        logger.error('Failed to connect to database for session retrieval', { error: err.message });
        reject(new Error('Database connection failed'));
        return;
      }

      db.get(
        `SELECT * FROM creation_sessions WHERE id = ?`,
        [sessionId],
        (err, row: any) => {
          db.close();
          if (err) {
            logger.error('Failed to get session', { error: err.message, sessionId });
            reject(new Error('Failed to get session'));
            return;
          }

          if (!row) {
            resolve(null);
            return;
          }

          // Parse JSON fields
          const session: CreationSession = {
            id: row.id,
            userInput: row.user_input,
            currentStage: row.current_stage as 1 | 2 | 3,
            hooks: row.hooks ? JSON.parse(row.hooks) : undefined,
            selectedHook: row.selected_hook ? JSON.parse(row.selected_hook) : null,
            contentOutline: row.content_outline ? JSON.parse(row.content_outline) : undefined,
            generatedScripts: row.generated_scripts ? JSON.parse(row.generated_scripts) : undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            interactionHistory: row.interaction_history ? JSON.parse(row.interaction_history) : undefined,
          };

          resolve(session);
        }
      );
    });
  });
}

// Update session
export async function updateSession(
  sessionId: string,
  updates: Partial<{
    currentStage: 1 | 2 | 3;
    hooks: Hook[];
    selectedHook: Hook | null;
    contentOutline: ContentPoint[];
    generatedScripts: ScriptOutline[];
    interactionHistory: any[];
  }>
): Promise<CreationSession> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        logger.error('Failed to connect to database for session update', { error: err.message });
        reject(new Error('Database connection failed'));
        return;
      }

      const now = new Date().toISOString();
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.currentStage !== undefined) {
        fields.push('current_stage = ?');
        values.push(updates.currentStage);
      }
      if (updates.hooks !== undefined) {
        fields.push('hooks = ?');
        values.push(JSON.stringify(updates.hooks));
      }
      if (updates.selectedHook !== undefined) {
        fields.push('selected_hook = ?');
        values.push(updates.selectedHook ? JSON.stringify(updates.selectedHook) : null);
      }
      if (updates.contentOutline !== undefined) {
        fields.push('content_outline = ?');
        values.push(JSON.stringify(updates.contentOutline));
      }
      if (updates.generatedScripts !== undefined) {
        fields.push('generated_scripts = ?');
        values.push(JSON.stringify(updates.generatedScripts));
      }
      if (updates.interactionHistory !== undefined) {
        fields.push('interaction_history = ?');
        values.push(JSON.stringify(updates.interactionHistory));
      }

      fields.push('updated_at = ?');
      values.push(now);
      values.push(sessionId);

      db.run(
        `UPDATE creation_sessions SET ${fields.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) {
            db.close();
            logger.error('Failed to update session', { error: err.message, sessionId });
            reject(new Error('Failed to update session'));
            return;
          }

          // Get updated session
          getSession(sessionId)
            .then((session) => {
              if (!session) {
                reject(new Error('Session not found after update'));
                return;
              }
              resolve(session);
            })
            .catch(reject);
        }
      );
    });
  });
}

