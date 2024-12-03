// JavaScript to hide navbar on scroll down, show on scroll up
let lastScrollTop = 0; // To store the last scroll position
const navbar = document.querySelector('.navbar'); // Target the navbar element

// Listen for scroll events
window.addEventListener('scroll', function() {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop) {
        // Scrolling down
        navbar.style.top = '-80px'; // Hide the navbar (adjust -80px based on your navbar height)
    } else {
        // Scrolling up
        navbar.style.top = '0'; // Show the navbar
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Keep lastScrollTop at a minimum of 0
});
