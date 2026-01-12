import { db } from '../database/db';
import { FreshnessService } from './FreshnessService';

export const InventoryService = {
    async getAllFlowers() {
        const rows = await db.getAllAsync('SELECT * FROM flowers ORDER BY name');
        return rows;
    },

    async addFlower(flower) {
        const result = await db.runAsync(
            'INSERT INTO flowers (name, color, category, price, quantity, arrival_date, freshness_days, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                flower.name,
                flower.color,
                flower.category,
                flower.price,
                flower.quantity,
                flower.arrival_date,
                flower.freshness_days,
                flower.supplier_id || null
            ]
        );
        return result.lastInsertRowId;
    },

    async updateFlower(id, flower) {
        const result = await db.runAsync(
            'UPDATE flowers SET name = ?, color = ?, category = ?, price = ?, quantity = ?, freshness_days = ?, supplier_id = ? WHERE id = ?',
            [
                flower.name,
                flower.color,
                flower.category,
                flower.price,
                flower.quantity,
                flower.freshness_days,
                flower.supplier_id || null,
                id
            ]
        );
        return result.changes;
    },

    async getFlowerById(id) {
        return await db.getFirstAsync('SELECT * FROM flowers WHERE id = ?', [id]);
    },

    async deleteFlower(id) {
        await db.runAsync('DELETE FROM flowers WHERE id = ?', [id]);
    },

    getWithFreshness(flower) {
        return {
            ...flower,
            freshnessLabel: FreshnessService.getFreshnessLabel(flower.arrival_date, flower.freshness_days),
            freshnessPercentage: FreshnessService.calculateFreshnessPercentage(flower.arrival_date, flower.freshness_days)
        };
    },
    async getUniqueCategories() {
        const rows = await db.getAllAsync('SELECT DISTINCT category FROM flowers WHERE category IS NOT NULL AND category != "" ORDER BY category');
        return rows.map(r => r.category);
    },

    async deleteCategory(category) {
        // "Deleting" a category effectively means un-assigning it from existing flowers
        await db.runAsync('UPDATE flowers SET category = NULL WHERE category = ?', [category]);
    }
};
