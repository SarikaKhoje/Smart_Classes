/**
 * Verify access through the explicit parent.children relationship maintained by administrators.
 * @param {Object} parentUser - The authenticated parent User document
 * @param {string|ObjectId} studentId - The target student's MongoDB ID
 * @returns {boolean} - True if the student is explicitly linked to the parent
 */
export const verifyParentChildAccess = (parentUser, studentId) => {
  if (!parentUser || parentUser.role !== 'parent') {
    return false;
  }

  return (parentUser.children || []).some(
    child => child.studentId && child.studentId.toString() === studentId.toString()
  );
};

export default verifyParentChildAccess;
