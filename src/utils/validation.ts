export const validateIncident = (title: string, description: string): boolean => {
  return title.trim().length > 0 && description.trim().length > 0;
};
