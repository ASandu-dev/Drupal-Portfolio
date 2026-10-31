document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.getElementById('mobile-menu-button');
  var menu = document.getElementById('mobile-menu');

  if (!menuButton || !menu) {
    return;
  }

  function setMenuOpen(isOpen) {
    menu.classList.toggle('is-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  menuButton.addEventListener('click', function () {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  menu.addEventListener('click', function (event) {
    if (event.target.closest('a')) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  });
});
