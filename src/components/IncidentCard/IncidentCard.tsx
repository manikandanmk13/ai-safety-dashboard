import React from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { Incident } from '../../types/incident';
import styles from './IncidentCard.module.css';

interface IncidentCardProps {
  incident: Incident;
  onClick: (incident: Incident) => void;
  onEdit?: (incident: Incident) => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onClick, onEdit }) => {
  const { deleteIncident } = useIncidents();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this incident?')) {
      deleteIncident(incident.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(incident);
    }
  };

  return (
    <div 
      className={styles.card}
      onClick={() => onClick(incident)}
      role="button"
      tabIndex={0}
      data-severity={incident.severity.toLowerCase()}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{incident.title}</h3>
        <div className={styles.actions}>
          {incident.userReported && (
            <>
              <button 
                className={styles.editButton}
                onClick={handleEdit}
                aria-label="Edit incident"
              >
                Edit
              </button>
              <button 
                className={styles.deleteButton}
                onClick={handleDelete}
                aria-label="Delete incident"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      <p className={styles.description}>{incident.description}</p>
      <div className={styles.metadata}>
        <span className={`${styles.severity} ${styles[incident.severity.toLowerCase()]}`}>
          {incident.severity}
        </span>
        <span className={styles.date}>
          {new Date(incident.reported_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default IncidentCard;
