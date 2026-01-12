import { db } from '../database/db';

export const SaleService = {
    async getAllSales() {
        return await db.getAllAsync('SELECT * FROM sales ORDER BY sale_date DESC');
    },

    async processSale(sale) {
        // Transaction to ensure atomicity
        await db.withTransactionAsync(async () => {
            // 1. Check stock
            const flower = await db.getFirstAsync('SELECT * FROM flowers WHERE id = ?', [sale.flower_id]);

            if (!flower) {
                throw new Error('Flower not found');
            }

            if (flower.quantity < sale.quantity_sold) {
                throw new Error(`Insufficient stock. Available: ${flower.quantity}`);
            }

            // 2. Insert Sale
            await db.runAsync(
                'INSERT INTO sales (sale_date, flower_id, quantity_sold, total_price, customer_name) VALUES (?, ?, ?, ?, ?)',
                [sale.sale_date, sale.flower_id, sale.quantity_sold, sale.total_price, sale.customer_name || null]
            );

            // 3. Update Stock
            await db.runAsync(
                'UPDATE flowers SET quantity = quantity - ? WHERE id = ?',
                [sale.quantity_sold, sale.flower_id]
            );

            // 4. Trigger Low Stock Alert (Simplified check)
            const newQuantity = flower.quantity - sale.quantity_sold;
            if (newQuantity < 10) { // Threshold 10
                await db.runAsync(
                    'INSERT INTO stock_alerts (flower_id, alert_type, severity, message, generated_date) VALUES (?, ?, ?, ?, ?)',
                    [flower.id, 'LOW_STOCK', 'WARNING', `Low stock for ${flower.name}. Only ${newQuantity} remaining.`, new Date().toISOString()]
                );
            }
        });
    },
};
