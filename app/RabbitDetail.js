import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../context/AuthContext';

const background = require('../assets/images/Background_1.png');
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const RabbitDetail = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { token } = useContext(AuthContext);

    const [rabbit, setRabbit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [breed, setBreed] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const formatDate = (rawDate) => {
        const year = rawDate.getFullYear();
        const month = String(rawDate.getMonth() + 1).padStart(2, '0');
        const day = String(rawDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        if (event.type === 'set' && selectedDate) {
            setDate(selectedDate);
            setDateOfBirth(formatDate(selectedDate));
        }
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setShowPicker(false);
        if (rabbit) {
            setName(rabbit.name || '');
            setBreed(rabbit.breed || '');
            setDateOfBirth(rabbit.date_of_birth || '');
            if (rabbit.date_of_birth) {
                const parsed = new Date(rabbit.date_of_birth);
                if (!isNaN(parsed.getTime())) {
                    setDate(parsed);
                }
            }
        }
    };

    useEffect(() => {
        const fetchRabbit = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/rabbits/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRabbit(response.data);
                setName(response.data.name);
                setBreed(response.data.breed);
                setDateOfBirth(response.data.date_of_birth);
                if (response.data.date_of_birth) {
                    const parsed = new Date(response.data.date_of_birth);
                    if (!isNaN(parsed.getTime())) {
                        setDate(parsed);
                    }
                }
            } catch {
                Alert.alert("Error", "Failed to load rabbit.");
            } finally {
                setLoading(false);
            }
        };
        fetchRabbit();
    }, [id]);

    const handleUpdate = async () => {
        try {
            await axios.put(`${BASE_URL}/rabbits/${id}`,
                { name, breed, date_of_birth: dateOfBirth },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert("Updated!", "Rabbit info has been saved.");
            setRabbit(prev => ({ ...prev, name, breed, date_of_birth: dateOfBirth }));
            setEditing(false);
            setShowPicker(false);
        } catch {
            Alert.alert("Error", "Failed to update rabbit.");
        }
    };

    const handleDelete = () => {
        Alert.alert("Delete Rabbit", `Are you sure you want to delete ${rabbit?.name}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive",
                onPress: async () => {
                    try {
                        await axios.delete(`${BASE_URL}/rabbits/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        router.back();
                    } catch {
                        Alert.alert("Error", "Failed to delete rabbit.");
                    }
                }
            }
        ]);
    };

    if (loading) return <ActivityIndicator size="large" color="#fff" style={{ flex: 1, backgroundColor: '#333' }} />;

    return (
        <ImageBackground source={background} resizeMode="cover" style={{ flex: 1 }} imageStyle={{ transform: [{ scale: 1.1 }] }}>
            <Stack.Screen
                options={{
                    headerStyle: { backgroundColor: 'transparent' },
                    headerTransparent: true,
                    headerTitle: rabbit?.name ?? 'Rabbit',
                    headerTitleStyle: { color: '#fff', fontWeight: 'bold' },
                    headerTintColor: '#fff',
                    headerRight: () => (
                        <TouchableOpacity onPress={handleDelete} style={{ padding: 5 }}>
                            <Ionicons name="trash-outline" size={24} color="red" />
                        </TouchableOpacity>
                    )
                }}
            />

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} editable={editing} />

                    <Text style={styles.label}>Breed</Text>
                    <TextInput style={styles.input} value={breed} onChangeText={setBreed} editable={editing} />

                    <Text style={styles.label}>Date of Birth</Text>
                    {editing ? (
                        <TouchableOpacity 
                            style={styles.datePickerButton} 
                            onPress={() => setShowPicker(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.dateText, !dateOfBirth && styles.placeholderText]}>
                                {dateOfBirth ? dateOfBirth : "Select Date of Birth (YYYY-MM-DD)"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TextInput style={styles.input} value={dateOfBirth} editable={false} />
                    )}

                    {showPicker && editing && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            maximumDate={new Date()}
                            onChange={handleDateChange}
                            textColor="#212121"
                        />
                    )}

                    {editing ? (
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                            <TouchableOpacity style={[styles.button, { backgroundColor: '#888', flex: 1 }]} onPress={handleCancelEdit}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50', flex: 1 }]} onPress={handleUpdate}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ gap: 12, marginTop: 20 }}>
                            <TouchableOpacity style={[styles.button, { backgroundColor: '#4A90E2' }]} onPress={() => router.push({ pathname: '/scan', params: { rabbitId: id } })}>
                                <Ionicons name="scan-circle-outline" size={22} color="#fff" />
                                <Text style={[styles.buttonText, { marginLeft: 8 }]}>Quick Scan</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.button, { backgroundColor: '#e05c5c' }]} onPress={() => setEditing(true)}>
                                <Ionicons name="pencil-outline" size={18} color="#fff" />
                                <Text style={[styles.buttonText, { marginLeft: 8 }]}>Edit Rabbit</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, alignItems: 'center', padding: 20, paddingTop: 120 },
    card: { backgroundColor: 'rgba(255,255,255,0.93)', borderRadius: 20, padding: 25, width: '100%' },
    label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
    input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
    datePickerButton: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#aaa',
    },
    button: { borderRadius: 12, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default RabbitDetail;