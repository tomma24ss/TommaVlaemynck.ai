function setHeroHeight() {
  const image = new Image();
  image.src = './assets/images/backgroundmain.svg'; // Path to your background image
  image.onload = function() {
      const aspectRatio = image.width / image.height; // Get aspect ratio
      const windowWidth = window.innerWidth;
      const newHeight = windowWidth / aspectRatio; // Calculate height based on aspect ratio
      document.getElementById('hero').style.height = `${newHeight - 10}px`; // Set height of hero section
  };
}

// Call the function to set the hero section height on page load
window.onload = setHeroHeight;

// Optional: Update on window resize
window.onresize = setHeroHeight;