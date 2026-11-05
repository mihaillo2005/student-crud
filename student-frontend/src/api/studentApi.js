/**
 * API Client for Student Endpoints
 * Supports both local development (Vite dev proxy) and Render production deployment (VITE_API_BASE_URL)
 */

export function getBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return `${clean}/ladrillo/students`;
  }
  // Local development fallback (proxied by vite.config.js to localhost:8080)
  return '/ladrillo/students';
}

/**
 * Handle API responses and uniform error reporting
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorData = await response.text();
      errorDetail = errorData || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail || `Request failed with status ${response.status}`);
  }

  // Handle empty responses (like 204 or void response)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
}

/**
 * Fetch all students
 * @returns {Promise<Array>} List of students
 */
export async function getAllStudents() {
  const url = getBaseUrl();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  return handleResponse(response);
}

/**
 * Fetch a single student by ID
 * @param {number|string} id 
 * @returns {Promise<Object>} Student object
 */
export async function getStudentById(id) {
  const url = `${getBaseUrl()}/${id}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  return handleResponse(response);
}

/**
 * Create a new student
 * @param {Object} student - { firstname, lastname, course, section }
 * @returns {Promise<Object>} Created student
 */
export async function createStudent(student) {
  const url = getBaseUrl();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(student),
  });
  return handleResponse(response);
}

/**
 * Update an existing student
 * @param {number|string} id 
 * @param {Object} student - { firstname, lastname, course, section }
 * @returns {Promise<Object>} Updated student
 */
export async function updateStudent(id, student) {
  const url = `${getBaseUrl()}/${id}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(student),
  });
  return handleResponse(response);
}

/**
 * Delete a student by ID
 * @param {number|string} id 
 * @returns {Promise<string>} Deletion response
 */
export async function deleteStudent(id) {
  const url = `${getBaseUrl()}/${id}`;
  const response = await fetch(url, {
    method: 'DELETE',
  });
  return handleResponse(response);
}
