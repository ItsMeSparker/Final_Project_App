import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#e05c5c',
                tabBarInactiveTintColor: '#888',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f0f0f0',
                    height: 80,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
            }}
        >
            {/* 1. First Tab: Rabbits (Default landing screen) */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Rabbits',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="paw" size={size} color={color} />
                    ),
                }}
            />

            {/* 2. Quick Scan */}
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Quick Scan',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="scan-circle-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* 3. Weekly Report */}
            <Tabs.Screen
                name="weekly"
                options={{
                    title: 'Weekly',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* 4. Information */}
            <Tabs.Screen
                name="info"
                options={{
                    title: 'Info',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="information-circle-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}