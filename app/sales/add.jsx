import { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, FlatList } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { InventoryService } from '../../src/services/InventoryService';
import { SaleService } from '../../src/services/SaleService';

export default function SalesScreen() {
    const router = useRouter();
    const [flowers, setFlowers] = useState([]);
    const [selectedFlower, setSelectedFlower] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [customer, setCustomer] = useState('');

    useFocusEffect(useCallback(() => {
        const loadData = async () => {
            const data = await InventoryService.getAllFlowers();
            const enriched = data.map(f => InventoryService.getWithFreshness(f));
            setFlowers(enriched);
        };
        loadData();
    }, []));

    const handleSale = async () => {
        if (!selectedFlower || !quantity) return Alert.alert('Error', 'Select flower and quantity');
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) return Alert.alert('Error', 'Invalid quantity');
        if (qty > selectedFlower.quantity) return Alert.alert('Error', 'Insufficient stock');

        try {
            await SaleService.processSale({
                sale_date: new Date().toISOString(),
                flower_id: selectedFlower.id,
                quantity_sold: qty,
                total_price: qty * selectedFlower.price,
                customer_name: customer
            });
            Alert.alert('Success', 'Sale recorded!', [{ text: 'OK', onPress: () => router.back() }]);
        } catch (e) {
            Alert.alert('Error', e.message);
        }
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedFlower?.id === item.id;
        return (
            <Pressable
                onPress={() => setSelectedFlower(item)}
                style={[styles.card, isSelected && styles.selectedCard]}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, isSelected && styles.selectedText]}>{item.name}</Text>
                    <Text style={[styles.price, isSelected && styles.selectedText]}>{item.price.toFixed(2)} dh</Text>
                </View>
                <View style={styles.subtitleRow}>
                    <View style={[styles.colorDot, { backgroundColor: item.color || '#ccc' }]} />
                    <Text style={[styles.subtitle, isSelected && styles.selectedText]}>{item.color} • {item.category}</Text>
                </View>

                <View style={[styles.stats, isSelected && { borderTopColor: 'rgba(255,255,255,0.3)' }]}>
                    <Text style={isSelected && styles.selectedText}>Qty: {item.quantity}</Text>
                    <Text style={{
                        color: isSelected ? 'white' : (item.freshnessPercentage < 40 ? 'red' : 'green'),
                        fontWeight: isSelected ? 'bold' : 'normal'
                    }}>
                        {item.freshnessLabel}
                    </Text>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.label}>Quantity:</Text>
                <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder="0"
                />

                <Text style={styles.label}>Customer Name (Optional):</Text>
                <TextInput
                    style={styles.input}
                    value={customer}
                    onChangeText={setCustomer}
                    placeholder="John Doe"
                />

                <Text style={styles.label}>Select Flower:</Text>

                {selectedFlower && quantity && (
                    <Text style={styles.total}>Total: {(selectedFlower.price * (parseInt(quantity) || 0)).toFixed(2)} dh</Text>
                )}

                <Pressable style={styles.btn} onPress={handleSale}>
                    <Text style={styles.btnText}>Process Sale</Text>
                </Pressable>
            </View>

            <View style={styles.listContainer}>
                <FlatList
                    data={flowers}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    listContainer: { flex: 1, padding: 15 },
    formContainer: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ddd', elevation: 4 },
    label: { fontWeight: 'bold', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, fontSize: 16, marginBottom: 15 },

    // Card Styles Copied & Adapted from Inventory
    card: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
        borderWidth: 2,
        borderColor: 'transparent'
    },
    selectedCard: {
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C'
    },
    selectedText: {
        color: 'white'
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

    btn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    total: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'right', color: '#4CAF50' }
});
