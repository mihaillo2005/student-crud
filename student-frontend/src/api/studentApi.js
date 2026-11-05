/**
 * API Client for Student Endpoints
 * Communicates with the Spring Boot backend via the Vite proxy (/ladrillo/students)
 */

const BASE_URL = '/ladrillo/students';

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
  const response = await fetch(BASE_URL, {
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
  const response = await fetch(`${BASE_URL}/${id}`, {
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
  const response = await fetch(BASE_URL, {
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
  const response = await fetch(`${BASE_URL}/${id}`, {
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
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}
