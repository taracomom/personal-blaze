import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { Snippet, Folder, ImageAsset } from '@/shared/types';
import { DATABASE_NAME, USER_DATA_DIR } from '@/shared/constants';

export class DatabaseService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    const userDataPath = path.join(os.homedir(), USER_DATA_DIR);
    this.dbPath = path.join(userDataPath, DATABASE_NAME);
  }

  async initialize(): Promise<void> {
    try {
      // Ensure user data directory exists
      const userDataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }

      // Open database connection
      this.db = new Database(this.dbPath);
      
      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');
      
      // Create tables
      await this.createTables();
      
      // Insert default data if needed
      await this.insertDefaultData();
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Folders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES folders (id)
      )
    `);

    // Snippets table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS snippets (
        id TEXT PRIMARY KEY,
        trigger TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        variables TEXT, -- JSON string
        folder_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (folder_id) REFERENCES folders (id)
      )
    `);

    // Images table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        blob BLOB,
        file_path TEXT,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Snippet-Image associations
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS snippet_images (
        snippet_id TEXT,
        image_id TEXT,
        PRIMARY KEY (snippet_id, image_id),
        FOREIGN KEY (snippet_id) REFERENCES snippets (id) ON DELETE CASCADE,
        FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_snippets_trigger ON snippets (trigger);
      CREATE INDEX IF NOT EXISTS idx_snippets_folder ON snippets (folder_id);
      CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders (parent_id);
    `);
  }

  private async insertDefaultData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if we already have data
    const snippetCount = this.db.prepare('SELECT COUNT(*) as count FROM snippets').get() as { count: number };
    
    if (snippetCount.count === 0) {
      // Insert default snippets
      const insertSnippet = this.db.prepare(`
        INSERT INTO snippets (id, trigger, content, variables)
        VALUES (?, ?, ?, ?)
      `);

      const defaultSnippets = [
        {
          id: 'default-1',
          trigger: 'sig',
          content: 'Best regards,\\n{formtext:name}\\n{formtext:title}',
          variables: JSON.stringify({
            name: { type: 'formtext', label: 'Your Name', defaultValue: '' },
            title: { type: 'formtext', label: 'Your Title', defaultValue: '' }
          })
        },
        {
          id: 'default-2',
          trigger: 'date',
          content: '{= now() }',
          variables: null
        },
        {
          id: 'default-3',
          trigger: 'addr',
          content: '{formtext:street}\\n{formtext:city}, {formtext:state} {formtext:zip}',
          variables: JSON.stringify({
            street: { type: 'formtext', label: 'Street Address' },
            city: { type: 'formtext', label: 'City' },
            state: { type: 'formtext', label: 'State' },
            zip: { type: 'formtext', label: 'ZIP Code' }
          })
        }
      ];

      for (const snippet of defaultSnippets) {
        insertSnippet.run(snippet.id, snippet.trigger, snippet.content, snippet.variables);
      }

      console.log('Inserted default snippets');
    }
  }

  // Snippet operations
  async createSnippet(snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Snippet> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO snippets (id, trigger, content, variables, folder_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      snippet.trigger,
      snippet.content,
      snippet.variables ? JSON.stringify(snippet.variables) : null,
      snippet.folderId || null,
      now,
      now
    );

    return this.getSnippetById(id)!;
  }

  async getSnippetById(id: string): Promise<Snippet | null> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM snippets WHERE id = ?
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.mapSnippetRow(row);
  }

  async getSnippetByTrigger(trigger: string): Promise<Snippet | null> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM snippets WHERE trigger = ?
    `);
    
    const row = stmt.get(trigger) as any;
    if (!row) return null;

    return this.mapSnippetRow(row);
  }

  async getAllSnippets(): Promise<Snippet[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM snippets ORDER BY updated_at DESC
    `);
    
    const rows = stmt.all() as any[];
    return rows.map(row => this.mapSnippetRow(row));
  }

  async updateSnippet(id: string, updates: Partial<Snippet>): Promise<Snippet | null> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const setClause = [];
    const values = [];

    if (updates.trigger !== undefined) {
      setClause.push('trigger = ?');
      values.push(updates.trigger);
    }
    
    if (updates.content !== undefined) {
      setClause.push('content = ?');
      values.push(updates.content);
    }
    
    if (updates.variables !== undefined) {
      setClause.push('variables = ?');
      values.push(updates.variables ? JSON.stringify(updates.variables) : null);
    }
    
    if (updates.folderId !== undefined) {
      setClause.push('folder_id = ?');
      values.push(updates.folderId);
    }

    setClause.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE snippets SET ${setClause.join(', ')} WHERE id = ?
    `);

    const result = stmt.run(...values);
    
    if (result.changes === 0) return null;
    return this.getSnippetById(id);
  }

  async deleteSnippet(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM snippets WHERE id = ?');
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  // Folder operations
  async createFolder(folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Folder> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO folders (id, name, parent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, folder.name, folder.parentId || null, now, now);

    return this.getFolderById(id)!;
  }

  async getFolderById(id: string): Promise<Folder | null> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM folders WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return null;
    
    return this.mapFolderRow(row);
  }

  async getAllFolders(): Promise<Folder[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM folders ORDER BY name');
    const rows = stmt.all() as any[];
    
    return rows.map(row => this.mapFolderRow(row));
  }

  // Helper methods
  private mapSnippetRow(row: any): Snippet {
    return {
      id: row.id,
      trigger: row.trigger,
      content: row.content,
      variables: row.variables ? JSON.parse(row.variables) : undefined,
      folderId: row.folder_id || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapFolderRow(row: any): Folder {
    return {
      id: row.id,
      name: row.name,
      parentId: row.parent_id || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}