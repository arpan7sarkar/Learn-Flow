const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
export async function uploadSyllabus(file: File, title?: string, userEmail?: string) {
  const formData = new FormData();
  formData.append('syllabus', file);
  if (title) formData.append('title', title);
  if (userEmail) formData.append('userEmail', userEmail);

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

/**
 * Get all study plans (history)
 */
export async function getAllStudyPlans(userEmail?: string) {
  const params = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
  return fetchAPI(`/all-study-plans${params}`);
}

/**
 * Delete a study plan
 */
export async function deleteStudyPlan(planId: string, userEmail?: string) {
  const params = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
  return fetchAPI(`/study-plan/${planId}${params}`, {
    method: 'DELETE',
  });
}

// ==================== Planner APIs ====================

/**
 * Generate study plan from uploaded syllabus
 */
export async function generateStudyPlan(studyPlanId: string, hoursPerDay = 4, examDate?: string, userEmail?: string) {
  return fetchAPI('/generate-study-plan', {
    method: 'POST',
    body: JSON.stringify({ studyPlanId, hoursPerDay, examDate, userEmail }),
  });
}

/**
 * Get calendar events
 */
export async function getStudyCalendar(userEmail?: string, startDate?: string, endDate?: string, studyPlanId?: string) {
  const params = new URLSearchParams();
  if (userEmail) params.append('userEmail', userEmail);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (studyPlanId) params.append('studyPlanId', studyPlanId);

  const queryString = params.toString();
  return fetchAPI(`/study-calendar${queryString ? `?${queryString}` : ''}`);
}

/**
 * Update calendar event completion
 */
export async function updateCalendarEvent(eventId: string, completed: boolean, userEmail?: string) {
  return fetchAPI(`/calendar-event/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed, userEmail }),
  });
}

// ==================== AI Tutor APIs ====================

/**
 * Get AI explanation for a topic
 */
export async function explainTopic(topic: string, analogy: string = 'reallife', sessionId?: string, userEmail?: string) {
  return fetchAPI('/ai-explain-topic', {
    method: 'POST',
    body: JSON.stringify({ topic, analogy, sessionId, userEmail }),
  });
}

/**
 * Generate quiz for a topic
 */
export async function generateQuiz(topic: string, numQuestions = 5, userEmail?: string) {
  return fetchAPI('/generate-quiz', {
    method: 'POST',
    body: JSON.stringify({ topic, numQuestions, userEmail }),
  });
}

/**
 * Submit quiz answers
 */
export async function submitQuiz(topic: string, answers: any[], userEmail?: string) {
  return fetchAPI('/submit-quiz', {
    method: 'POST',
    body: JSON.stringify({ topic, answers, userEmail }),
  });
}

/**
 * Get quiz history
 */
export async function getQuizHistory(userEmail?: string) {
  const params = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
  return fetchAPI(`/quiz-history${params}`);
}

/**
 * Get study analytics (stats, streaks, progress)
 */
export async function getStudyAnalytics(userEmail?: string) {
  const params = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
  return fetchAPI(`/study-analytics${params}`);
}

/**
 * Get chat sessions list
 */
export async function getChatSessions(userEmail?: string) {
  const params = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
  return fetchAPI(`/chat-history${params}`);
}

/**
 * Get specific chat session
 */
export async function getChatSession(sessionId: string, userEmail?: string) {
  const params = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
  return fetchAPI(`/chat-session/${sessionId}${params}`);
}

/**
 * Delete chat session
 */
export async function deleteChatSession(sessionId: string, userEmail?: string) {
  const params = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
  return fetchAPI(`/chat-session/${sessionId}${params}`, {
    method: 'DELETE',
  });
}

// ==================== Health Check ====================

export async function healthCheck() {
  return fetchAPI('/health');
}

export default {
  uploadSyllabus,
  getStudyPlan,
  getAllStudyPlans,
  deleteStudyPlan,
  generateStudyPlan,
  getStudyCalendar,
  updateCalendarEvent,
  explainTopic,
  generateQuiz,
  submitQuiz,
  getQuizHistory,
  getStudyAnalytics,
  getChatSessions,
  getChatSession,
  deleteChatSession,
  healthCheck,
};


