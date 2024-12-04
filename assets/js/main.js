function loadSection(id, file, callback) {
  fetch(file)
      .then(response => {
          if (!response.ok) throw new Error('Error loading ' + file);
          return response.text();
      })
      .then(data => {
          document.getElementById(id).innerHTML = data;
          if (callback) callback(); // Execute the callback after content is loaded
      })
      .catch(error => console.error(error));
}
window.addEventListener('scroll', function () {
  const navbar = document.querySelector('.navbar');
  // No background color change on scroll, so no class added
});
// Load external sections
loadSection('about', 'about.html');
loadSection('contact', 'contact.html');


document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const menuPopup = document.getElementById('menu-popup');
  menuPopup.style.display = 'none';
  // Toggle the popup menu on button click
  menuToggle.addEventListener('click', () => {
      menuPopup.style.display = menuPopup.style.display === 'flex' ? 'none' : 'flex';
  });
  
  // Close the popup menu when a link is clicked
  menuPopup.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
      menuPopup.style.display = 'none';
      }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const serviceDescriptions = document.querySelectorAll(".service-description p");
  const tooltip = document.querySelector(".tooltip");
  serviceDescriptions.forEach((item) => {
      item.addEventListener("mouseover", (event) => {
          if (isSmallScreen()) return;
          const info = event.target.getAttribute("data-info");
          if (info) {
              tooltip.textContent = info;
              tooltip.style.left = `${event.pageX + 10}px`; // Position right of cursor
              tooltip.style.top = `${event.pageY + 10}px`; // Position below cursor
              tooltip.classList.add("active");
          }
      });
      item.addEventListener("mousemove", (event) => {
        if (isSmallScreen()) return; 
        positionTooltip(event);
    });

    item.addEventListener("mouseout", () => {
        if (isSmallScreen()) return; 
        tooltip.classList.remove("active");
    });
  });
  function positionTooltip(event) {
    const tooltipRect = tooltip.getBoundingClientRect();
    const maxRight = window.innerWidth;
    const tooltipWidth = tooltipRect.width;
    let leftPosition = event.pageX + 10; // Default: position to the right of the mouse

    // Check if the tooltip overflows the viewport's right edge
    if (event.pageX + tooltipWidth + 10 > maxRight) {
        leftPosition = event.pageX - tooltipWidth - 10; // Position to the left of the mouse
    }

    tooltip.style.left = `${leftPosition}px`;
    tooltip.style.top = `${event.pageY + 10}px`; // Keep it below the cursor
  }
  function isSmallScreen() {
    return window.innerWidth <= 1000; // Define breakpoint for small screens
  }
});