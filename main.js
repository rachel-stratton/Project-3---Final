//  JavaScript for the marquee
document.addEventListener("DOMContentLoaded", function () {
  const marqueeContainer = document.getElementById("marquee-container");
  const marqueeElement = document.querySelector(".marquee");
  
  marqueeElement.innerHTML = 'Loading airline logos...';
  
  fetch("./flights.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((dataObject) => {
      if (!dataObject.data || !dataObject.data.airlines || !Array.isArray(dataObject.data.airlines)) {
        throw new Error("Unexpected API response format");
      }
      
      const airlinesData = dataObject.data.airlines;
      console.log(`Found ${airlinesData.length} airlines`);
      marqueeElement.innerHTML = '';
      
      let logoCount = 0;
      
      // Create first set of logos
      airlinesData.forEach((airline) => {
        if (airline.logo) {
          const img = document.createElement("img");
          img.src = airline.logo;
          img.alt = airline.name + " logo";
          img.className = "marquee__item";
          
          img.onerror = function () {
            console.warn(`Failed to load logo for: ${airline.name}`);
            this.style.display = 'none';
          };
          
          marqueeElement.appendChild(img);
          logoCount++;
        }
      });
      
      // Create duplicate set for seamless looping
      if (logoCount > 0) {
        // Clone all logos for the seamless loop
        const allLogos = document.querySelectorAll('.marquee__item');
        allLogos.forEach(logo => {
          const clone = logo.cloneNode(true);
          marqueeElement.appendChild(clone);
        });
      } else {
        throw new Error("No airline logos found in the data");
      }
      
      // Calculate the width of the original logos to set animation distance
      const totalWidth = Array.from(document.querySelectorAll('.marquee__item')).slice(0, logoCount)
        .reduce((total, img) => total + img.offsetWidth + 40, 0); // 40px is margin-right
      
      // Set the animation distance dynamically
      const styleSheet = document.styleSheets[document.styleSheets.length - 1];
      styleSheet.insertRule(`
        @keyframes marquee-animation {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${totalWidth}px); }
        }
      `, styleSheet.cssRules.length);
      
      console.log("Finished adding all airline logos for infinite loop");
    })
    .catch((error) => {
      console.error("Error with airline logos:", error);
      marqueeElement.innerHTML = `<p>Unable to load airline logos. Please try again later.</p>`;
    });
    
  // Plane animation code
  let planeTriggered = false;
  const flightLinks = document.querySelectorAll('a[href="product.html"]');
  const plane = document.getElementById("flying-plane");
  const planeSound = document.getElementById("plane-sound");
  
  flightLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      if (!planeTriggered) {
        e.preventDefault();
        
        plane.classList.add("animate");
        planeSound.currentTime = 1;
        planeSound.play();
        
        planeTriggered = true;
        
        setTimeout(() => {
          window.location.href = link.href;
        }, 2000);
      }
    });
  });
});