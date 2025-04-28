import React from 'react';
import { Incident } from '../../types/incident';
import { formatDate } from '../../utils/dateUtils';
import styles from './IncidentDetails.module.css';

interface IncidentDetailsProps {
  incident: Incident;
}

export const IncidentDetails: React.FC<IncidentDetailsProps> = ({ incident }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'var(--low-severity)';
      case 'medium':
        return 'var(--medium-severity)';
      case 'high':
        return 'var(--high-severity)';
      default:
        return 'var(--text-color)';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.metadata}>
          <span 
            className={styles.severity}
            style={{ backgroundColor: getSeverityColor(incident.severity) }}
          >
            {incident.severity}
          </span>
          <span className={styles.date}>
            Reported on {formatDate(incident.reported_at)}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>{incident.title}</h1>
        <p className={styles.description}>{incident.description}</p>
      </div>
    </div>
  );
}; 