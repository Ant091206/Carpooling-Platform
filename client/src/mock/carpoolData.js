export const savedPlaces = [
  { id: 1, name: 'Home', address: 'Green Glen Apartments, Sector 62', tag: 'Daily pickup' },
  { id: 2, name: 'Office', address: 'Acme Tech Park, Tower B', tag: 'Primary campus' },
  { id: 3, name: 'Metro Station', address: 'City Center Metro Gate 3', tag: 'Backup stop' },
];

export const vehicles = [
  { id: 'veh-1', model: 'Hyundai Aura', reg: 'KA 03 MR 8421', seats: 3, fuel: 'CNG' },
  { id: 'veh-2', model: 'Tata Nexon EV', reg: 'KA 05 EV 2034', seats: 4, fuel: 'Electric' },
];

export const availableRides = [
  { id: 'ride-1', driver: 'Ananya Rao', rating: 4.9, vehicle: 'Tata Nexon EV', from: 'Indiranagar', to: 'Acme Tech Park', time: '08:15 AM', seats: 2, fare: 120, status: 'Available' },
  { id: 'ride-2', driver: 'Rohan Mehta', rating: 4.8, vehicle: 'Hyundai Aura', from: 'HSR Layout', to: 'Acme Tech Park', time: '08:35 AM', seats: 3, fare: 95, status: 'Fastest' },
  { id: 'ride-3', driver: 'Mira Thomas', rating: 4.7, vehicle: 'Maruti Baleno', from: 'Whitefield', to: 'Acme Tech Park', time: '09:00 AM', seats: 1, fare: 110, status: 'Low fare' },
];

export const trips = [
  { id: 'trip-1', role: 'Passenger', driver: 'Ananya Rao', passenger: 'You', route: 'Indiranagar to Acme Tech Park', date: 'Today', time: '08:15 AM', status: 'Booked', fare: 120, vehicle: 'Tata Nexon EV', reg: 'KA 05 EV 2034' },
  { id: 'trip-2', role: 'Driver', driver: 'You', passenger: '3 colleagues', route: 'Acme Tech Park to HSR Layout', date: 'Today', time: '06:20 PM', status: 'Payment Pending', fare: 280, vehicle: 'Hyundai Aura', reg: 'KA 03 MR 8421' },
  { id: 'trip-3', role: 'Passenger', driver: 'Rohan Mehta', passenger: 'You', route: 'City Center Metro to Acme Tech Park', date: 'Tomorrow', time: '08:40 AM', status: 'Started', fare: 90, vehicle: 'Hyundai Aura', reg: 'KA 03 MR 8421' },
];

export const history = [
  { id: 'h1', route: 'Koramangala to Acme Tech Park', date: 'Jul 15, 2026', status: 'Completed', distance: 14.2, fare: 105 },
  { id: 'h2', route: 'Acme Tech Park to Indiranagar', date: 'Jul 14, 2026', status: 'Completed', distance: 12.7, fare: 120 },
  { id: 'h3', route: 'HSR Layout to Acme Tech Park', date: 'Jul 11, 2026', status: 'Completed', distance: 10.9, fare: 95 },
];

export const analytics = [
  { label: 'Mon', trips: 8, distance: 84, cost: 760 },
  { label: 'Tue', trips: 11, distance: 118, cost: 980 },
  { label: 'Wed', trips: 9, distance: 92, cost: 820 },
  { label: 'Thu', trips: 13, distance: 136, cost: 1120 },
  { label: 'Fri', trips: 15, distance: 154, cost: 1260 },
];
