import React, { useContext } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

const background = require('../../assets/images/Background_1.png');
const Rabbit = require('../../assets/images/Bunny_Logo.png');

const { width, height } = Dimensions.get('window');

const Profile = () => {
    const router = useRouter();
    const { user,logout } = useContext(AuthContext); // Make sure your AuthContext exposes a 'user' object

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground
                source={background}
                resizeMode="cover"
                style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80 }]}
                imageStyle={{ transform: [{ scale: 1.1 }] }}
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

            {/* Logout Button */}
            <TouchableOpacity onPress={() => logout()} style={styles.logoutButton}>
                <Ionicons name="power" size={24} color="white" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

        </ImageBackground>
        </View>
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
    logoutButton: {
        marginTop: 30,
        backgroundColor: '#e05c5c',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: '60%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default Profile;