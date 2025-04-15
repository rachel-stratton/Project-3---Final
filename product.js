// JavaScript with loading animation added

document.addEventListener("DOMContentLoaded", function () {
  const originDropdown = document.getElementById("origin-dropdown");
  const destinationDropdown = document.getElementById("destination-dropdown");
  const findFlightsButton = document.getElementById("find-flights");
  const flightResultsContainer = document.getElementById("flight-results");
  const paginationControls = document.getElementById("pagination-controls");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");
  const airportSearchBtn = document.getElementById("search-airport-code");
  const airportInput = document.getElementById("airport-code-input");
  const resultDisplay = document.getElementById("airport-code-result");
  const toggleViewBtn = document.getElementById("toggle-view");
  const cardContainer = document.getElementById("card-container");
  const flightTable = document.getElementById("flight-grid");
  const loadingIndicator = document.getElementById("loading-indicator");

  let isCardView = false;
  let airlinesData = [];
  let currentFlights = [];
  let currentPage = 1;
  const itemsPerPage = 6;

  resultDisplay.style.display = "none";
  paginationControls.style.display = "none";

  loadingIndicator.style.display = "block";

  fetch("./flights.json")
    .then((response) => response.json())
    .then((dataObject) => {
      airlinesData = dataObject.data.airlines;
      loadingIndicator.style.display = "none";

      const origins = new Set();
      const destinations = new Set();

      airlinesData.forEach((airline) => {
        if (airline.routes && Array.isArray(airline.routes)) {
          airline.routes.forEach((route) => {
            if (route.origin) origins.add(route.origin);
            if (route.destination) destinations.add(route.destination);
          });
        }
      });

      populateDropdown(originDropdown, Array.from(origins).sort());
      populateDropdown(destinationDropdown, ['All Destinations', ...Array.from(destinations).sort()]);

      findFlightsButton.addEventListener('click', () => {
        const selectedOrigin = originDropdown.value;
        const selectedDestination = destinationDropdown.value;

        if (selectedOrigin && selectedDestination) {
          let results;
          if (selectedDestination === 'All Destinations') {
            results = findFlightsFromOrigin(selectedOrigin);
          } else {
            results = findFlights(airlinesData, selectedOrigin, selectedDestination);
          }
          currentFlights = results;
          currentPage = 1;
          displayResults(currentFlights);
        } else {
          alert('Please select both origin and destination airports.');
        }
      });

      airportSearchBtn.addEventListener("click", () => {
        const code = airportInput.value.trim().toUpperCase();
        if (!code) {
          resultDisplay.textContent = "Please enter an airport code.";
          resultDisplay.style.display = "block";
          return;
        }

        let found = false;

        airlinesData.forEach((airline) => {
          if (airline.routes && Array.isArray(airline.routes)) {
            airline.routes.forEach((route) => {
              if (route.origin === code || route.destination === code) {
                const airportInfo = getAirportDetails(code);
                if (airportInfo) {
                  resultDisplay.textContent = `${code} - ${airportInfo.name}, ${airportInfo.state}`;
                } else {
                  resultDisplay.textContent = `${code} - Airport details found in flight data, but full info unavailable.`;
                }
                found = true;
              }
            });
          }
        });

        if (!found) {
          resultDisplay.textContent = "This airport is not currently being offered on our website. Check back soon for updates.";
        }

        resultDisplay.style.display = "block";
      });

      airportInput.addEventListener("input", function () {
        resultDisplay.style.display = "none";
      });

      prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          displayResults(currentFlights);
        }
      });

      nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(currentFlights.length / itemsPerPage);
        if (currentPage < totalPages) {
          currentPage++;
          displayResults(currentFlights);
        }
      });

      toggleViewBtn.addEventListener('click', () => {
        isCardView = !isCardView;
        flightTable.style.display = isCardView ? "none" : "table";
        cardContainer.style.display = isCardView ? "grid" : "none";
        toggleViewBtn.textContent = isCardView ? "Switch to Table View" : "Switch to Card View";
        displayResults(currentFlights);
      });
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      alert('Failed to load flight data. Please try again later.');
      loadingIndicator.style.display = "none";
    });

  function populateDropdown(dropdown, airports) {
    while (dropdown.options.length > 1) {
      dropdown.remove(1);
    }

    airports.forEach((airport) => {
      const option = document.createElement('option');
      option.value = airport;
      option.textContent = airport;
      dropdown.appendChild(option);
    });
  }

  function findFlights(airlinesData, origin, destination) {
    const flights = [];

    airlinesData.forEach((airline) => {
      if (airline.routes && Array.isArray(airline.routes)) {
        airline.routes.forEach((route) => {
          if (route.origin === origin && route.destination === destination) {
            const flightDetails = route.most_recent_flight || {};
            flights.push({
              airlineName: airline.name,
              airlineLogo: airline.logo,
              flightNumber: flightDetails.flight_number || 'N/A',
              routeId: route.route_id,
              origin: route.origin || 'N/A',
              destination: route.destination || 'N/A',
              departure: flightDetails.departure || 'N/A',
              arrival: flightDetails.arrival || 'N/A',
              aircraft: flightDetails.aircraft || 'N/A'
            });
          }
        });
      }
    });

    return flights;
  }

  function findFlightsFromOrigin(origin) {
    const flights = [];

    airlinesData.forEach((airline) => {
      if (airline.routes && Array.isArray(airline.routes)) {
        airline.routes.forEach((route) => {
          if (route.origin === origin) {
            const flightDetails = route.most_recent_flight || {};
            flights.push({
              airlineName: airline.name,
              airlineLogo: airline.logo,
              flightNumber: flightDetails.flight_number || 'N/A',
              routeId: route.route_id,
              origin: route.origin || 'N/A',
              destination: route.destination || 'N/A',
              departure: flightDetails.departure || 'N/A',
              arrival: flightDetails.arrival || 'N/A',
              aircraft: flightDetails.aircraft || 'N/A'
            });
          }
        });
      }
    });

    return flights;
  }

  function isRedEyeFlight(departureTime) {
    if (departureTime === 'N/A') return false;

    try {
      const depDate = new Date(departureTime);
      const depHour = depDate.getHours();
      return depHour >= 18 || depHour < 6;
    } catch (e) {
      console.error("Error parsing date:", e);
      return false;
    }
  }

  function displayResults(flights) {
    const thead = flightTable.querySelector("thead");
    const tbody = flightTable.querySelector("tbody");
    cardContainer.innerHTML = "";
    tbody.innerHTML = "";

    thead.innerHTML = `
      <tr>
        <th>Airline</th>
        <th>Flight Number</th>
        <th>Route ID</th>
        <th>Aircraft</th>
        <th>Departure</th>
        <th>Arrival</th>
      </tr>
    `;

    if (flights.length === 0) {
      paginationControls.style.display = "none";
      const row = document.createElement("tr");
      row.innerHTML = '<td colspan="6">No flights found</td>';
      tbody.appendChild(row);
      return;
    }

    const processedFlights = flights.map(flight => {
      const departureTime = flight.departure !== 'N/A' ? flight.departure : 'N/A';
      const arrivalTime = flight.arrival !== 'N/A' ? flight.arrival : 'N/A';

      return {
        ...flight,
        formattedDeparture: departureTime !== 'N/A' ? new Date(departureTime).toLocaleString() : 'N/A',
        formattedArrival: arrivalTime !== 'N/A' ? new Date(arrivalTime).toLocaleString() : 'N/A',
        isRedEye: isRedEyeFlight(departureTime)
      };
    });

    const totalPages = Math.ceil(processedFlights.length / itemsPerPage);
    if (processedFlights.length > itemsPerPage) {
      paginationControls.style.display = "block";
      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
      prevPageBtn.disabled = currentPage === 1;
      nextPageBtn.disabled = currentPage === totalPages;
    } else {
      paginationControls.style.display = "none";
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, processedFlights.length);
    const pageFlights = processedFlights.slice(startIndex, endIndex);

    if (isCardView) {
      pageFlights.forEach(flight => {
        const card = document.createElement("div");
        card.className = "flight-card";
        card.innerHTML = `
          <h3>${flight.airlineName}</h3>
          <p><strong>Flight:</strong> ${flight.flightNumber}</p>
          <p><strong>Route ID:</strong> ${flight.routeId}</p>
          <p><strong>Aircraft:</strong> ${flight.aircraft}</p>
          <p><strong>Departure:</strong> ${flight.formattedDeparture}</p>
          <p><strong>Arrival:</strong> ${flight.formattedArrival}</p>
        `;
        if (flight.isRedEye) {
          card.style.backgroundColor = "#ffdddd";
        }
        cardContainer.appendChild(card);
      });
    } else {
      pageFlights.forEach((flight, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${flight.airlineName}</td>
          <td>${flight.flightNumber}</td>
          <td>${flight.routeId}</td>
          <td>${flight.aircraft}</td>
          <td>${flight.formattedDeparture}</td>
          <td>${flight.formattedArrival}</td>
        `;
        row.style.backgroundColor = flight.isRedEye ? "#ff9999" : index % 2 === 0 ? "#ffffff" : "#f9f9f9";
        tbody.appendChild(row);
      });
    }
  }

  function getAirportDetails(code) {
    const airportDatabase = {
      AMS: { name: "Amsterdam Airport Schiphol", state: "North Holland" },
      ATL: { name: "Hartsfield-Jackson Atlanta International", state: "Georgia" },
      BKK: { name: "Suvarnabhumi Airport", state: "Bangkok" },
      BOM: { name: "Chhatrapati Shivaji Maharaj International", state: "Maharashtra" },
      BOS: { name: "Logan International Airport", state: "Massachusetts" },
      CLT: { name: "Charlotte Douglas International Airport", state: "North Carolina" },
      DEL: { name: "Indira Gandhi International Airport", state: "Delhi" },
      DEN: { name: "Denver International Airport", state: "Colorado" },
      DFW: { name: "Dallas/Fort Worth International", state: "Texas" },
      DTW: { name: "Detroit Metropolitan Wayne County", state: "Michigan" },
      DXB: { name: "Dubai International Airport", state: "Dubai" },
      FCO: { name: "Leonardo da Vinci–Fiumicino Airport", state: "Lazio" },
      FRA: { name: "Frankfurt am Main Airport", state: "Hesse" },
      GRU: { name: "São Paulo/Guarulhos International Airport", state: "São Paulo" },
      HND: { name: "Tokyo Haneda Airport", state: "Tokyo" },
      IAH: { name: "George Bush Intercontinental", state: "Texas" },
      ICN: { name: "Incheon International Airport", state: "Seoul" },
      IST: { name: "Istanbul Airport", state: "Istanbul" },
      JFK: { name: "John F. Kennedy International Airport", state: "New York" },
      LAS: { name: "Harry Reid International Airport", state: "Nevada" },
      LAX: { name: "Los Angeles International Airport", state: "California" },
      LGW: { name: "London Gatwick Airport", state: "England" },
      MAD: { name: "Adolfo Suárez Madrid–Barajas Airport", state: "Madrid" },
      MCO: { name: "Orlando International Airport", state: "Florida" },
      MEX: { name: "Mexico City International Airport", state: "Mexico City" },
      MIA: { name: "Miami International Airport", state: "Florida" },
      MEL: { name: "Melbourne Airport", state: "Victoria" },
      MUC: { name: "Munich Airport", state: "Bavaria" },
      NRT: { name: "Narita International Airport", state: "Chiba" },
      ORD: { name: "O'Hare International Airport", state: "Illinois" },
      PEK: { name: "Beijing Capital International Airport", state: "Beijing" },
      PVG: { name: "Shanghai Pudong International", state: "Shanghai" },
      SEA: { name: "Seattle–Tacoma International Airport", state: "Washington" },
      SFO: { name: "San Francisco International Airport", state: "California" },
      SIN: { name: "Singapore Changi Airport", state: "Singapore" },
      SYD: { name: "Sydney Kingsford Smith Airport", state: "New South Wales" },
      YVR: { name: "Vancouver International Airport", state: "British Columbia" },
      YYZ: { name: "Toronto Pearson International Airport", state: "Ontario" }
    };

    return airportDatabase[code] || null;
  }
});

