// function setHeroHeight() {
//   const image = new Image();
//   image.src = './assets/images/backgroundmain.svg'; // Path to your background image
//   image.onload = function() {
//       const aspectRatio = image.width / image.height; // Get aspect ratio
//       const windowWidth = window.innerWidth;
//       const newHeight = windowWidth / aspectRatio; // Calculate height based on aspect ratio
//       document.getElementById('hero').style.height = `${newHeight - 10}px`; // Set height of hero section
//   };
// }

// // Call the function to set the hero section height on page load
// window.onload = setHeroHeight;

// // Optional: Update on window resize
// window.onresize = setHeroHeight;
function setHeroHeight() {
  const heroSection = document.getElementById('hero');
  const image = new Image();
  image.src = './assets/images/backgroundmain.svg'; // Path to your background image
  
  image.onload = function () {
    const aspectRatio = image.width / image.height; // Get aspect ratio
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate image height based on aspect ratio
    const newHeight = windowWidth / aspectRatio;

    if (newHeight < windowHeight) {
      // If image height is smaller than viewport height, set height to 100vh and allow width overflow
      heroSection.style.height = '100vh';
      heroSection.style.width = `${windowWidth}px`;
      heroSection.style.backgroundSize = 'cover';
      heroSection.style.backgroundPosition = 'center';
    } else {
      // Otherwise, adjust height based on aspect ratio and keep width full
      heroSection.style.height = `${newHeight}px`;
      heroSection.style.width = '100%';
      heroSection.style.backgroundSize = 'contain';
      heroSection.style.backgroundPosition = 'center';
    }
  };
}

// Call the function on page load and resize
window.onload = setHeroHeight;
window.onresize = setHeroHeight;
