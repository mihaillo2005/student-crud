import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from './api/studentApi.js';
import { showToast } from './components/toast.js';

// Application State
let students = [];
let deleteTarget = { id: null, name: '' };

// DOM Elements
const studentTable = document.getElementById('student-table');
const studentTableBody = document.getElementById('student-table-body');
const loadingSkeleton = document.getElementById('loading-skeleton');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const filterCourse = document.getElementById('filter-course');
const refreshBtn = document.getElementById('refresh-btn');
const refreshIcon = document.getElementById('refresh-icon');

// Stats Elements
const statTotal = document.getElementById('stat-total');
const statCourses = document.getElementById('stat-courses');
const statSections = document.getElementById('stat-sections');
const apiStatusDot = document.getElementById('api-status-dot');
const apiStatusText = document.getElementById('api-status-text');

// Add/Edit Modal Elements
const studentModal = document.getElementById('student-modal');
const modalContent = document.getElementById('modal-content');
const modalTitle = document.getElementById('modal-title');
const studentForm = document.getElementById('student-form');
const studentIdInput = document.getElementById('student-id');
const firstnameInput = document.getElementById('student-firstname');
const lastnameInput = document.getElementById('student-lastname');
const courseInput = document.getElementById('student-course');
const sectionInput = document.getElementById('student-section');
const openAddModalBtn = document.getElementById('open-add-modal-btn');
const emptyAddBtn = document.getElementById('empty-add-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalSubmitBtn = document.getElementById('modal-submit-btn');
const submitSpinner = document.getElementById('submit-spinner');
const submitText = document.getElementById('submit-text');

// Delete Modal Elements
const deleteModal = document.getElementById('delete-modal');
const deleteModalContent = document.getElementById('delete-modal-content');
const deleteStudentName = document.getElementById('delete-student-name');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

/**
 * Initialize application
 */
async function init() {
  setupEventListeners();
  await loadStudents();
}

/**
 * Load student records from Spring Boot backend or fallback
 */
async function loadStudents() {
  setLoadingState(true);
  try {
    const res = await getAllStudents();
    students = Array.isArray(res.data) ? res.data : [];
    
    // Update API connection status
    if (res.source === 'backend') {
      setApiStatus('online', 'Spring Boot API Connected');
    } else {
      setApiStatus('offline', 'Local Mode (Backend Connecting / Standby)');
    }
    
    // Update metrics & course dropdown
    updateStats();
    populateCourseFilter();

    // Render table
    applyFilters();
  } catch (error) {
    console.error('Failed to load students:', error);
    setApiStatus('error', 'API Offline');
    showToast(`Could not load students: ${error.message}`, 'error');
    students = [];
    applyFilters();
  } finally {
    setLoadingState(false);
  }
}

/**
 * Filter students according to search query and course selection
 */
function applyFilters() {
  const query = (searchInput.value || '').trim().toLowerCase();
  const selectedCourse = (filterCourse.value || '').trim().toLowerCase();

  const filtered = students.filter((student) => {
    const fullName = `${student.firstname || ''} ${student.lastname || ''}`.toLowerCase();
    const id = String(student.id || '');
    const course = (student.course || '').toLowerCase();
    const section = (student.section || '').toLowerCase();

    const matchesQuery =
      !query ||
      fullName.includes(query) ||
      id.includes(query) ||
      course.includes(query) ||
      section.includes(query);

    const matchesCourse = !selectedCourse || course === selectedCourse;

    return matchesQuery && matchesCourse;
  });

  renderTable(filtered);
}

/**
 * Render the student records in the table
 */
function renderTable(list) {
  studentTableBody.innerHTML = '';

  if (list.length === 0) {
    studentTable.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  studentTable.classList.remove('hidden');

  const fragment = document.createDocumentFragment();

  list.forEach((student) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/75 transition-colors duration-150';

    const initials = getInitials(student.firstname, student.lastname);
    const colorClass = getAvatarColor(student.id || 1);

    tr.innerHTML = `
      <td class="py-4 px-6 font-mono text-xs font-semibold text-slate-500">
        <span class="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">#${student.id}</span>
      </td>
      <td class="py-4 px-6">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${colorClass}">
            ${initials}
          </div>
          <div>
            <div class="font-semibold text-slate-900">${escapeHtml(student.firstname)} ${escapeHtml(student.lastname)}</div>
            <div class="text-xs text-slate-400">ID: ${student.id}</div>
          </div>
        </div>
      </td>
      <td class="py-4 px-6">
        <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          ${escapeHtml(student.course || 'N/A')}
        </span>
      </td>
      <td class="py-4 px-6">
        <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          ${escapeHtml(student.section || 'N/A')}
        </span>
      </td>
      <td class="py-4 px-6 text-right">
        <div class="inline-flex items-center gap-1.5 justify-end">
          <button 
            data-action="edit" 
            data-id="${student.id}" 
            title="Edit Student"
            class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          </button>
          <button 
            data-action="delete" 
            data-id="${student.id}" 
            title="Delete Student"
            class="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </td>
    `;

    fragment.appendChild(tr);
  });

  studentTableBody.appendChild(fragment);
}

/**
 * Update summary stats cards
 */
function updateStats() {
  statTotal.textContent = students.length;

  const uniqueCourses = new Set(students.map((s) => (s.course || '').trim().toUpperCase()).filter(Boolean));
  statCourses.textContent = uniqueCourses.size;

  const uniqueSections = new Set(students.map((s) => (s.section || '').trim().toUpperCase()).filter(Boolean));
  statSections.textContent = uniqueSections.size;
}

/**
 * Populate dynamic Course filter options
 */
function populateCourseFilter() {
  const currentVal = filterCourse.value;
  const uniqueCourses = Array.from(
    new Set(students.map((s) => (s.course || '').trim().toUpperCase()).filter(Boolean))
  ).sort();

  filterCourse.innerHTML = '<option value="">All Courses</option>';
  uniqueCourses.forEach((course) => {
    const opt = document.createElement('option');
    opt.value = course.toLowerCase();
    opt.textContent = course;
    if (opt.value === currentVal) opt.selected = true;
    filterCourse.appendChild(opt);
  });
}

/**
 * Form Submit Handler (Add or Update)
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  const id = studentIdInput.value;
  const payload = {
    firstname: firstnameInput.value.trim(),
    lastname: lastnameInput.value.trim(),
    course: courseInput.value.trim().toUpperCase(),
    section: sectionInput.value.trim().toUpperCase(),
  };

  setSubmitting(true);

  try {
    if (id) {
      await updateStudent(id, payload);
      showToast(`Student #${id} updated successfully!`, 'success');
    } else {
      const created = await createStudent(payload);
      showToast(`Student ${created.firstname} added successfully!`, 'success');
    }

    closeModal();
    await loadStudents();
  } catch (error) {
    console.error('Save failed:', error);
    showToast(`Failed to save student: ${error.message}`, 'error');
  } finally {
    setSubmitting(false);
  }
}

/**
 * Confirm & execute student deletion
 */
async function handleConfirmDelete() {
  if (!deleteTarget.id) return;

  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = 'Deleting...';

  try {
    await deleteStudent(deleteTarget.id);
    showToast(`Student "${deleteTarget.name}" deleted successfully.`, 'success');
    closeDeleteModal();
    await loadStudents();
  } catch (error) {
    console.error('Delete failed:', error);
    showToast(`Failed to delete student: ${error.message}`, 'error');
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = 'Delete';
  }
}

/**
 * Open Add/Edit Modal
 */
function openModal(mode = 'add', student = null) {
  studentForm.reset();

  if (mode === 'edit' && student) {
    modalTitle.textContent = 'Edit Student';
    submitText.textContent = 'Save Changes';
    studentIdInput.value = student.id;
    firstnameInput.value = student.firstname || '';
    lastnameInput.value = student.lastname || '';
    courseInput.value = student.course || '';
    sectionInput.value = student.section || '';
  } else {
    modalTitle.textContent = 'Add New Student';
    submitText.textContent = 'Create Student';
    studentIdInput.value = '';
  }

  studentModal.classList.remove('hidden');
  studentModal.classList.add('flex');

  // Trigger smooth enter animation
  requestAnimationFrame(() => {
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
  });

  firstnameInput.focus();
}

/**
 * Close Add/Edit Modal
 */
function closeModal() {
  modalContent.classList.remove('scale-100', 'opacity-100');
  modalContent.classList.add('scale-95', 'opacity-0');

  setTimeout(() => {
    studentModal.classList.add('hidden');
    studentModal.classList.remove('flex');
    studentForm.reset();
  }, 150);
}

/**
 * Open Delete Confirmation Modal
 */
function openDeleteModal(id, name) {
  deleteTarget = { id, name };
  deleteStudentName.textContent = `"${name}" (ID #${id})`;

  deleteModal.classList.remove('hidden');
  deleteModal.classList.add('flex');

  requestAnimationFrame(() => {
    deleteModalContent.classList.remove('scale-95', 'opacity-0');
    deleteModalContent.classList.add('scale-100', 'opacity-100');
  });
}

/**
 * Close Delete Modal
 */
function closeDeleteModal() {
  deleteModalContent.classList.remove('scale-100', 'opacity-100');
  deleteModalContent.classList.add('scale-95', 'opacity-0');

  setTimeout(() => {
    deleteModal.classList.add('hidden');
    deleteModal.classList.remove('flex');
    deleteTarget = { id: null, name: '' };
  }, 150);
}

/**
 * Event Listeners Setup
 */
function setupEventListeners() {
  // Add modal triggers
  openAddModalBtn.addEventListener('click', () => openModal('add'));
  emptyAddBtn.addEventListener('click', () => openModal('add'));

  // Modal close triggers
  modalCloseBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  studentModal.addEventListener('click', (e) => {
    if (e.target === studentModal) closeModal();
  });

  // Form submit
  studentForm.addEventListener('submit', handleFormSubmit);

  // Table row action clicks (delegation)
  studentTableBody.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const studentId = Number(button.dataset.id);
    const student = students.find((s) => s.id === studentId);

    if (!student) return;

    if (action === 'edit') {
      openModal('edit', student);
    } else if (action === 'delete') {
      openDeleteModal(student.id, `${student.firstname} ${student.lastname}`);
    }
  });

  // Delete modal buttons
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });
  confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  // Search & Filter input
  searchInput.addEventListener('input', applyFilters);
  filterCourse.addEventListener('change', applyFilters);

  // Refresh button
  refreshBtn.addEventListener('click', async () => {
    refreshIcon.classList.add('animate-spin');
    await loadStudents();
    showToast('Student records refreshed', 'info');
    setTimeout(() => refreshIcon.classList.remove('animate-spin'), 600);
  });

  // Global ESC key listener to close modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!studentModal.classList.contains('hidden')) closeModal();
      if (!deleteModal.classList.contains('hidden')) closeDeleteModal();
    }
  });
}

/**
 * Utility Helpers
 */
function setLoadingState(isLoading) {
  if (isLoading) {
    loadingSkeleton.classList.remove('hidden');
    studentTable.classList.add('hidden');
    emptyState.classList.add('hidden');
  } else {
    loadingSkeleton.classList.add('hidden');
  }
}

function setSubmitting(isSubmitting) {
  modalSubmitBtn.disabled = isSubmitting;
  if (isSubmitting) {
    submitSpinner.classList.remove('hidden');
  } else {
    submitSpinner.classList.add('hidden');
  }
}

function setApiStatus(status, text) {
  if (status === 'online') {
    apiStatusDot.className = 'w-2 h-2 rounded-full bg-emerald-500';
  } else if (status === 'offline') {
    apiStatusDot.className = 'w-2 h-2 rounded-full bg-amber-500 animate-pulse';
  } else {
    apiStatusDot.className = 'w-2 h-2 rounded-full bg-rose-500';
  }
  apiStatusText.textContent = text;
}

function getInitials(first = '', last = '') {
  const f = first.charAt(0).toUpperCase();
  const l = last.charAt(0).toUpperCase();
  return `${f}${l}` || 'ST';
}

function getAvatarColor(id) {
  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-sky-100 text-sky-700',
    'bg-teal-100 text-teal-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];
  return colors[id % colors.length];
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Start
init();
