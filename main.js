document.addEventListener("DOMContentLoaded", function () {
    const marqueeContainer = document.getElementById("marquee-container");
    const marqueeElement = document.querySelector(".marquee");
  
    marqueeElement.innerHTML = '<div style="padding: 20px; text-align: center;">Loading airline logos...</div>';
  
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
            console.log(`Added logo for: ${airline.name}`);
          }
        });
  
        if (logoCount === 0) {
          throw new Error("No airline logos found in the data");
        }
  
        const marqueeContent = marqueeElement.innerHTML;
        marqueeElement.innerHTML += marqueeContent;
  
        console.log("Finished adding all airline logos and duplicated for infinite loop");
      })
      .catch((error) => {
        console.error("Error with airline logos:", error);
        marqueeElement.innerHTML = `<div style="padding: 20px; text-align: center;">Unable to load airline logos. Please try again later.</div>`;
      });
  
    // ✅ This block must be OUTSIDE the .catch() but inside DOMContentLoaded
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
  