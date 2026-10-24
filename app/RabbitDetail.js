import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
    const [uploading, setUploading] = useState(false);
    const [scans, setScans] = useState([]);
    const [scansLoading, setScansLoading] = useState(true);

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

    const handlePickAndUploadPhoto = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission required", "Camera roll permissions are required to upload a profile photo.");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (pickerResult.canceled) return;

        const asset = pickerResult.assets[0];
        const formData = new FormData();
        const filename = asset.uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
            uri: asset.uri,
            name: filename,
            type: type,
        });

        try {
            setUploading(true);
            const response = await axios.post(`${BASE_URL}/rabbits/${id}/photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setRabbit(response.data);
            Alert.alert("Success", "Rabbit photo updated!");
        } catch (error) {
            Alert.alert("Upload Failed", "Could not upload rabbit photo.");
        } finally {
            setUploading(false);
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

    const loadData = async () => {
        try {
            const [rabbitRes, scansRes] = await Promise.all([
                axios.get(`${BASE_URL}/rabbits/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${BASE_URL}/scans/rabbit/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setRabbit(rabbitRes.data);
            setName(rabbitRes.data.name);
            setBreed(rabbitRes.data.breed);
            setDateOfBirth(rabbitRes.data.date_of_birth);
            if (rabbitRes.data.date_of_birth) {
                const parsed = new Date(rabbitRes.data.date_of_birth);
                if (!isNaN(parsed.getTime())) {
                    setDate(parsed);
                }
            }
            setScans(scansRes.data);
        } catch {
            Alert.alert("Error", "Failed to load rabbit data.");
        } finally {
            setLoading(false);
            setScansLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (id && token) {
                loadData();
            }
        }, [id, token])
    );

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
                    {/* Rabbit Profile Photo */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={handlePickAndUploadPhoto} disabled={uploading} style={styles.avatarWrapper}>
                            {rabbit?.image_url ? (
                                <Image source={{ uri: `${BASE_URL}${rabbit.image_url}` }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="paw" size={45} color="#e05c5c" />
                                </View>
                            )}
                            <View style={styles.cameraIconBadge}>
                                {uploading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons name="camera" size={16} color="#fff" />
                                )}
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.avatarHint}>Tap photo to change</Text>
                    </View>

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

                            <TouchableOpacity style={[styles.button, { backgroundColor: '#e05c5c' }]} onPress={() => setEditing(true)}>
                                <Ionicons name="pencil-outline" size={18} color="#fff" />
                                <Text style={[styles.buttonText, { marginLeft: 8 }]}>Edit Rabbit</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                
                {/* Scan Records Section */}
                <View style={[styles.card, { marginTop: 18, marginBottom: 40 }]}>
                    <View style={styles.historyHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="fitness-outline" size={22} color="#e05c5c" style={{ marginRight: 8 }} />
                            <Text style={styles.historyTitle}>Scan Records</Text>
                        </View>
                        <View style={styles.scanCountBadge}>
                            <Text style={styles.scanCountText}>{scans.length}</Text>
                        </View>
                    </View>

                    {scansLoading ? (
                        <ActivityIndicator color="#e05c5c" style={{ padding: 20 }} />
                    ) : scans.length === 0 ? (
                        <View style={styles.emptyScansContainer}>
                            <Ionicons name="document-text-outline" size={42} color="#ccc" />
                            <Text style={styles.emptyScansText}>No paw scans recorded yet</Text>
                            <Text style={styles.emptyScansSubText}>Tap Quick Scan above to record the first check.</Text>
                        </View>
                    ) : (
                        <View style={styles.scansList}>
                            {scans.map((scan) => {
                                const gradeColors = {
                                    0: { color: '#2ECC71', bg: '#E8F8F0' },
                                    1: { color: '#F1C40F', bg: '#FEF9E7' },
                                    2: { color: '#F39C12', bg: '#FEF5E7' },
                                    3: { color: '#E67E22', bg: '#FDF2E9' },
                                    4: { color: '#E74C3C', bg: '#FDEDEC' },
                                    5: { color: '#C0392B', bg: '#F9EBEA' },
                                };
                                const gc = gradeColors[scan.classification] || gradeColors[1];
                                const limbName = scan.limb ? scan.limb.replace('_', ' ').toUpperCase() : 'PAW';
                                const scanDate = scan.analyzed_at ? new Date(scan.analyzed_at).toLocaleDateString() : '';

                                return (
                                    <TouchableOpacity
                                        key={scan.photo_id}
                                        style={styles.scanItem}
                                        onPress={() => router.push({
                                            pathname: '/Report',
                                            params: { scanData: JSON.stringify(scan) }
                                        })}
                                        activeOpacity={0.7}
                                    >
                                        {scan.image_url ? (
                                            <Image source={{ uri: `${BASE_URL}${scan.image_url}` }} style={styles.scanThumb} />
                                        ) : (
                                            <View style={styles.scanThumbPlaceholder}>
                                                <Ionicons name="paw" size={20} color="#e05c5c" />
                                            </View>
                                        )}

                                        <View style={styles.scanItemInfo}>
                                            <Text style={styles.scanLimbText}>{limbName} PAW</Text>
                                            <Text style={styles.scanDateText}>{scanDate}</Text>
                                        </View>

                                        <View style={[styles.scanGradeBadge, { backgroundColor: gc.bg, borderColor: gc.color }]}>
                                            <Text style={[styles.scanGradeText, { color: gc.color }]}>Grade {scan.classification}</Text>
                                        </View>

                                        <Ionicons name="chevron-forward" size={18} color="#aaa" style={{ marginLeft: 6 }} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                    <TouchableOpacity style={[styles.button, { backgroundColor: '#4A90E2' }]} onPress={() => router.push({ pathname: '/scan', params: { rabbitId: id } })}>
                        <Ionicons name="scan-circle-outline" size={22} color="#fff" />
                        <Text style={[styles.buttonText, { marginLeft: 8 }]}>Quick Scan</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, alignItems: 'center', padding: 20, paddingTop: 120 },
    card: { backgroundColor: 'rgba(255,255,255,0.93)', borderRadius: 20, padding: 25, width: '100%' },
    avatarSection: { alignItems: 'center', marginBottom: 15 },
    avatarWrapper: { position: 'relative', width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
    avatarImage: { width: 96, height: 96, borderRadius: 48 },
    avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#ffeaea', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#e05c5c' },
    cameraIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#e05c5c', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    avatarHint: { fontSize: 12, color: '#888', marginTop: 6 },
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
    
    /* Scan History Styles */
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: 8,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    scanCountBadge: {
        backgroundColor: '#ffeaea',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    scanCountText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#e05c5c',
    },
    emptyScansContainer: {
        alignItems: 'center',
        paddingVertical: 25,
    },
    emptyScansText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
        marginTop: 8,
    },
    emptyScansSubText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        textAlign: 'center',
    },
    scansList: {
        marginTop: 4,
    },
    scanItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    scanThumb: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    scanThumbPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#ffeaea',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanItemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    scanLimbText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    scanDateText: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    scanGradeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    scanGradeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default RabbitDetail;