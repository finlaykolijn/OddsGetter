import React, { useState } from 'react';

interface AdminPanelProps {
  onBack: () => void;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');

  const handleApiCall = async (action: string) => {
    setLoading(true);
    setSelectedAction(action);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey || undefined,
        }),
      });

      const result: ApiResponse = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message || 'An error occurred' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to server' });
    } finally {
      setLoading(false);
      setSelectedAction('');
    }
  };

  const adminActions = [
    {
      id: 'update-odds',
      label: 'Update Odds Data',
      description: 'Fetch latest odds from the API and update the database',
      endpoint: 'update-odds'
    },
    {
      id: 'refresh-teams',
      label: 'Refresh Teams',
      description: 'Update the list of current Premier League teams',
      endpoint: 'refresh-teams'
    },
    {
      id: 'cleanup-old-data',
      label: 'Cleanup Old Data',
      description: 'Remove outdated odds and match data',
      endpoint: 'cleanup-old-data'
    },
    {
      id: 'check-api-usage',
      label: 'Check API Usage',
      description: 'Check remaining API requests and usage statistics',
      endpoint: 'check-api-usage'
    },
    {
      id: 'test-connection',
      label: 'Test Database Connection',
      description: 'Verify database connectivity and configuration',
      endpoint: 'test-connection'
    }
  ];

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🔧 Admin Panel</h2>
        <p>Database management and API operations</p>
      </div>

      <div className="admin-controls">
        <div className="api-key-section">
          <label htmlFor="apiKey">API Key (optional):</label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key for external operations"
            className="api-key-input"
          />
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="admin-actions">
          {adminActions.map((action) => (
            <div key={action.id} className="admin-action-card">
              <h3>{action.label}</h3>
              <p>{action.description}</p>
              <button
                onClick={() => handleApiCall(action.endpoint)}
                disabled={loading}
                className="admin-action-button"
              >
                {loading && selectedAction === action.endpoint ? 'Processing...' : 'Execute'}
              </button>
            </div>
          ))}
        </div>

        <div className="admin-info">
          <h3>⚠️ Important Notes</h3>
          <ul>
            <li>API operations may take several minutes to complete</li>
            <li>Some operations require a valid API key</li>
            <li>Database updates are irreversible</li>
            <li>Check API usage before running multiple operations</li>
          </ul>
        </div>
      </div>

      <button onClick={onBack} className="back-button">
        ← Back to Main App
      </button>
    </div>
  );
};

export default AdminPanel; 