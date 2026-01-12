import { db } from '../database/db';

export const SupplierService = {
    async getAllSuppliers() {
        return await db.getAllAsync('SELECT * FROM suppliers ORDER BY name');
    },

    async addSupplier(supplier) {
        const result = await db.runAsync(
            'INSERT INTO suppliers (name, phone, email) VALUES (?, ?, ?)',
            [supplier.name, supplier.phone || null, supplier.email || null]
        );
        return result.lastInsertRowId;
    },

    async getSupplierById(id) {
        return await db.getFirstAsync('SELECT * FROM suppliers WHERE id = ?', [id]);
    },

    async updateSupplier(id, supplier) {
        const result = await db.runAsync(
            'UPDATE suppliers SET name = ?, phone = ?, email = ? WHERE id = ?',
            [supplier.name, supplier.phone || null, supplier.email || null, id]
        );
        return result.changes;
    },

    async deleteSupplier(id) {
        await db.runAsync('DELETE FROM suppliers WHERE id = ?', [id]);
    }
};
