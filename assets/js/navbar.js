let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');
const scrollHint = document.getElementById('scroll-hint');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  if (currentScroll > lastScrollTop && currentScroll > 80) {
    navbar.style.top = '-80px';
  } else {
    navbar.style.top = '0';
  }

  if (scrollHint) {
    scrollHint.classList.toggle('hidden', currentScroll > 60);
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, { passive: true });
