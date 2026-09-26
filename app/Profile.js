import React, { useContext } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

const background = require('../assets/images/Background_1.png');
const Rabbit = require('../assets/images/Bunny_Logo.png');

const Profile = () => {
    const router = useRouter();
    const { user } = useContext(AuthContext); // Make sure your AuthContext exposes a 'user' object

    return (
        <ImageBackground
            source={background}
            resizeMode="cover"
            style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80 }}
        >
            <Stack.Screen
                options={{
                    headerStyle: { backgroundColor: 'transparent' },
                    headerTransparent: true,
                    headerTitle: "Profile",
                    headerTitleStyle: { color: '#fff', fontWeight: 'bold' },
                    headerTintColor: '#fff',
                }}
            />

            {/* Profile Avatar */}
            <View style={styles.avatarContainer}>
                <Ionicons name="person-circle-outline" size={100} color="white" />
            </View>

            {/* User Info Card */}
            <View style={styles.card}>

                

                {/* Email */}
                <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={22} color="#555" />
                    <View style={styles.infoText}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{user?.email ?? 'N/A'}</Text>
                    </View>
                </View>

                {/* Add more fields here as needed */}

            </View>

        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    avatarContainer: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 25,
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoText: {
        marginLeft: 15,
    },
    label: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});

export default Profile;