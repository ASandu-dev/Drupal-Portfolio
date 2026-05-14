(function () {
  var storedTheme;

  try {
    storedTheme = window.localStorage.getItem('theme');
  }
  catch (error) {
    storedTheme = null;
  }

  var useDark = storedTheme ? storedTheme === 'dark' : true;
  document.documentElement.classList.toggle('dark', useDark);
})();
