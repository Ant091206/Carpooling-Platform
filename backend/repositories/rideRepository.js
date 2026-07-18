import { pool } from '../config/db.js';

class RideRepository {
    async create(rideData) {
        const {
            driver_id, vehicle_id, pickup_name, pickup_lng, pickup_lat,
            destination_name, dest_lng, dest_lat, departure_time,
            available_seats, fare_per_seat, distance_km, estimated_duration,
            route_geometry, is_recurring, notes
        } = rideData;

        // SRID 4326 for standard GPS coordinates
        const query = `
            INSERT INTO rides (
                driver_id, vehicle_id, pickup_name, pickup_location,
                destination_name, destination_location, departure_time,
                available_seats, fare_per_seat, distance_km, estimated_duration,
                route_geometry, is_recurring, notes
            ) VALUES (
                ?, ?, ?, ST_GeomFromText(?, 4326),
                ?, ST_GeomFromText(?, 4326), ?,
                ?, ?, ?, ?,
                ?, ?, ?
            )
        `;

        const pickupPoint = `POINT(${pickup_lng} ${pickup_lat})`;
        const destPoint = `POINT(${dest_lng} ${dest_lat})`;

        const [result] = await pool.execute(query, [
            driver_id, vehicle_id, pickup_name, pickupPoint,
            destination_name, destPoint, departure_time,
            available_seats, fare_per_seat, distance_km, estimated_duration,
            route_geometry, is_recurring || false, notes || null
        ]);

        return result.insertId;
    }

    async findById(id) {
        const query = `
            SELECT 
                r.*,
                ST_X(r.pickup_location) as pickup_lng,
                ST_Y(r.pickup_location) as pickup_lat,
                ST_X(r.destination_location) as dest_lng,
                ST_Y(r.destination_location) as dest_lat
            FROM rides r
            WHERE r.id = ?
        `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    async findAllByDriverId(driver_id) {
        const query = `
            SELECT 
                r.*,
                ST_X(r.pickup_location) as pickup_lng,
                ST_Y(r.pickup_location) as pickup_lat,
                ST_X(r.destination_location) as dest_lng,
                ST_Y(r.destination_location) as dest_lat
            FROM rides r
            WHERE r.driver_id = ?
            ORDER BY r.departure_time DESC
        `;
        const [rows] = await pool.execute(query, [driver_id]);
        return rows;
    }

    async updateStatus(id, driver_id, status) {
        const query = `UPDATE rides SET ride_status = ? WHERE id = ? AND driver_id = ?`;
        const [result] = await pool.execute(query, [status, id, driver_id]);
        return result.affectedRows;
    }

    async update(id, driver_id, updateData) {
        const fields = Object.keys(updateData);
        if (fields.length === 0) return 0;

        const values = Object.values(updateData);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        values.push(id, driver_id);

        const query = `UPDATE rides SET ${setClause} WHERE id = ? AND driver_id = ?`;
        const [result] = await pool.execute(query, values);
        return result.affectedRows;
    }

    async delete(id, driver_id) {
        const query = `DELETE FROM rides WHERE id = ? AND driver_id = ?`;
        const [result] = await pool.execute(query, [id, driver_id]);
        return result.affectedRows;
    }
}

export default new RideRepository();
