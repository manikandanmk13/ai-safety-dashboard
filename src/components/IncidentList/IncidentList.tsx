import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Incident } from '../../types/incident';
import IncidentCard from '../IncidentCard/IncidentCard';
import { Modal } from '../Modal/Modal';
import { IncidentDetails } from '../IncidentDetails/IncidentDetails';
import IncidentForm from '../IncidentForm/IncidentForm';
import styles from './IncidentList.module.css';

interface IncidentListProps {
  incidents: Incident[];
}

export const IncidentList: React.FC<IncidentListProps> = ({ incidents }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'severity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [showControlsInSidebar, setShowControlsInSidebar] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const mainControlsRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (mainControlsRef.current) {
      const rect = mainControlsRef.current.getBoundingClientRect();
      const isVisible = rect.top > 0;
      setShowControlsInSidebar(!isVisible);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const filteredIncidents = useMemo(() => {
    return incidents
      .filter(incident => !selectedSeverity || incident.severity === selectedSeverity)
      .sort((a, b) => {
        if (sortBy === 'date') {
          return sortOrder === 'desc' 
            ? new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime()
            : new Date(a.reported_at).getTime() - new Date(b.reported_at).getTime();
        } else {
          const severityOrder = { high: 3, medium: 2, low: 1 };
          return sortOrder === 'desc'
            ? severityOrder[b.severity] - severityOrder[a.severity]
            : severityOrder[a.severity] - severityOrder[b.severity];
        }
      });
  }, [incidents, selectedSeverity, sortBy, sortOrder]);

  const handleCardClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleEdit = useCallback((incident: Incident) => {
    setEditingIncident(incident);
  }, []);

  const handleEditSubmit = useCallback(() => {
    setEditingIncident(null);
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingIncident(null);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex !== null && currentIndex < filteredIncidents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, filteredIncidents.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex !== null && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleCloseModal = useCallback(() => {
    setCurrentIndex(null);
  }, []);

  const stats = useMemo(() => {
    const total = incidents.length;
    const bySeverity = incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      bySeverity
    };
  }, [incidents]);

  const renderControls = useCallback(() => (
    <div className={styles.controls}>
      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${!selectedSeverity ? styles.active : ''}`}
          onClick={() => setSelectedSeverity(null)}
        >
          All
        </button>
        <button
          className={`${styles.filterButton} ${styles.high} ${selectedSeverity === 'high' ? styles.active : ''}`}
          onClick={() => setSelectedSeverity('high')}
        >
          High
        </button>
        <button
          className={`${styles.filterButton} ${styles.medium} ${selectedSeverity === 'medium' ? styles.active : ''}`}
          onClick={() => setSelectedSeverity('medium')}
        >
          Medium
        </button>
        <button
          className={`${styles.filterButton} ${styles.low} ${selectedSeverity === 'low' ? styles.active : ''}`}
          onClick={() => setSelectedSeverity('low')}
        >
          Low
        </button>
      </div>
      <div className={styles.sortControls}>
        <select
          className={styles.sortSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'severity')}
        >
          <option value="date">Date</option>
          <option value="severity">Severity</option>
        </select>
        <button
          className={styles.sortButton}
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  ), [selectedSeverity, sortBy, sortOrder]);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.statsContainer}>
          <h2 className={styles.statsTitle}>Incident Statistics</h2>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Incidents</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
          {Object.entries(stats.bySeverity).map(([severity, count]) => (
            <div key={severity} className={styles.statItem}>
              <span className={styles.statLabel}>{severity.charAt(0).toUpperCase() + severity.slice(1)}</span>
              <span className={styles.statValue}>{count}</span>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${styles[severity]}`}
                  style={{ width: `${(count / stats.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className={`${styles.controls} ${styles.sidebarControls} ${showControlsInSidebar ? styles.visible : ''}`}>
          {renderControls()}
        </div>
      </div>
      <div className={styles.mainContent}>
        <div 
          ref={mainControlsRef}
          className={`${styles.controls} ${styles.mainControls} ${!showControlsInSidebar ? styles.visible : ''}`}
        >
          {renderControls()}
        </div>
        <div className={styles.grid}>
          {filteredIncidents.map((incident, index) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onClick={() => handleCardClick(index)}
              onEdit={handleEdit}
            />
          ))}
        </div>
        {filteredIncidents.length === 0 && (
          <div className={styles.emptyState}>
            <h2>No incidents found</h2>
            <p className={styles.emptyStateSubtext}>
              Try adjusting your filters or create a new incident
            </p>
          </div>
        )}
      </div>
      <Modal
        isOpen={currentIndex !== null}
        onClose={handleCloseModal}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={currentIndex !== null && currentIndex < filteredIncidents.length - 1}
        hasPrevious={currentIndex !== null && currentIndex > 0}
      >
        {currentIndex !== null && (
          <IncidentDetails
            incident={filteredIncidents[currentIndex]}
          />
        )}
      </Modal>
      <Modal
        isOpen={editingIncident !== null}
        onClose={handleEditCancel}
      >
        {editingIncident && (
          <IncidentForm
            incidentToEdit={editingIncident}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
          />
        )}
      </Modal>
    </div>
  );
};
