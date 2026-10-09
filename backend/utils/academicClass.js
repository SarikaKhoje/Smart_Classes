export const ACADEMIC_CLASSES = ['7', '8', '9', '10'];

export const isAcademicClass = (value) =>
  typeof value === 'string' && ACADEMIC_CLASSES.includes(value.trim());
