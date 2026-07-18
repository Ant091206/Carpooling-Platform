export const mapsService = {
  getAutocompleteSuggestions(input) {
    return new Promise((resolve) => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        // Fallback mock recommendations for demo stability
        const mockSuggestions = [
          { description: 'Indiranagar Metro Station, Bangalore', placeId: 'mock1', mainText: 'Indiranagar Metro Station' },
          { description: 'Whitefield ITPL Gate, Bangalore', placeId: 'mock2', mainText: 'Whitefield ITPL Gate' },
          { description: 'Koramangala Sony World Junction, Bangalore', placeId: 'mock3', mainText: 'Koramangala Sony World' },
          { description: 'Electronic City Phase 1 Toll, Bangalore', placeId: 'mock4', mainText: 'Electronic City Phase 1' }
        ];
        return resolve(mockSuggestions.filter(s => s.description.toLowerCase().includes(input.toLowerCase())));
      }
      
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions({ input, componentRestrictions: { country: 'IN' } }, (predictions, status) => {
        if (status === 'OK' && predictions) {
          resolve(predictions.map(p => ({
            description: p.description,
            placeId: p.place_id,
            mainText: p.structured_formatting.main_text
          })));
        } else {
          resolve([]);
        }
      });
    });
  },

  calculateRoute(origin, destination) {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        // Mock route distance/time fallback for testing
        return resolve({
          distance: '14.5 km',
          duration: '35 mins',
          originCoords: { lat: 12.9716, lng: 77.5946 },
          destCoords: { lat: 12.9668, lng: 77.7499 }
        });
      }

      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === 'OK') {
            const route = result.routes[0].legs[0];
            resolve({
              distance: route.distance.text,
              duration: route.duration.text,
              originCoords: { lat: route.start_location.lat(), lng: route.start_location.lng() },
              destCoords: { lat: route.end_location.lat(), lng: route.end_location.lng() },
              directions: result
            });
          } else {
            reject(new Error(`Failed to calculate route: ${status}`));
          }
        }
      );
    });
  },

  getCurrentLocation() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => {
            resolve({ lat: 12.9716, lng: 77.5946 }); // Default Bangalore Center
          }
        );
      } else {
        resolve({ lat: 12.9716, lng: 77.5946 });
      }
    });
  }
};

export default mapsService;
