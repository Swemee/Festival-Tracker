let eventForm = document.getElementById("eventForm");
let mainPage = document.getElementById("mainPage");
let selectedEvents = document.getElementById("selectedEvents");

// Hide the reset button initially
let resetBtn = document.getElementById("resetBtn");
resetBtn.style.display = "none";

let searchBtn = document.querySelector("[data-modal-toggle='tracker-modal']");

// Clear button on click event
resetBtn.onclick = function() {
    selectedEvents.innerHTML = "";
    searchBtn.style.display = "block"; 
    resetBtn.style.display = "none"; 
}

// Convert the location submitted to Latitude and Longitude
async function getLatLong() {
    let getCity = document.getElementById("location").value;
    let getState = document.getElementById("state").value;

    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${getCity + ', ' + getState}&key=AIzaSyBNIIomFvvvMkhvigkrfJu0hVabuav04jQ`);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
        const latlongLocation = data.results[0].geometry.location;
        // Return the latitude and longitude so that it can be grabbed from other functions
        return {
            latitude: latlongLocation.lat,
            longitude: latlongLocation.lng
        }
    } else {
        console.error('Unable to fetch coordinates');
    }
}

// Event form submission
eventForm.onsubmit = async function(event) {
    event.preventDefault();

    const {latitude, longitude} = await getLatLong();

    let location = document.getElementById("location").value;
    let state = document.getElementById("state").value;
    let date = document.getElementById("date").value;

    // Save the search query in local storage
    saveSearch(location, state, date);

    // Fetch events from Ticketmaster API
    fetch(`https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&apikey=vPcBytlSIXMMaAICmG6wPiMssr9MxzF7&latlong=${latitude},${longitude}&startDateTime=${date}T00:00:00Z&endDateTime=${date}T23:59:59Z`)        
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data._embedded && data._embedded.events && data._embedded.events.length > 0) {
                displayEvents(data._embedded.events);
            } else {
                displayNoEventsFound();
            }
            // Close the modal upon successful submission
            document.querySelector("[data-modal-hide='tracker-modal']").click();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    displayRecentSearches();
}

// Function to save search in local storage
function saveSearch(location, state, date) {
    let searches = JSON.parse(localStorage.getItem("searches")) || [];
    searches.unshift({ location, state, date });
    localStorage.setItem("searches", JSON.stringify(searches));
}

// Function to display recent searches under the "Search" button
function displayRecentSearches() {
    let searches = JSON.parse(localStorage.getItem("searches")) || [];
    let recentSearchesList = document.getElementById("recentSearches");
    recentSearchesList.innerHTML = "";

    let recentSearches = [];

    searches.forEach(function(search) {
        // Check if the search already exists in the recent search array
        if (!recentSearches.some(function(existingSearch) {
            return existingSearch.location === search.location &&
                existingSearch.state === search.state &&
                existingSearch.date === search.date;
        })) {
            recentSearches.push(search);
        }
    });

    // Update local storage with the recent search array
    localStorage.setItem("searches", JSON.stringify(recentSearches));

    // Display the recent searches
    recentSearches.forEach(function(search) {
        let listItem = document.createElement("li");
        let button = document.createElement("button");
        button.textContent = `Location: ${search.location}, State: ${search.state}, Date: ${search.date}`;
        button.classList.add("recent-search-button", "btn","border", "text-white", "bg-black", "text-md", "p-5", "rounded", "mb-3");
        button.addEventListener("click", function() {
            // Set input values with the recent search criteria
            document.getElementById("location").value = search.location;
            document.getElementById("state").value = search.state;
            document.getElementById("date").value = search.date;
            
            // Trigger the event search function by form submission
            eventForm.dispatchEvent(new Event('submit', { cancelable: true }));
        });
        listItem.appendChild(button);
        recentSearchesList.appendChild(listItem);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    centerRecentSearches();
});

// Center the recent search list vertically on the page
function centerRecentSearches() {
    let recentSearchesList = document.getElementById("recentSearchesList");
    recentSearchesList.style.textAlign = "center";
}

// Function call to center recent search list when the page loads
window.addEventListener("load", centerRecentSearches);

// Function to clear recent searches
function clearRecentSearches() {
    localStorage.removeItem("searches");
    displayRecentSearches();
}

// Display events on the main page
function displayEvents(events) {
    selectedEvents.innerHTML = "";
    let container = document.createElement("div");

    // Add a class to the container for styling
    container.classList.add("button-container"); 
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))";
    container.style.gap = "20px";

    events.forEach(function(event) {
        let eventContainer = document.createElement("div");
        eventContainer.classList.add("event-container");
        eventContainer.style.display = "grid";
        eventContainer.style.gridTemplateColumns = "1fr";
        eventContainer.style.gap = "10px";

        let button = document.createElement("button");
        button.classList.add("text-white", "bg-gradient-to-br", "from-pink-500", "to-orange-400", "hover:bg-gradient-to-bl", "focus:ring-4", "focus:outline-none", "focus:ring-pink-200",
            "dark:focus:ring-pink-800", "font-medium", "rounded-lg", "text-sm", "px-5", "py-2.5", "text-center", "me-2", "mb-2", "hover:text-black");
        button.textContent = `${event.name} - ${event.dates.start.localTime}`;

        let image = document.createElement("img");
        image.setAttribute("src", event.images[0].url);
        image.classList.add("h-52", "w-52")

        button.addEventListener("click", function() {
            // Show Google Maps location
            showGoogleMapLocation(event._embedded.venues[0].location.latitude, event._embedded.venues[0].location.longitude);
        });

        eventContainer.appendChild(image);
        eventContainer.appendChild(button);
        container.appendChild(eventContainer);
    });

    // Show the clear button when events are displayed
    selectedEvents.appendChild(container);
    resetBtn.style.display = "block"; 
}

// Display message if no events are found
function displayNoEventsFound() {
    selectedEvents.innerHTML = "No events found for the selected location and date.";
    resetBtn.style.display = "none";
}

// Show Google Maps location
function showGoogleMapLocation(latitude, longitude) {
    let mapFrame = document.createElement("iframe");
    mapFrame.setAttribute("src", `https://www.google.com/maps/embed/v1/view?key=AIzaSyBNIIomFvvvMkhvigkrfJu0hVabuav04jQ&center=${latitude},${longitude}&zoom=17`);
    let markerUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=17&t=&output=embed`;
    mapFrame.setAttribute("src", markerUrl);
    mapFrame.setAttribute("width", "600");
    mapFrame.setAttribute("height", "450");
    mapFrame.setAttribute("allowfullscreen", "");
    mapFrame.style.margin = "auto";
    selectedEvents.innerHTML = "";
    selectedEvents.appendChild(mapFrame);
    resetBtn.style.display = "block";
}