document.addEventListener('DOMContentLoaded', function () {
  var copyEmailButton = document.getElementById('copy-email');
  if (copyEmailButton) {
    copyEmailButton.addEventListener('click', function () {
      var email = 'hello@andreisandu.net';
      navigator.clipboard.writeText(email);
      var button = copyEmailButton;
      var originalHtml = button.innerHTML;
      button.innerHTML = 'Copied!';
      button.classList.add('bg-emerald-500', 'text-white');
      button.classList.remove('bg-gray-900', 'dark:bg-white');
      setTimeout(function () {
        button.innerHTML = originalHtml;
        button.classList.remove('bg-emerald-500', 'text-white');
        button.classList.add('bg-gray-900', 'dark:bg-white');
      }, 2000);
    });
  }

  var mobileMenuBtn = document.getElementById('mobile-menu-button');
  var mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
    });
  }
});
