import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image }  from 'react-native';

const Paw = require('../../assets/images/paw.png');
const Profile = require('../../assets/images/profile.png');
const Document = require('../../assets/images/document.png');

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#1B4079',
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
                        <Image source={Paw} style = {{width: 32, height: 32}} resizeMode="contain"/>
                    ),
                }}
            />

            {/* 4. Information */}
            <Tabs.Screen
                name="info"
                options={{
                    title: 'Info',
                    tabBarIcon: ({ color, size }) => (
                        <Image source={Document} style = {{width: 32, height: 32}} resizeMode="contain"/>
                    ),
                }}  
            />
            
            {/* 3. Weekly Report */}
            <Tabs.Screen
                name="Profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Image source={Profile} style = {{width: 24, height: 24}} resizeMode="contain"/>
                    ),
                }}
            />

            
            
        </Tabs>
    );
}