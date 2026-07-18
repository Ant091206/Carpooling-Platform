const pool = require('../config/db');

class VehicleRepository {
    async create(vehicleData) {
        const { owner_id, vehicle_name, brand, model, registration_number, color, fuel_type, seat_capacity, is_default, vehicle_image } = vehicleData;
        const [result] = await pool.execute(
            `INSERT INTO vehicles (owner_id, vehicle_name, brand, model, registration_number, color, fuel_type, seat_capacity, is_default, vehicle_image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [owner_id, vehicle_name, brand, model, registration_number, color, fuel_type, seat_capacity, is_default || false, vehicle_image || null]
        );
        return result.insertId;
    }

    async findByRegistrationNumber(registration_number, excludeId = null) {
        let query = 'SELECT * FROM vehicles WHERE registration_number = ?';
        const params = [registration_number];
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        const [rows] = await pool.execute(query, params);
        return rows[0];
    }

    async findAllByOwnerId(owner_id) {
        const [rows] = await pool.execute(
            'SELECT * FROM vehicles WHERE owner_id = ? ORDER BY created_at DESC',
            [owner_id]
        );
        return rows;
    }

    async findByIdAndOwner(id, owner_id) {
        const [rows] = await pool.execute(
            'SELECT * FROM vehicles WHERE id = ? AND owner_id = ?',
            [id, owner_id]
        );
        return rows[0];
    }

    async update(id, updateData) {
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);

        if (fields.length === 0) return 0;

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        values.push(id);

        const [result] = await pool.execute(
            `UPDATE vehicles SET ${setClause} WHERE id = ?`,
            values
        );
        return result.affectedRows;
    }

    async delete(id, owner_id) {
        const [result] = await pool.execute(
            'DELETE FROM vehicles WHERE id = ? AND owner_id = ?',
            [id, owner_id]
        );
        return result.affectedRows;
    }

    async resetDefaultVehicle(owner_id) {
        const [result] = await pool.execute(
            'UPDATE vehicles SET is_default = FALSE WHERE owner_id = ? AND is_default = TRUE',
            [owner_id]
        );
        return result.affectedRows;
    }

    async setDefaultVehicle(id, owner_id) {
        const [result] = await pool.execute(
            'UPDATE vehicles SET is_default = TRUE WHERE id = ? AND owner_id = ?',
            [id, owner_id]
        );
        return result.affectedRows;
    }
}

module.exports = new VehicleRepository();
