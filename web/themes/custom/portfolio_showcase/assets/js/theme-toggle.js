document.addEventListener('DOMContentLoaded', function () {
  var themeToggle = document.getElementById('theme-toggle');
  var themeIcon = document.getElementById('theme-icon');

  if (!themeToggle || !themeIcon) {
    return;
  }

  var currentTheme = 'dark';

  try {
    currentTheme = window.localStorage.getItem('theme') || 'dark';
  }
  catch (error) {
    currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
    updateIcon(true);
  }
  else {
    document.documentElement.classList.remove('dark');
    updateIcon(false);
  }

  themeToggle.addEventListener('click', function () {
    var isDark = document.documentElement.classList.toggle('dark');

    try {
      window.localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    catch (error) {
      // Ignore storage failures.
    }

    updateIcon(isDark);
  });

  function updateIcon(isDark) {
    if (isDark) {
      themeIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>';
      return;
    }

    themeIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>';
  }
});
