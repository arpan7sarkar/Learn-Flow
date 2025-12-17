const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Something went wrong');
  }

  return response.json();
}

// ==================== Syllabus APIs ====================

/**
 * Upload syllabus PDF
 */
export async function uploadSyllabus(file: File, title?: string) {
  const formData = new FormData();
  formData.append('syllabus', file);
  if (title) formData.append('title', title);

  const response = await fetch(`${API_BASE_URL}/upload-syllabus`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

/**
 * Get study plan details
 */
export async function getStudyPlan(planId: string) {
  return fetchAPI(`/study-plan/${planId}`);
}

// ==================== Planner APIs ====================

/**
 * Generate study plan from uploaded syllabus
 */
export async function generateStudyPlan(studyPlanId: string, hoursPerDay = 4, examDate?: string) {
  return fetchAPI('/generate-study-plan', {
    method: 'POST',
    body: JSON.stringify({ studyPlanId, hoursPerDay, examDate }),
  });
}

/**
 * Get calendar events
 */
export async function getStudyCalendar(userId?: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  return fetchAPI(`/study-calendar${queryString ? `?${queryString}` : ''}`);
}

/**
 * Update calendar event completion
 */
export async function updateCalendarEvent(eventId: string, completed: boolean) {
  return fetchAPI(`/calendar-event/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
}

// ==================== AI Tutor APIs ====================

/**
 * Get AI explanation for a topic
 */
export async function explainTopic(topic: string, analogy: string = 'reallife') {
  return fetchAPI('/ai-explain-topic', {
    method: 'POST',
    body: JSON.stringify({ topic, analogy }),
  });
}

/**
 * Generate quiz for a topic
 */
export async function generateQuiz(topic: string, numQuestions = 5) {
  return fetchAPI('/generate-quiz', {
    method: 'POST',
    body: JSON.stringify({ topic, numQuestions }),
  });
}

/**
 * Submit quiz answers
 */
export async function submitQuiz(topic: string, answers: any[]) {
  return fetchAPI('/submit-quiz', {
    method: 'POST',
    body: JSON.stringify({ topic, answers }),
  });
}

/**
 * Get quiz history
 */
export async function getQuizHistory(userId?: string) {
  const params = userId ? `?userId=${userId}` : '';
  return fetchAPI(`/quiz-history${params}`);
}

// ==================== Health Check ====================

export async function healthCheck() {
  return fetchAPI('/health');
}

export default {
  uploadSyllabus,
  getStudyPlan,
  generateStudyPlan,
  getStudyCalendar,
  updateCalendarEvent,
  explainTopic,
  generateQuiz,
  submitQuiz,
  getQuizHistory,
  healthCheck,
};
