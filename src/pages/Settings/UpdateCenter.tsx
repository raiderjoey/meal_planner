import React, { useState, useEffect } from 'react';
import { useHousehold } from '../../contexts/HouseholdContext';
import { useSystemVersion } from '../../hooks/useSystemVersion';
import { checkForUpdates, applyUpdate, getLatestUpdateStatus, supabase } from '../../lib/supabase';
import { SystemUpdate } from '../../types/database';
import './UpdateCenter.css';

const UpdateCenter: React.FC = () => {
  const { profile } = useHousehold();
  const { version: currentVersion, loading: versionLoading } = useSystemVersion();
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  const [latestUpdate, setLatestUpdate] = useState<SystemUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const status = await getLatestUpdateStatus();
        setLatestUpdate(status);
      } catch (err: any) {
        console.error('Error fetching initial update data:', err);
      }
    };

    fetchInitialData();

    // Subscribe to system_updates changes
    const subscription = supabase
      .channel('system_updates_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_updates' }, async () => {
        const status = await getLatestUpdateStatus();
        setLatestUpdate(status);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCheckForUpdates = async () => {
    setChecking(true);
    setError(null);
    try {
      const data = await checkForUpdates();
      setLatestVersion(data.latestVersion);
      setUpdateAvailable(data.updateAvailable);
    } catch (err: any) {
      setError('Failed to check for updates: ' + err.message);
    } finally {
      setChecking(false);
    }
  };

  const handleApplyUpdate = async () => {
    if (!latestVersion || !profile) return;
    setApplying(true);
    setError(null);
    try {
      await applyUpdate(latestVersion, profile.id);
    } catch (err: any) {
      setError('Failed to apply update: ' + err.message);
      setApplying(false);
    }
  };

  useEffect(() => {
    if (latestUpdate?.status === 'completed' || latestUpdate?.status === 'failed') {
      setApplying(false);
    }
  }, [latestUpdate]);

  return (
    <div className="update-center">
      <header className="update-header">
        <h1>System Updates</h1>
        <p>Manage and monitor system software versions.</p>
      </header>

      <div className="update-card">
        <div className="version-info">
          <div className="version-item">
            <span className="label">Current Version</span>
            <span className="value">{versionLoading ? 'Loading...' : (currentVersion || 'Unknown')}</span>
          </div>
          {latestVersion && (
            <div className="version-item">
              <span className="label">Latest Version</span>
              <span className="value">{latestVersion}</span>
            </div>
          )}
        </div>

        {error && <div className="update-error">{error}</div>}

        <div className="update-actions">
          <button 
            className="btn-secondary" 
            onClick={handleCheckForUpdates} 
            disabled={checking || applying}
          >
            {checking ? 'Checking...' : 'Check for Updates'}
          </button>

          {updateAvailable && isAdmin && (
            <button 
              className="btn-primary" 
              onClick={handleApplyUpdate} 
              disabled={applying}
            >
              {applying ? 'Applying...' : `Apply Update ${latestVersion}`}
            </button>
          )}
        </div>

        {!isAdmin && updateAvailable && (
          <p className="admin-only-note">An update is available. Please contact an administrator to apply it.</p>
        )}
      </div>

      {latestUpdate && (
        <div className="update-status-card">
          <h3>Latest Update Status</h3>
          <div className={`status-badge ${latestUpdate.status}`}>
            {latestUpdate.status.replace('_', ' ')}
          </div>
          <div className="update-meta">
            <span>Target: {latestUpdate.target_version}</span>
            <span>Started: {new Date(latestUpdate.created_at).toLocaleString()}</span>
          </div>
          {latestUpdate.log_output && (
            <div className="log-container">
              <h4>Activity Log</h4>
              <pre>{latestUpdate.log_output}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UpdateCenter;
