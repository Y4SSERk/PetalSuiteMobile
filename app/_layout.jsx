import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { initDatabase } from '../src/database/db';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await initDatabase();
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    useEffect(() => {
        if (appIsReady) {
            SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <>
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#DC143C', // Crimson-like from README
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    contentStyle: {
                        backgroundColor: '#f5f5f5',
                    }
                }}
            >
                <Stack.Screen name="index" options={{ title: 'PetalSuite Dashboard' }} />
                <Stack.Screen name="inventory/index" options={{ title: 'Inventory' }} />
                <Stack.Screen name="inventory/add" options={{ title: 'Add Flower' }} />
                <Stack.Screen name="inventory/[id]" options={{ title: 'Edit Flower' }} />
                <Stack.Screen name="suppliers/index" options={{ title: 'Suppliers' }} />
                <Stack.Screen name="suppliers/add" options={{ title: 'Add Supplier' }} />
                <Stack.Screen name="suppliers/[id]" options={{ title: 'Edit Supplier' }} />
                <Stack.Screen name="sales/index" options={{ title: 'Sales History' }} />
                <Stack.Screen name="sales/add" options={{ title: 'New Sale' }} />
            </Stack>
            <StatusBar style="light" />
        </>
    );
}
