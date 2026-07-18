import axios from 'axios';

class MapboxService {
    constructor() {
        this.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
        this.directionsApiUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving';
    }

    /**
     * Fetch directions, ETA, Distance and Route Geometry between two points
     * @param {number} pickupLng 
     * @param {number} pickupLat 
     * @param {number} destLng 
     * @param {number} destLat 
     */
    async getRouteDetails(pickupLng, pickupLat, destLng, destLat) {
        if (!this.accessToken || this.accessToken === 'your_mapbox_token_here') {
            console.warn('Mapbox Access Token is missing or default. Simulating route details.');
            return {
                distance_km: 10.5,
                estimated_duration: 25, // minutes
                route_geometry: 'dummy_geometry_polyline'
            };
        }

        try {
            const coordinates = `${pickupLng},${pickupLat};${destLng},${destLat}`;
            const url = `${this.directionsApiUrl}/${coordinates}`;
            
            const response = await axios.get(url, {
                params: {
                    access_token: this.accessToken,
                    geometries: 'polyline',
                    overview: 'full'
                }
            });

            if (response.data.routes && response.data.routes.length > 0) {
                const route = response.data.routes[0];
                const distance_km = route.distance / 1000; // Mapbox returns meters
                const estimated_duration = Math.ceil(route.duration / 60); // Mapbox returns seconds, convert to minutes
                const route_geometry = route.geometry;

                return {
                    distance_km: parseFloat(distance_km.toFixed(2)),
                    estimated_duration,
                    route_geometry
                };
            }

            throw new Error('No routes found between the provided locations.');
        } catch (error) {
            console.error('Mapbox API Error:', error.response?.data || error.message);
            throw new Error('Failed to retrieve route details from Mapbox.');
        }
    }
}

export default new MapboxService();
