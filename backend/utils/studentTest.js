export const toStudentTest = (test, studentId) => {
  const data = typeof test.toObject === 'function' ? test.toObject() : test;
  const studentIdString = studentId.toString();
  return {
    _id: data._id,
    title: data.title,
    subject: data.subject,
    class: data.class,
    duration: data.duration,
    totalMarks: data.totalMarks,
    passingMarks: data.passingMarks,
    status: data.status,
    questions: data.questions.map(({ correctAnswer, ...question }) => question),
    submitted: (data.attempts || []).some(attempt => attempt.studentId?.toString() === studentIdString)
  };
};

export const evaluateStudentAnswers = (questions, answers) => {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return { error: 'Answers must be provided as a question-indexed object' };
  }

  const answerEntries = Object.entries(answers);
  if (answerEntries.some(([index, answer]) =>
    !/^(0|[1-9]\d*)$/.test(index) ||
    Number(index) >= questions.length ||
    typeof answer !== 'string' ||
    answer.length > 1000
  )) {
    return { error: 'Each answer must refer to a valid question and contain at most 1,000 characters' };
  }

  let score = 0;
  for (const [index, answer] of answerEntries) {
    const question = questions[Number(index)];
    if (answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
      score += question.marks || 1;
    }
  }
  return { score };
};
