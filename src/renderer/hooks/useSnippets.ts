import { useState, useEffect } from 'react';
import { Snippet, APIResponse } from '@/shared/types';
import { API_ENDPOINTS } from '@/shared/constants';

export const useSnippets = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:9876${API_ENDPOINTS.SNIPPETS}`);
      const result: APIResponse<Snippet[]> = await response.json();
      
      if (result.success && result.data) {
        // Convert date strings to Date objects
        const processedSnippets = result.data.map(snippet => ({
          ...snippet,
          createdAt: new Date(snippet.createdAt),
          updatedAt: new Date(snippet.updatedAt)
        }));
        setSnippets(processedSnippets);
      } else {
        setError(result.error || 'Failed to fetch snippets');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch snippets');
    } finally {
      setLoading(false);
    }
  };

  const createSnippet = async (snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`http://localhost:9876${API_ENDPOINTS.SNIPPETS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snippetData),
      });
      
      const result: APIResponse<Snippet> = await response.json();
      
      if (result.success && result.data) {
        const newSnippet = {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt)
        };
        setSnippets(prev => [newSnippet, ...prev]);
        return newSnippet;
      } else {
        throw new Error(result.error || 'Failed to create snippet');
      }
    } catch (err) {
      throw err;
    }
  };

  const updateSnippet = async (id: string, updates: Partial<Snippet>) => {
    try {
      const response = await fetch(`http://localhost:9876${API_ENDPOINTS.SNIPPETS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const result: APIResponse<Snippet> = await response.json();
      
      if (result.success && result.data) {
        const updatedSnippet = {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt)
        };
        setSnippets(prev => prev.map(snippet => 
          snippet.id === id ? updatedSnippet : snippet
        ));
        return updatedSnippet;
      } else {
        throw new Error(result.error || 'Failed to update snippet');
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteSnippet = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:9876${API_ENDPOINTS.SNIPPETS}/${id}`, {
        method: 'DELETE',
      });
      
      const result: APIResponse = await response.json();
      
      if (result.success) {
        setSnippets(prev => prev.filter(snippet => snippet.id !== id));
      } else {
        throw new Error(result.error || 'Failed to delete snippet');
      }
    } catch (err) {
      throw err;
    }
  };

  const getSnippetById = async (id: string): Promise<Snippet | null> => {
    try {
      const response = await fetch(`http://localhost:9876${API_ENDPOINTS.SNIPPETS}/${id}`);
      const result: APIResponse<Snippet> = await response.json();
      
      if (result.success && result.data) {
        return {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt)
        };
      }
      
      return null;
    } catch (err) {
      console.error('Failed to fetch snippet:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  return {
    snippets,
    loading,
    error,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    getSnippetById,
    refetch: fetchSnippets,
  };
};