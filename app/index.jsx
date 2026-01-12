import { Link, useRouter, useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { SaleService } from '../src/services/SaleService';
import { InventoryService } from '../src/services/InventoryService';
import { SupplierService } from '../src/services/SupplierService';

export default function Dashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ totalSales: 0, totalRevenue: 0, totalFlowers: 0, totalSuppliers: 0 });
    const [alerts, setAlerts] = useState([]);

    const loadStats = async () => {
        try {
            const [sales, flowers, suppliers] = await Promise.all([
                SaleService.getAllSales(),
                InventoryService.getAllFlowers(),
                SupplierService.getAllSuppliers()
            ]);

            const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_price, 0);
            setStats({
                totalSales: sales.length,
                totalRevenue: totalRevenue,
                totalFlowers: flowers.length,
                totalSuppliers: suppliers.length
            });

            // Generate Alerts
            const stockAlerts = flowers
                .filter(f => f.quantity === 0)
                .map(f => ({ type: 'stock', message: `msg`, flower: f.name }));

            setAlerts(stockAlerts);

        } catch (e) {
            console.error('Failed to load stats', e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const modules = [
        { name: 'Inventory', route: '/inventory', color: '#E91E63', icon: '📦' },
        { name: 'Suppliers', route: '/suppliers', color: '#9C27B0', icon: '🚚' },
        { name: 'New Sale', route: '/sales', color: '#4CAF50', icon: '💰' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Welcome to PetalSuite</Text>
                    <Text style={styles.subtitle}>Florist Management System</Text>
                </View>

                {/* Sales Stats Section */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Revenue</Text>
                        <Text style={styles.statValue}>{stats.totalRevenue.toFixed(2)} dh</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Sales</Text>
                        <Text style={styles.statValue}>{stats.totalSales}</Text>
                    </View>
                </View>

                <View style={[styles.statsContainer, { marginTop: -10 }]}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Flowers</Text>
                        <Text style={styles.statValue}>{stats.totalFlowers}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Suppliers</Text>
                        <Text style={styles.statValue}>{stats.totalSuppliers}</Text>
                    </View>
                </View>

                <View style={styles.grid}>
                    {modules.map((module) => (
                        <Link key={module.name} href={module.route} asChild>
                            <Pressable style={[styles.card, { borderLeftColor: module.color }]}>
                                <Text style={styles.cardIcon}>{module.icon}</Text>
                                <Text style={styles.cardTitle}>{module.name}</Text>
                            </Pressable>
                        </Link>
                    ))}
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Alerts</Text>
                    {alerts.length > 0 ? (
                        alerts.map((alert, index) => (
                            <View key={index} style={styles.alertCard}>
                                <Text style={styles.alertIcon}>⚠️</Text>
                                <View>
                                    <Text style={styles.alertText}>Out of Stock: <Text style={{ fontWeight: 'bold' }}>{alert.flower}</Text></Text>
                                    <Text style={styles.alertSub}>Please restocking immediately.</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.alertCard}>
                            <Text style={styles.alertIcon}>✅</Text>
                            <Text style={styles.alertText}>Nothing is out of stock.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        width: '48%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#DC143C',
        marginTop: 5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    card: {
        width: '47%',
        aspectRatio: 1,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 5,
    },
    cardIcon: {
        fontSize: 40,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    infoSection: {
        marginTop: 20,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    alertCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0', // Light orange background for warning
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 1
    },
    alertIcon: {
        fontSize: 24,
        marginRight: 15
    },
    alertText: {
        fontSize: 16,
        color: '#E65100', // Darker orange text
    },
    alertSub: {
        fontSize: 12,
        color: '#9E9E9E'
    }
});
