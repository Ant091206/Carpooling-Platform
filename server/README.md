# Enterprise Vehicle & Ride Publishing Module

This is the backend implementation containing the Vehicle Management Module (Module 4) and Ride Publishing Module (Module 5) for the Odoo Final Hackathon. It is designed following Clean Architecture and is built to be seamlessly integrated with the other modules once they are completed.

## Folder Structure

```
backend/
├── config/
│   └── db.js                 # MySQL database connection pool
├── controllers/
│   ├── rideController.js
│   └── vehicleController.js  # HTTP Request/Response handling
├── database/
│   ├── rides.sql
│   └── vehicles.sql          # Database creation script
├── middlewares/
│   ├── errorHandler.js       # Centralized error handling
│   ├── mockAuth.js           # Temporary authentication middleware
│   ├── upload.js             # Multer setup for image uploads
│   └── validate.js           # Express validator error formatter
├── models/
│   └── (Database queries are in repositories)
├── repositories/
│   ├── rideRepository.js
│   └── vehicleRepository.js  # SQL Queries
├── routes/
│   ├── rideRoutes.js
│   └── vehicleRoutes.js      # Express Routes & Validation rules
├── services/
│   ├── mapboxService.js      # Mapbox API integration
│   ├── rideService.js        # Ride business logic
│   └── vehicleService.js     # Vehicle business logic
├── uploads/
│   └── vehicles/             # Vehicle images storage
├── utils/
│   └── responseFormat.js     # Standard API response formatting
├── package.json
├── server.js
└── .env.example
```

## Installation & Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Database Setup:**
   Create a MySQL database and run the SQL script located in `database/vehicles.sql`.
   ```sql
   CREATE DATABASE odoo_hackathon;
   USE odoo_hackathon;
   SOURCE database/vehicles.sql;
   ```

3. **Environment Variables:**
   Rename `.env.example` to `.env` and configure your database credentials:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=odoo_hackathon
   ```

4. **Run the Server:**
   ```bash
   npm run dev
   ```

## API Documentation

Swagger API documentation is available at `http://localhost:3000/api-docs` when the server is running.

### API List

- `POST /vehicle` - Add a new vehicle
- `GET /vehicle` - Get all vehicles for the authenticated user
- `GET /vehicle/:id` - Get a vehicle by ID
- `PUT /vehicle/:id` - Update a vehicle by ID
- `DELETE /vehicle/:id` - Delete a vehicle by ID
- `PATCH /vehicle/default/:id` - Set a vehicle as default
- `POST /vehicle/upload` - Upload a vehicle image (multipart/form-data)

### Ride Publishing (Module 5)
- `POST /rides` - Publish a new ride (Geocodes via Mapbox)
- `GET /rides/my` - Get all published rides for the authenticated driver
- `GET /rides/:id` - Get ride details by ID
- `PUT /rides/:id` - Update an existing scheduled ride
- `DELETE /rides/:id` - Delete a scheduled ride
- `PATCH /rides/:id/start` - Mark ride as started
- `PATCH /rides/:id/complete` - Mark ride as completed
- `PATCH /rides/:id/cancel` - Cancel a ride

## Testing

A Postman collection `Odoo_Vehicle_Management.postman_collection.json` is provided in the root directory. Import it into Postman to test the APIs. Note that `mockAuth.js` is automatically injecting `req.user = { id: 1 }` so authentication is handled implicitly for now.

## Future Integration

When Module 1 (Authentication), Module 2 (User Profile), and Module 3 (Organization) are complete, integration will be seamless:

1. **Remove Mock Auth**: Delete `middlewares/mockAuth.js`.
2. **Inject Real Auth**: Replace `mockAuth` with the actual JWT middleware in `routes/vehicleRoutes.js`.
3. **Database Links**: Add a foreign key to the `vehicles` table linking `owner_id` to `users.id`.

**Zero Changes Required** in:
- Controllers
- Services
- Repositories
- Frontend API calls

The module is production-ready and fully modular.
