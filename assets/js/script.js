// Open modal button
let openModalBtn = document.getElementById("openModalBtn");
// Close modal button
let closeModalBtn = document.getElementsByClassName("close")[0];
// Modal
let modal = document.getElementById("myModal");
// Event form
let eventForm = document.getElementById("eventForm");
// Main page
let mainPage = document.getElementById("mainPage");
// Selected events list
let selectedEvents = document.getElementById("selectedEvents");
// Reset button
let resetBtn = document.getElementById("resetBtn");

let location = document.getElementById("location").value;
let date = document.getElementById("date").value;

    // Fetch events from Ticketmaster API
    fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=vPcBytlSIXMMaAICmG6wPiMssr9MxzF7&city=${encodeURIComponent(location)}&startDateTime=${date}T00:00:00Z`)
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

// Open modal
openModalBtn.onclick = function() {
    modal.style.display = "block";
}
// Close modal
closeModalBtn.onclick = function() {
    modal.style.display = "none";
}
// Close modal when clicking outside the modal
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
// Reset button functionality
resetBtn.onclick = function() {
    selectedEvents.innerHTML = ""; // Clear selected events
}
// Event form submission
eventForm.onsubmit = function(event) {
    event.preventDefault(); // Prevent default form submission
}