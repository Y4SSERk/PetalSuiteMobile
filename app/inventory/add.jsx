import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { InventoryService } from '../../src/services/InventoryService';
import { SupplierService } from '../../src/services/SupplierService';

// Generate a rich color grid similar to the reference image
const generateColorGrid = () => {
    const grid = [];

    // 1. Grayscale Row (White to Black)
    const grayScale = [];
    for (let i = 0; i <= 10; i++) {
        const l = 100 - (i * 10);
        grayScale.push(`hsl(0, 0%, ${l}%)`);
    }
    grid.push(grayScale);

    // 2. Color Spectrum Grid
    // 12 Hues (360 / 12 = 30 degree steps)
    // 8 Rows of Lightness/Saturation variations
    for (let row = 0; row < 7; row++) {
        const rowColors = [];
        const l = 90 - (row * 10); // Lightness from 90% down to 30%
        const s = row < 3 ? 100 : 90; // High saturation for top rows

        for (let col = 0; col < 12; col++) {
            const h = col * 30;
            rowColors.push(`hsl(${h}, ${s}%, ${l}%)`);
        }
        grid.push(rowColors);
    }

    return grid;
};

const COLOR_GRID = generateColorGrid();

export default function AddFlowerScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [color, setColor] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [freshnessDays, setFreshnessDays] = useState('');

    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState(null);

    const [categories, setCategories] = useState([]);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // For custom category input
    const [customCategory, setCustomCategory] = useState('');
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [sup, cats] = await Promise.all([
            SupplierService.getAllSuppliers(),
            InventoryService.getUniqueCategories()
        ]);
        setSuppliers(sup);
        setCategories(cats);
    };

    const handleAdd = async () => {
        const finalCategory = isCustomCategory ? customCategory : category;

        if (!name || !price || !quantity || !freshnessDays || !color || !finalCategory) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        try {
            await InventoryService.addFlower({
                name,
                color,
                category: finalCategory,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                arrival_date: new Date().toISOString(),
                freshness_days: parseInt(freshnessDays),
                supplier_id: selectedSupplierId
            });
            Alert.alert('Success', 'Flower added to inventory', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to add flower');
        }
    };

    const ColorPickerModal = () => (
        <Modal visible={showColorPicker} transparent animationType="fade">
            <Pressable style={styles.modalOverlay} onPress={() => setShowColorPicker(false)}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Color</Text>

                    <View style={styles.gridContainer}>
                        {COLOR_GRID.map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.gridRow}>
                                {row.map((c, colIndex) => (
                                    <Pressable
                                        key={`${rowIndex}-${colIndex}`}
                                        style={[
                                            styles.gridSwatch,
                                            { backgroundColor: c },
                                            color === c && styles.selectedSwatch
                                        ]}
                                        onPress={() => { setColor(c); setShowColorPicker(false); }}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>

                    <View style={styles.previewRow}>
                        <Text>Selected: </Text>
                        <View style={[styles.previewSwatch, { backgroundColor: color || 'transparent' }]} />
                    </View>
                </View>
            </Pressable>
        </Modal>
    );

    const handleDeleteCategory = async (categoryToDelete) => {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to remove "${categoryToDelete}"? This will uncategorize all matching flowers.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await InventoryService.deleteCategory(categoryToDelete);
                            loadData(); // Reload categories
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete category');
                        }
                    }
                }
            ]
        );
    };

    const CategoryPickerModal = () => (
        <Modal visible={showCategoryPicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Category</Text>
                    {categories.length > 0 && (
                        <FlatList
                            data={categories}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <View style={styles.categoryRow}>
                                    <Pressable style={styles.categoryTextContainer} onPress={() => { setCategory(item); setIsCustomCategory(false); setShowCategoryPicker(false); }}>
                                        <Text style={styles.modalItemText}>{item}</Text>
                                    </Pressable>
                                    <Pressable style={styles.deleteIcon} onPress={() => handleDeleteCategory(item)}>
                                        <Text>🗑️</Text>
                                    </Pressable>
                                </View>
                            )}
                        />
                    )}
                    <Pressable style={styles.modalItem} onPress={() => { setIsCustomCategory(true); setShowCategoryPicker(false); }}>
                        <Text style={[styles.modalItemText, { color: '#E91E63', fontWeight: 'bold' }]}>+ Add New Category</Text>
                    </Pressable>
                    <Pressable style={styles.closeBtn} onPress={() => setShowCategoryPicker(false)}>
                        <Text style={styles.closeBtnText}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Rose, Tulip, etc." />
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Color *</Text>
                    <Pressable style={[styles.input, styles.pickerInput]} onPress={() => setShowColorPicker(true)}>
                        {color ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: color, marginRight: 10, borderWidth: 1, borderColor: '#eee' }} />
                                <Text>{color}</Text>
                            </View>
                        ) : (
                            <Text style={{ color: '#999' }}>Pick Color</Text>
                        )}
                    </Pressable>
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Category *</Text>
                    {isCustomCategory ? (
                        <TextInput
                            style={styles.input}
                            value={customCategory}
                            onChangeText={setCustomCategory}
                            placeholder="Type Category"
                            autoFocus
                        />
                    ) : (
                        <Pressable style={[styles.input, styles.pickerInput]} onPress={() => setShowCategoryPicker(true)}>
                            <Text style={{ color: category ? '#000' : '#999' }}>{category || 'Select Category'}</Text>
                        </Pressable>
                    )}
                </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Price (dh) *</Text>
                    <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0.00" />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Quantity *</Text>
                    <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="0" />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Freshness (Days) *</Text>
                <TextInput style={styles.input} value={freshnessDays} onChangeText={setFreshnessDays} keyboardType="numeric" placeholder="e.g. 7" />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Supplier</Text>
                <View style={styles.supplierList}>
                    {suppliers.map(s => (
                        <Pressable
                            key={s.id}
                            style={[styles.supplierChip, selectedSupplierId === s.id && styles.selectedChip]}
                            onPress={() => setSelectedSupplierId(s.id)}
                        >
                            <Text style={[styles.chipText, selectedSupplierId === s.id && { color: 'white' }]}>{s.name}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <Pressable style={styles.button} onPress={handleAdd}>
                <Text style={styles.buttonText}>Add Flower</Text>
            </Pressable>

            <ColorPickerModal />
            <CategoryPickerModal />

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flex: 1 },
    formGroup: { marginBottom: 15 },
    label: { marginBottom: 5, fontWeight: '600', color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, height: 50 },
    pickerInput: { justifyContent: 'center' },
    row: { flexDirection: 'row' },
    button: { backgroundColor: '#E91E63', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    supplierList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    supplierChip: { padding: 8, borderWidth: 1, borderColor: '#E91E63', borderRadius: 20 },
    selectedChip: { backgroundColor: '#E91E63' },
    chipText: { color: '#E91E63' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 12, width: '90%', maxHeight: '80%', elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },

    // Grid Styles
    gridContainer: { flexDirection: 'column', gap: 2 },
    gridRow: { flexDirection: 'row', justifyContent: 'center', gap: 2 },
    gridSwatch: { width: 25, height: 25, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)' },
    selectedSwatch: { borderWidth: 2, borderColor: 'white', borderRadius: 4, transform: [{ scale: 1.2 }], zIndex: 10, shadowColor: '#000', shadowRadius: 2, shadowOpacity: 0.5 },

    previewRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, justifyContent: 'center' },
    previewSwatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginLeft: 10 },

    modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    categoryRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
    categoryTextContainer: { flex: 1, padding: 15 },
    deleteIcon: { padding: 15 },
    modalItemText: { fontSize: 16 },
    closeBtn: { marginTop: 15, padding: 10, alignItems: 'center' },
    closeBtnText: { color: '#666', fontWeight: 'bold' }
});
