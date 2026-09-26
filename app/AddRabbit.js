import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const background = require('../assets/images/Background_1.png');
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const AddRabbit = () => {
    const router = useRouter();
    const { token } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [breed, setBreed] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(''); // Format: YYYY-MM-DD
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || !breed || !dateOfBirth) {
            Alert.alert("Validation Error", "Please fill in all fields.");
            return;
        }
        setLoading(true);
        try {
            console.log(token);
            await axios.post(`${BASE_URL}/rabbits/`,
                { name, breed, date_of_birth: dateOfBirth },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert("Success! 🐇", `${name} has been added!`, [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to add rabbit. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={background} resizeMode="cover" style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    headerStyle: { backgroundColor: 'transparent' },
                    headerTransparent: true,
                    headerTitle: "Add Rabbit",
                    headerTitleStyle: { color: '#fff', fontWeight: 'bold' },
                    headerTintColor: '#fff',
                }}
            />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.label}>Rabbit Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Fluffy"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Breed</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Holland Lop"
                        value={breed}
                        onChangeText={setBreed}
                    />

                    <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 2023-06-15"
                        value={dateOfBirth}
                        onChangeText={setDateOfBirth}
                        keyboardType="normal"
                    />

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.submitText}>Add Rabbit 🐇</Text>
                        }
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, paddingTop: 120 },
    card: { backgroundColor: 'rgba(255,255,255,0.93)', borderRadius: 20, padding: 25, width: '100%' },
    label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    submitButton: {
        backgroundColor: '#e05c5c',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        marginTop: 25,
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AddRabbit;