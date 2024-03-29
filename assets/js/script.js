    
    
    


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