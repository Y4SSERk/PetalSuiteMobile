import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SupplierService } from '../../src/services/SupplierService';

export default function AddSupplierScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const handleAdd = async () => {
        if (!name) return Alert.alert('Error', 'Name is required');
        try {
            await SupplierService.addSupplier({ name, phone, email });
            Alert.alert('Success', 'Supplier added', [{ text: 'OK', onPress: () => router.back() }]);
        } catch (e) {
            Alert.alert('Error', 'Failed to add supplier');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Supplier Name" />
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone Number" keyboardType="phone-pad" />
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" />
            </View>
            <Pressable style={styles.btn} onPress={handleAdd}>
                <Text style={styles.btnText}>Save Supplier</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'white' },
    formGroup: { marginBottom: 15 },
    label: { marginBottom: 5, fontWeight: '600', color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16 },
    btn: { backgroundColor: '#9C27B0', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
