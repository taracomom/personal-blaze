import { globalShortcut, clipboard } from 'electron';
import { DatabaseService } from './DatabaseService';
import { SNIPPET_TRIGGERS } from '@/shared/constants';

export class KeyboardHookService {
  private isListening = false;
  private currentInput = '';
  private inputTimer: NodeJS.Timeout | null = null;

  constructor(private databaseService: DatabaseService) {}

  async initialize(): Promise<void> {
    try {
      await this.setupGlobalHooks();
      this.isListening = true;
      console.log('Keyboard hook service initialized');
    } catch (error) {
      console.error('Failed to initialize keyboard hooks:', error);
      throw error;
    }
  }

  private async setupGlobalHooks(): Promise<void> {
    // Note: This is a simplified implementation
    // In a real implementation, we would need native modules for:
    // - Windows: SetWindowsHookEx with WH_KEYBOARD_LL
    // - macOS: CGEventTapCreate
    // For now, we'll use a basic approach that works in limited scenarios

    this.setupBasicTextCapture();
  }

  private setupBasicTextCapture(): void {
    // This is a placeholder implementation
    // Real implementation would require native keyboard hooks
    console.log('Setting up basic text capture (placeholder)');
    
    // TODO: Implement native keyboard hooks
    // For Windows: Use SetWindowsHookEx
    // For macOS: Use CGEventTapCreate
    // For Linux: Use X11 or Wayland hooks
  }

  private async handleTextInput(text: string): Promise<void> {
    if (!text.startsWith(SNIPPET_TRIGGERS.PREFIX)) {
      this.currentInput = '';
      return;
    }

    this.currentInput += text;
    
    // Reset timer
    if (this.inputTimer) {
      clearTimeout(this.inputTimer);
    }

    // Set timer to process input after a delay
    this.inputTimer = setTimeout(() => {
      this.processSnippetTrigger(this.currentInput);
      this.currentInput = '';
    }, 500);
  }

  private async processSnippetTrigger(input: string): Promise<void> {
    try {
      // Extract trigger from input (remove / prefix and any trailing spaces)
      const trigger = input.substring(1).trim();
      
      if (!trigger) return;

      // Look up snippet
      const snippet = await this.databaseService.getSnippetByTrigger(trigger);
      
      if (snippet) {
        await this.expandSnippet(snippet, input);
      }
    } catch (error) {
      console.error('Error processing snippet trigger:', error);
    }
  }

  private async expandSnippet(snippet: any, originalText: string): Promise<void> {
    try {
      // Replace the trigger text with the snippet content
      const expandedContent = await this.processSnippetContent(snippet.content, snippet.variables);
      
      // TODO: Implement proper text replacement
      // This would require:
      // 1. Detecting the current cursor position
      // 2. Selecting the trigger text
      // 3. Replacing it with the expanded content
      
      // For now, just copy to clipboard
      clipboard.writeText(expandedContent);
      
      console.log(`Expanded snippet '${snippet.trigger}' to clipboard`);
    } catch (error) {
      console.error('Error expanding snippet:', error);
    }
  }

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
        // Simple expression evaluation (extend as needed)
        if (expression.trim() === 'now()') {
          return new Date().toISOString();
        }
        return match;
      } catch {
        return match;
      }
    });

    return processedContent;
  }

  cleanup(): void {
    if (this.inputTimer) {
      clearTimeout(this.inputTimer);
    }
    
    globalShortcut.unregisterAll();
    this.isListening = false;
    console.log('Keyboard hook service cleaned up');
  }
}