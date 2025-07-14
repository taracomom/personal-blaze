import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSnippets } from '../hooks/useSnippets';
import { Snippet } from '@/shared/types';

export const Dashboard: React.FC = () => {
  const { snippets, loading, error, deleteSnippet } = useSnippets();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSnippets = snippets.filter(snippet =>
    snippet.trigger.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      await deleteSnippet(id);
    }
  };

  if (loading) {
    return <div>Loading snippets...</div>;
  }

  if (error) {
    return <div>Error loading snippets: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Your Snippets</h2>
        <Link to="/snippet/new" className="btn">
          Create New Snippet
        </Link>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {filteredSnippets.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p className="text-gray">
              {snippets.length === 0 
                ? "No snippets yet. Create your first snippet to get started!"
                : "No snippets match your search."}
            </p>
          </div>
        </div>
      ) : (
        <div className="snippet-list">
          {filteredSnippets.map((snippet) => (
            <SnippetCard 
              key={snippet.id} 
              snippet={snippet} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SnippetCardProps {
  snippet: Snippet;
  onDelete: (id: string) => void;
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet, onDelete }) => {
  const previewContent = snippet.content.length > 100 
    ? snippet.content.substring(0, 100) + '...'
    : snippet.content;

  return (
    <div className="snippet-item">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="snippet-trigger">/{snippet.trigger}</div>
          <div className="snippet-content">{previewContent}</div>
          <div className="text-sm text-gray mt-2">
            Updated {snippet.updatedAt.toLocaleDateString()}
          </div>
        </div>
        <div className="flex gap-2">
          <Link 
            to={`/snippet/${snippet.id}`}
            className="btn btn-small btn-secondary"
          >
            Edit
          </Link>
          <button 
            onClick={() => onDelete(snippet.id)}
            className="btn btn-small btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};