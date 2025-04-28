import React, { useState, useEffect } from 'react';
import { IncidentProvider, useIncidents } from './context/IncidentContext';
import IncidentForm from './components/IncidentForm/IncidentForm';
import { IncidentList } from './components/IncidentList/IncidentList';
import styles from './styles/App.module.css';

const AppContent: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const { incidents } = useIncidents();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const toggleForm = (): void => {
    setIsFormOpen(!isFormOpen);
  };

  const handleFormSubmit = (): void => {
    setIsFormOpen(false);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>AI Safety Incident Dashboard</h1>
          <p>Track and manage AI safety incidents</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.reportButton}
            onClick={toggleForm}
          >
            {isFormOpen ? 'Close Form' : 'Report Incident'}
          </button>
          <button 
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>
      <main>
        <div className={`${styles.formContainer} ${isFormOpen ? styles.open : ''}`}>
          <div className={styles.formHeader}>
            <h2>Report New Incident</h2>
            <button 
              className={styles.closeButton}
              onClick={toggleForm}
              aria-label="Close form"
            >
              ×
            </button>
          </div>
          <IncidentForm onSubmit={handleFormSubmit} />
        </div>
        <IncidentList incidents={incidents} />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <IncidentProvider>
      <AppContent />
    </IncidentProvider>
  );
};

export default App;
