import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SupplierService } from '../../src/services/SupplierService';

export default function EditSupplierScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const supplier = await SupplierService.getSupplierById(id);
            if (supplier) {
                setName(supplier.name);
                setPhone(supplier.phone || '');
                setEmail(supplier.email || '');
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to load supplier');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!name) return Alert.alert('Error', 'Name is required');
        try {
            await SupplierService.updateSupplier(id, { name, phone, email });
            Alert.alert('Success', 'Supplier updated', [{ text: 'OK', onPress: () => router.back() }]);
        } catch (e) {
            Alert.alert('Error', 'Failed to update supplier');
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Confirm Delete',
            'Delete this supplier? This may affect linked flowers.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await SupplierService.deleteSupplier(id);
                            router.back();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete supplier');
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#9C27B0" /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Edit Supplier</Text>
                <Pressable onPress={handleDelete}>
                    <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <Pressable style={styles.btn} onPress={handleUpdate}>
                <Text style={styles.btnText}>Update Supplier</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'white' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    deleteText: { color: 'red', fontSize: 16, fontWeight: '600' },
    formGroup: { marginBottom: 15 },
    label: { marginBottom: 5, fontWeight: '600', color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16 },
    btn: { backgroundColor: '#9C27B0', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
