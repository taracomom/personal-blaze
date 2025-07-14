import express from 'express';
import * as http from 'http';
import * as path from 'path';
import { DatabaseService } from './DatabaseService';
import { API_ENDPOINTS } from '@/shared/constants';
import { APIResponse, Snippet, Folder } from '@/shared/types';

export class APIServer {
  private app: express.Application;
  private server: http.Server | null = null;
  private port: number = 0;

  constructor(private databaseService: DatabaseService) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS for local development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Serve static files (React app)
    const staticPath = path.join(__dirname, '../renderer');
    this.app.use(express.static(staticPath));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Snippet routes
    this.app.get(API_ENDPOINTS.SNIPPETS, this.getSnippets.bind(this));
    this.app.post(API_ENDPOINTS.SNIPPETS, this.createSnippet.bind(this));
    this.app.get(`${API_ENDPOINTS.SNIPPETS}/:id`, this.getSnippet.bind(this));
    this.app.put(`${API_ENDPOINTS.SNIPPETS}/:id`, this.updateSnippet.bind(this));
    this.app.delete(`${API_ENDPOINTS.SNIPPETS}/:id`, this.deleteSnippet.bind(this));

    // Folder routes
    this.app.get(API_ENDPOINTS.FOLDERS, this.getFolders.bind(this));
    this.app.post(API_ENDPOINTS.FOLDERS, this.createFolder.bind(this));

    // Expansion route
    this.app.post(API_ENDPOINTS.EXPAND, this.expandSnippet.bind(this));

    // Settings routes
    this.app.get(API_ENDPOINTS.SETTINGS, this.getSettings.bind(this));
    this.app.put(API_ENDPOINTS.SETTINGS, this.updateSettings.bind(this));

    // Serve React app for all other routes
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../renderer/index.html'));
    });

    // Error handling
    this.app.use(this.errorHandler.bind(this));
  }

  // Snippet handlers
  private async getSnippets(req: express.Request, res: express.Response): Promise<void> {
    try {
      const snippets = await this.databaseService.getAllSnippets();
      const response: APIResponse<Snippet[]> = {
        success: true,
        data: snippets
      };
      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to get snippets');
    }
  }

  private async createSnippet(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { trigger, content, variables, folderId } = req.body;
      
      if (!trigger || !content) {
        res.status(400).json({
          success: false,
          error: 'Trigger and content are required'
        });
        return;
      }

      const snippet = await this.databaseService.createSnippet({
        trigger,
        content,
        variables,
        folderId
      });

      const response: APIResponse<Snippet> = {
        success: true,
        data: snippet
      };
      res.status(201).json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to create snippet');
    }
  }

  private async getSnippet(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { id } = req.params;
      const snippet = await this.databaseService.getSnippetById(id);
      
      if (!snippet) {
        res.status(404).json({
          success: false,
          error: 'Snippet not found'
        });
        return;
      }

      const response: APIResponse<Snippet> = {
        success: true,
        data: snippet
      };
      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to get snippet');
    }
  }

  private async updateSnippet(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const snippet = await this.databaseService.updateSnippet(id, updates);
      
      if (!snippet) {
        res.status(404).json({
          success: false,
          error: 'Snippet not found'
        });
        return;
      }

      const response: APIResponse<Snippet> = {
        success: true,
        data: snippet
      };
      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to update snippet');
    }
  }

  private async deleteSnippet(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.databaseService.deleteSnippet(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Snippet not found'
        });
        return;
      }

      const response: APIResponse = {
        success: true
      };
      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to delete snippet');
    }
  }

  // Folder handlers
  private async getFolders(req: express.Request, res: express.Response): Promise<void> {
    try {
      const folders = await this.databaseService.getAllFolders();
      const response: APIResponse<Folder[]> = {
        success: true,
        data: folders
      };
      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to get folders');
    }
  }

  private async createFolder(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { name, parentId } = req.body;
      
      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Folder name is required'
        });
        return;
      }

      const folder = await this.databaseService.createFolder({
        name,
        parentId
      });

      const response: APIResponse<Folder> = {
        success: true,
        data: folder
      };
      res.status(201).json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to create folder');
    }
  }

  // Expansion handler
  private async expandSnippet(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { text, variables } = req.body;
      
      if (!text || !text.startsWith('/')) {
        res.status(400).json({
          success: false,
          error: 'Invalid expansion text'
        });
        return;
      }

      const trigger = text.substring(1).trim();
      const snippet = await this.databaseService.getSnippetByTrigger(trigger);
      
      if (!snippet) {
        res.status(404).json({
          success: false,
          error: 'Snippet not found'
        });
        return;
      }

      const expandedContent = await this.processSnippetContent(snippet.content, variables || snippet.variables);
      
      const response: APIResponse<{ content: string; snippet: Snippet }> = {
        success: true,
        data: {
          content: expandedContent,
          snippet
        }
      };
      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to expand snippet');
    }
  }

  // Settings handlers
  private async getSettings(req: express.Request, res: express.Response): Promise<void> {
    try {
      // TODO: Implement settings persistence
      const settings = {
        globalShortcut: 'CommandOrControl+Shift+/',
        autoStart: true,
        serverPort: this.port,
        databaseEncryption: false
      };

      const response: APIResponse = {
        success: true,
        data: settings
      };
      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to get settings');
    }
  }

  private async updateSettings(req: express.Request, res: express.Response): Promise<void> {
    try {
      // TODO: Implement settings update
      const response: APIResponse = {
        success: true,
        data: req.body
      };
      res.json(response);
    } catch (error) {
      this.handleError(res, error, 'Failed to update settings');
    }
  }

  // Helper methods
  private async processSnippetContent(content: string, variables?: Record<string, any>): Promise<string> {
    let processedContent = content;

    // Process variables like {formtext:name}
    const variableRegex = /\{(\w+):([^}]+)\}/g;
    processedContent = processedContent.replace(variableRegex, (match, type, name) => {
      switch (type) {
        case 'formtext':
          return variables?.[name] || `[${name}]`;
        case 'date':
          return new Date().toLocaleDateString();
        case 'time':
          return new Date().toLocaleTimeString();
        default:
          return match;
      }
    });

    // Process expressions like {= now() }
    const expressionRegex = /\{=\s*([^}]+)\s*\}/g;
    processedContent = processedContent.replace(expressionRegex, (match, expression) => {
      try {
        const expr = expression.trim();
        if (expr === 'now()') {
          return new Date().toISOString();
        } else if (expr === 'date()') {
          return new Date().toLocaleDateString();
        } else if (expr === 'time()') {
          return new Date().toLocaleTimeString();
        }
        return match;
      } catch {
        return match;
      }
    });

    // Process escaped characters
    processedContent = processedContent.replace(/\\\\n/g, '\n');
    processedContent = processedContent.replace(/\\\\t/g, '\t');

    return processedContent;
  }

  private handleError(res: express.Response, error: any, message: string): void {
    console.error(message, error);
    res.status(500).json({
      success: false,
      error: message
    });
  }

  private errorHandler(error: any, req: express.Request, res: express.Response, next: express.NextFunction): void {
    console.error('Unhandled error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }

  async start(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, 'localhost', () => {
        this.port = port;
        console.log(`API server started on http://localhost:${port}`);
        resolve();
      });

      this.server.on('error', (error) => {
        reject(error);
      });
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
      console.log('API server stopped');
    }
  }
}