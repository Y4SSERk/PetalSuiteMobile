import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect, Link } from 'expo-router';
import { InventoryService } from '../../src/services/InventoryService';

export default function InventoryScreen() {
    const [flowers, setFlowers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Load data function
    const loadData = async () => {
        try {
            const data = await InventoryService.getAllFlowers();
            const enriched = data.map(f => InventoryService.getWithFreshness(f));
            setFlowers(enriched);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const renderItem = ({ item }) => (
        <Link href={`/inventory/${item.id}`} asChild>
            <Pressable style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.price}>{item.price.toFixed(2)} dh</Text>
                </View>
                <View style={styles.subtitleRow}>
                    <View style={[styles.colorDot, { backgroundColor: item.color || '#ccc' }]} />
                    <Text style={styles.subtitle}>{item.color} • {item.category}</Text>
                </View>

                <View style={styles.stats}>
                    <Text>Qty: {item.quantity}</Text>
                    <Text style={{ color: item.freshnessPercentage < 40 ? 'red' : 'green' }}>
                        {item.freshnessLabel}
                    </Text>
                </View>
            </Pressable>
        </Link>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={flowers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={<Text style={styles.empty}>No flowers found. Add some!</Text>}
            />

            <Link href="/inventory/add" asChild>
                <Pressable style={styles.fab}>
                    <Text style={styles.fabText}>+</Text>
                </Pressable>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    card: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 }
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#eee'
    },
    subtitle: {
        color: '#666',
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E91E63',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 10,
    },
    empty: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#E91E63',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        zIndex: 10
    },
    fabText: {
        color: 'white',
        fontSize: 30,
        marginTop: -2,
        fontWeight: 'bold'
    },
});
