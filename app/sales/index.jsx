import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect, Link } from 'expo-router';
import { SaleService } from '../../src/services/SaleService';

export default function SalesListScreen() {
    const [sales, setSales] = useState([]);

    const loadData = async () => {
        try {
            const data = await SaleService.getAllSales();
            setSales(data);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.date}>{new Date(item.sale_date).toLocaleDateString()} {new Date(item.sale_date).toLocaleTimeString()}</Text>
                <Text style={styles.price}>{item.total_price.toFixed(2)} dh</Text>
            </View>
            <View style={styles.details}>
                <Text style={styles.detailText}>Qty: {item.quantity_sold}</Text>
                {item.customer_name && <Text style={styles.customer}>👤 {item.customer_name}</Text>}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={sales}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={<Text style={styles.empty}>No sales recorded yet.</Text>}
            />

            <Link href="/sales/add" asChild>
                <Pressable style={styles.fab}>
                    <Text style={styles.fabText}>+</Text>
                </Pressable>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    card: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 8, elevation: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    date: { color: '#666', fontSize: 14 },
    price: { fontWeight: 'bold', fontSize: 16, color: '#4CAF50' },
    details: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    detailText: { fontSize: 16, fontWeight: '500' },
    customer: { color: '#666', fontStyle: 'italic' },
    empty: { textAlign: 'center', marginTop: 50, color: '#999' },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#4CAF50',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6
    },
    fabText: { color: 'white', fontSize: 30, marginTop: -2, fontWeight: 'bold' }
});
