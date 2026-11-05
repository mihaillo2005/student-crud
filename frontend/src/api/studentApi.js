/**
 * Student API Service
 * Built for both local development and Render.com multi-service deployment
 * Includes candidate endpoint probing, Render cold-start tolerance, and localStorage fallback
 */

const STORAGE_KEY = 'ladrillo_student_records';

const DEFAULT_SAMPLE_STUDENTS = [
  { id: 101, firstname: 'Maria', lastname: 'Santos', course: 'BSIT', section: '3-A' },
  { id: 102, firstname: 'Juan', lastname: 'Dela Cruz', course: 'BSCS', section: '3-B' },
  { id: 103, firstname: 'Andrea', lastname: 'Reyes', course: 'BSIS', section: '2-A' },
];

/**
 * Determine candidate backend endpoints to probe
 */
function getCandidateEndpoints() {
  const endpoints = [];

  // 1. Explicit environment variable (set in Render blueprint or .env)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    const withoutProto = clean.replace(/^https?:\/\//i, '');
    if (!withoutProto.includes('.') && !withoutProto.includes('localhost')) {
      const hostOnly = withoutProto.split(':')[0];
      clean = `https://${hostOnly}.onrender.com`;
    } else if (!/^https?:\/\//i.test(clean)) {
      clean = `https://${clean}`;
    }
    endpoints.push(`${clean}/ladrillo/students`);
  }

  // 2. Direct localhost:8080 when running in local browser
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    endpoints.push('http://localhost:8080/ladrillo/students');
  }

  // 3. Standard Render backend URL
  endpoints.push('https://student-backend.onrender.com/ladrillo/students');

  // 4. Relative proxy path for Vite dev server
  endpoints.push('/ladrillo/students');

  // De-duplicate while maintaining priority order
  return [...new Set(endpoints)];
}

// Active working endpoint (cached once successfully contacted)
let activeEndpoint = null;

export function getActiveEndpoint() {
  return activeEndpoint;
}

/**
 * Local Storage Helpers
 */
export function getLocalStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Student API] LocalStorage read failed:', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_STUDENTS));
  return DEFAULT_SAMPLE_STUDENTS;
}

export function saveLocalStudents(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('[Student API] LocalStorage save failed:', e);
  }
}

/**
 * Fetch all students from Spring Boot backend with auto-fallback
 */
export async function getAllStudents() {
  const candidates = getCandidateEndpoints();

  for (const url of candidates) {
    try {
      const controller = new AbortController();
      // Allow up to 10 seconds in case Render free tier is waking from sleep
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          activeEndpoint = url;
          saveLocalStudents(data);
          return {
            data,
            source: 'backend',
            endpoint: url,
          };
        }
      }
    } catch (err) {
      console.warn(`[Student API] Fetch failed for ${url}:`, err.message || err);
    }
  }

  // Fallback to local storage if backend is asleep or unreachable
  const localData = getLocalStudents();
  return {
    data: localData,
    source: 'local',
    endpoint: null,
  };
}

/**
 * Fetch student by ID
 */
export async function getStudentById(id) {
  const candidates = activeEndpoint ? [activeEndpoint, ...getCandidateEndpoints()] : getCandidateEndpoints();

  for (const baseUrl of candidates) {
    try {
      const res = await fetch(`${baseUrl}/${id}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Continue to next candidate
    }
  }

  // Local fallback
  const localList = getLocalStudents();
  return localList.find((s) => s.id === Number(id)) || null;
}

/**
 * Create a new student
 */
export async function createStudent(student) {
  const targetUrl = activeEndpoint || getCandidateEndpoints()[0];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(student),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const created = await res.json();
      // Sync local storage
      const current = getLocalStudents();
      saveLocalStudents([...current, created]);
      return created;
    }
  } catch (e) {
    console.warn('[Student API] Backend POST failed, saving to local storage:', e);
  }

  // Local fallback
  const current = getLocalStudents();
  const nextId = current.length > 0 ? Math.max(...current.map((s) => s.id || 0)) + 1 : 101;
  const newStudent = { ...student, id: nextId };
  saveLocalStudents([...current, newStudent]);
  return newStudent;
}

/**
 * Update a student
 */
export async function updateStudent(id, student) {
  const targetUrl = activeEndpoint || getCandidateEndpoints()[0];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${targetUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(student),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const updated = await res.json();
      const current = getLocalStudents();
      const updatedList = current.map((s) => (s.id === Number(id) ? updated : s));
      saveLocalStudents(updatedList);
      return updated;
    }
  } catch (e) {
    console.warn('[Student API] Backend PUT failed, updating local storage:', e);
  }

  // Local fallback
  const current = getLocalStudents();
  const updatedStudent = { ...student, id: Number(id) };
  const updatedList = current.map((s) => (s.id === Number(id) ? updatedStudent : s));
  saveLocalStudents(updatedList);
  return updatedStudent;
}

/**
 * Delete a student
 */
export async function deleteStudent(id) {
  const targetUrl = activeEndpoint || getCandidateEndpoints()[0];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch(`${targetUrl}/${id}`, {
      method: 'DELETE',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (e) {
    console.warn('[Student API] Backend DELETE failed, deleting from local storage:', e);
  }

  // Sync local storage
  const current = getLocalStudents();
  const updatedList = current.filter((s) => s.id !== Number(id));
  saveLocalStudents(updatedList);
  return true;
}
