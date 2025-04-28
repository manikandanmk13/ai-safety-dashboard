import React, { createContext, useState, useCallback, useMemo } from 'react';
import { Incident, Severity, SortOrder } from '../types/incident';
import { mockIncidents } from '../data/incidents';

interface IncidentContextType {
  incidents: Incident[];
  filteredIncidents: Incident[];
  filterBySeverity: (severity: Severity | 'All') => void;
  sortByDate: (order: SortOrder) => void;
  addIncident: (incident: Omit<Incident, 'id'>) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [filteredSeverity, setFilteredSeverity] = useState<Severity | 'All'>('All');

  const filterBySeverity = useCallback((severity: Severity | 'All') => {
    setFilteredSeverity(severity);
  }, []);

  const sortByDate = useCallback((order: SortOrder) => {
    const sorted = [...incidents].sort((a, b) => {
      const dateA = new Date(a.reported_at).getTime();
      const dateB = new Date(b.reported_at).getTime();
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
    setIncidents(sorted);
  }, [incidents]);

  const addIncident = useCallback((incident: Omit<Incident, 'id'>) => {
    const newIncident: Incident = {
      ...incident,
      id: Date.now().toString(),
      userReported: true,
    };
    setIncidents(prev => [...prev, newIncident]);
  }, []);

  const updateIncident = useCallback((id: string, updates: Partial<Incident>) => {
    setIncidents(prev => 
      prev.map(incident => 
        incident.id === id ? { ...incident, ...updates } : incident
      )
    );
  }, []);

  const deleteIncident = useCallback((id: string) => {
    setIncidents(prev => prev.filter(incident => incident.id !== id));
  }, []);

  const filteredIncidents = useMemo(() => {
    return filteredSeverity === 'All' 
      ? incidents 
      : incidents.filter(incident => incident.severity === filteredSeverity);
  }, [incidents, filteredSeverity]);

  const value = {
    incidents,
    filteredIncidents,
    filterBySeverity,
    sortByDate,
    addIncident,
    updateIncident,
    deleteIncident,
  };

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = React.useContext(IncidentContext);
  if (context === undefined) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
