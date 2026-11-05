/**
 * Toast Notification Service
 */

const toastContainer = document.getElementById('toast-container');

export function showToast(message, type = 'info', duration = 3500) {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  
  const typeStyles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: `<svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: `<svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    },
    info: {
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      icon: `<svg class="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  toast.className = `flex items-center gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-2 opacity-0 max-w-md w-full ${style.bg}`;
  toast.innerHTML = `
    ${style.icon}
    <p class="text-sm font-medium flex-1">${escapeHtml(message)}</p>
    <button class="text-slate-400 hover:text-slate-600 transition-colors p-1" aria-label="Close">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
  `;

  toast.querySelector('button').addEventListener('click', () => removeToast(toast));

  toastContainer.appendChild(toast);

  // Trigger smooth enter transition
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  // Auto remove
  const timer = setTimeout(() => {
    removeToast(toast);
  }, duration);

  toast.addEventListener('mouseenter', () => clearTimeout(timer));
}

function removeToast(toast) {
  toast.classList.add('opacity-0', 'translate-y-2');
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 300);
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}
