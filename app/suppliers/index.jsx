import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect, Link } from 'expo-router';
import { SupplierService } from '../../src/services/SupplierService';

export default function SuppliersScreen() {
    const [suppliers, setSuppliers] = useState([]);

    const loadData = async () => {
        const data = await SupplierService.getAllSuppliers();
        setSuppliers(data);
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    return (
        <View style={styles.container}>
            <FlatList
                data={suppliers}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <Link href={`/suppliers/${item.id}`} asChild>
                        <Pressable style={styles.card}>
                            <Text style={styles.name}>{item.name}</Text>
                            {item.phone && <Text style={styles.details}>{item.phone}</Text>}
                            {item.email && <Text style={styles.details}>{item.email}</Text>}
                        </Pressable>
                    </Link>
                )}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={<Text style={styles.empty}>No suppliers found.</Text>}
            />

            <Link href="/suppliers/add" asChild>
                <Pressable style={styles.fab}>
                    <Text style={styles.fabText}>+</Text>
                </Pressable>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    card: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 8, elevation: 1 },
    name: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    details: { color: '#666' },
    empty: { textAlign: 'center', marginTop: 50, color: '#999' },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#9C27B0',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6
    },
    fabText: { color: 'white', fontSize: 30, marginTop: -2, fontWeight: 'bold' }
});
