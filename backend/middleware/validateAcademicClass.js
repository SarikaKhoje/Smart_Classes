import { ACADEMIC_CLASSES, isAcademicClass } from '../utils/academicClass.js';

const validateAcademicClass = (req, res, next) => {
  const classFields = [
    ['class', req.body?.class, req.body],
    ['className', req.body?.className, req.body],
    ['desiredClass', req.body?.desiredClass, req.body],
    ['class', req.query?.class, req.query],
    ['className', req.query?.className, req.query]
  ];

  for (const [field, value, source] of classFields) {
    if (value !== undefined && value !== '' && !isAcademicClass(value)) {
      return res.status(400).json({
        success: false,
        message: `${field} must be one of: ${ACADEMIC_CLASSES.join(', ')}`
      });
    }
    if (typeof value === 'string' && value.trim()) source[field] = value.trim();
  }

  const assignedClasses = req.body?.assignedClasses;
  if (assignedClasses !== undefined &&
      (!Array.isArray(assignedClasses) || assignedClasses.some(className => !isAcademicClass(className)))) {
    return res.status(400).json({
      success: false,
      message: `assignedClasses must contain only grades: ${ACADEMIC_CLASSES.join(', ')}`
    });
  }
  if (Array.isArray(assignedClasses)) {
    req.body.assignedClasses = assignedClasses.map(className => className.trim());
  }

  next();
};

export default validateAcademicClass;
