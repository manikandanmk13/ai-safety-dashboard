import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { Incident, Severity } from '../../types/incident';
import styles from './IncidentForm.module.css';

interface IncidentFormProps {
  onSubmit?: () => void;
  incidentToEdit?: Incident;
  onCancel?: () => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ onSubmit, incidentToEdit, onCancel }) => {
  const { addIncident, updateIncident, incidents } = useIncidents();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'low' as Severity,
  });
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Initialize form with incident data if editing
  useEffect(() => {
    if (incidentToEdit) {
      setFormData({
        title: incidentToEdit.title,
        description: incidentToEdit.description,
        severity: incidentToEdit.severity,
      });
    }
  }, [incidentToEdit]);

  // Get unique titles from existing incidents and sort them lexicographically
  const existingTitles = useMemo(() => {
    const titles = incidents.map(incident => incident.title);
    return [...new Set(titles)].sort((a, b) => a.localeCompare(b));
  }, [incidents]);

  // Filter titles based on user input
  const filteredTitles = useMemo(() => {
    if (!formData.title) return existingTitles;
    return existingTitles.filter(title => 
      title.toLowerCase().startsWith(formData.title.toLowerCase())
    );
  }, [formData.title, existingTitles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (incidentToEdit) {
      updateIncident(incidentToEdit.id, {
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
      });
    } else {
      const newIncident = {
        ...formData,
        id: Date.now().toString(),
        reported_at: new Date().toISOString(),
        status: 'open' as const,
      };
      addIncident(newIncident);
    }

    setFormData({
      title: '',
      description: '',
      severity: 'low',
    });
    setError('');
    
    if (onSubmit) {
      onSubmit();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'title') {
      setShowSuggestions(true);
      setSelectedIndex(-1);
    }
  };

  const handleTitleSelect = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title: title
    }));
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (e.target === titleInputRef.current) {
        // If we're in the title input and there's a selected suggestion
        if (selectedIndex >= 0 && selectedIndex < filteredTitles.length) {
          handleTitleSelect(filteredTitles[selectedIndex]);
        }
        // Move focus to description
        descriptionRef.current?.focus();
      } else if (e.target === descriptionRef.current) {
        // If we're in the description, submit the form
        handleSubmit(e as any);
      }
    } else if (showSuggestions && filteredTitles.length > 0) {
      // Handle arrow keys for suggestions
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredTitles.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.formGroup}>
        <label htmlFor="title">Title</label>
        <div className={styles.titleInputContainer}>
          <input
            ref={titleInputRef}
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Enter incident title"
            autoComplete="off"
          />
          {showSuggestions && filteredTitles.length > 0 && (
            <div className={styles.suggestions} ref={suggestionsRef}>
              {filteredTitles.map((title, index) => (
                <div
                  key={index}
                  className={`${styles.suggestionItem} ${index === selectedIndex ? styles.selected : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent blur event
                    handleTitleSelect(title);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Description</label>
        <textarea
          ref={descriptionRef}
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe the incident"
          rows={4}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="severity">Severity</label>
        <select
          id="severity"
          name="severity"
          value={formData.severity}
          onChange={handleChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className={styles.buttonGroup}>
        {onCancel && (
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className={styles.submitButton}>
          {incidentToEdit ? 'Update Incident' : 'Submit Incident'}
        </button>
      </div>
    </form>
  );
};

export default IncidentForm;
