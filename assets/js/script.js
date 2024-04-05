// Event form
let eventForm = document.getElementById("eventForm");
// Main page
let mainPage = document.getElementById("mainPage");
// Selected events list
let selectedEvents = document.getElementById("selectedEvents");
// Reset button
let resetBtn = document.getElementById("resetBtn");

// Reset button functionality
resetBtn.onclick = function() {
    selectedEvents.innerHTML = ""; // Clear selected events
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
    event.preventDefault(); // Prevent default form submission

    const {latitude, longitude} = await getLatLong();

    let location = document.getElementById("location").value;
    let state = document.getElementById("state").value;
    let date = document.getElementById("date").value;

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
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

}

// Display events on the main page
function displayEvents(events) {
    selectedEvents.innerHTML = ""; // Clear previous results
    events.forEach(function(event) {
        let button = document.createElement("button");
        button.classList.add("text-white", "bg-gradient-to-br", "from-pink-500", "to-orange-400", "hover:bg-gradient-to-bl", "focus:ring-4", "focus:outline-none", "focus:ring-pink-200", 
        "dark:focus:ring-pink-800", "font-medium", "rounded-lg", "text-sm", "px-5", "py-2.5", "text-center", "me-2", "mb-2");        
        button.textContent = `${event.name} - ${event.dates.start.localTime}`;
        let image = document.createElement("img");
        image.setAttribute("src", event.images[0].url);
        button.addEventListener("click", function() {
            // Show Google Maps location
            showGoogleMapLocation(event._embedded.venues[0].location.latitude, event._embedded.venues[0].location.longitude);
        });
        selectedEvents.appendChild(button);
        selectedEvents.appendChild(image);
    });
}

// Display message if no events are found
function displayNoEventsFound() {
    selectedEvents.innerHTML = "No events found for the selected location and date.";
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
    selectedEvents.innerHTML = ""; // Clear previous results
    selectedEvents.appendChild(mapFrame);

}


