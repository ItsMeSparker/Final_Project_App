import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert,
    ActivityIndicator,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

const background = require('../../assets/images/Background_1.png');

const Profile = () => {
    const router = useRouter();
    const { user, updateUsername, changePassword, logout } = useContext(AuthContext);

    // Username editing state
    const [editing, setEditing] = useState(false);
    const [newUsername, setNewUsername] = useState(user?.username ?? '');
    const [saving, setSaving] = useState(false);

    // Password editing state
    const [editingPassword, setEditingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const handleStartEdit = () => {
        setNewUsername(user?.username ?? '');
        setEditing(true);
    };

    const handleSaveUsername = async () => {
        const trimmed = newUsername.trim();
        if (!trimmed) {
            Alert.alert('Validation Error', 'Username cannot be empty.');
            return;
        }
        setSaving(true);
        const result = await updateUsername(trimmed);
        setSaving(false);
        if (result.success) {
            setEditing(false);
            Alert.alert('Success', 'Username updated!');
        } else {
            if (!result.unauthorized) Alert.alert('Update Failed', result.error);
        }
    };

    const handleStartEditPassword = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setEditingPassword(true);
    };

    const handleCancelEditPassword = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setEditingPassword(false);
    };

    const handleSavePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Validation Error', 'Please fill in all password fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Validation Error', 'New passwords do not match.');
            return;
        }
        setSavingPassword(true);
        const result = await changePassword(currentPassword, newPassword);
        setSavingPassword(false);
        if (result.success) {
            handleCancelEditPassword();
            Alert.alert('Success', 'Password updated successfully!');
        } else {
            if (!result.unauthorized) Alert.alert('Update Failed', result.error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground
                source={background}
                resizeMode="cover"
                style={StyleSheet.absoluteFill}
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

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Profile Avatar */}
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-circle-outline" size={100} color="white" />
                    </View>

                    {/* User Info Card */}
                    <View style={styles.card}>

                        {/* Username */}
                        <View style={styles.infoRow}>
                            <Ionicons name="person-outline" size={22} color="#555" />
                            <View style={[styles.infoText, { flex: 1 }]}>
                                <Text style={styles.label}>Username</Text>
                                {editing ? (
                                    <View style={styles.editContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={newUsername}
                                            onChangeText={setNewUsername}
                                            placeholder="Enter username"
                                            autoCapitalize="none"
                                            autoFocus
                                        />
                                        <TouchableOpacity
                                            onPress={handleSaveUsername}
                                            disabled={saving}
                                            style={[styles.iconButton, { backgroundColor: '#2ecc71' }]}
                                        >
                                            {saving ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Ionicons name="checkmark" size={18} color="#fff" />
                                            )}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setEditing(false)}
                                            disabled={saving}
                                            style={[styles.iconButton, { backgroundColor: '#95a5a6' }]}
                                        >
                                            <Ionicons name="close" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text style={styles.value}>{user?.username ?? 'Not set'}</Text>
                                )}
                            </View>
                            {!editing && (
                                <TouchableOpacity onPress={handleStartEdit} style={styles.editTrigger}>
                                    <Ionicons name="create-outline" size={22} color="#e05c5c" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Email */}
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={22} color="#555" />
                            <View style={styles.infoText}>
                                <Text style={styles.label}>Email</Text>
                                <Text style={styles.value}>{user?.email ?? 'N/A'}</Text>
                            </View>
                        </View>

                        {/* Password */}
                        <View style={[styles.infoRow, { borderBottomWidth: 0, alignItems: editingPassword ? 'flex-start' : 'center' }]}>
                            <Ionicons name="lock-closed-outline" size={22} color="#555" style={editingPassword ? { marginTop: 4 } : undefined} />
                            <View style={[styles.infoText, { flex: 1 }]}>
                                <Text style={styles.label}>Password</Text>
                                {editingPassword ? (
                                    <View style={styles.passwordForm}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={currentPassword}
                                            onChangeText={setCurrentPassword}
                                            placeholder="Current password"
                                            placeholderTextColor="#999"
                                            secureTextEntry
                                            autoCapitalize="none"
                                        />
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            placeholder="New password"
                                            placeholderTextColor="#999"
                                            secureTextEntry
                                            autoCapitalize="none"
                                        />
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            placeholder="Confirm new password"
                                            placeholderTextColor="#999"
                                            secureTextEntry
                                            autoCapitalize="none"
                                        />
                                        <View style={styles.passwordActions}>
                                            <TouchableOpacity
                                                onPress={handleCancelEditPassword}
                                                disabled={savingPassword}
                                                style={[styles.passwordBtn, { backgroundColor: '#95a5a6' }]}
                                            >
                                                <Text style={styles.passwordBtnText}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={handleSavePassword}
                                                disabled={savingPassword}
                                                style={[styles.passwordBtn, { backgroundColor: '#2ecc71' }]}
                                            >
                                                {savingPassword ? (
                                                    <ActivityIndicator size="small" color="#fff" />
                                                ) : (
                                                    <Text style={styles.passwordBtnText}>Save</Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <Text style={styles.value}>••••••••</Text>
                                )}
                            </View>
                            {!editingPassword && (
                                <TouchableOpacity onPress={handleStartEditPassword} style={styles.editTrigger}>
                                    <Ionicons name="create-outline" size={22} color="#e05c5c" />
                                </TouchableOpacity>
                            )}
                        </View>

                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity onPress={() => logout()} style={styles.logoutButton}>
                        <Ionicons name="power" size={24} color="white" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </ScrollView>

            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 80,
        paddingBottom: 40,
    },
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
    editTrigger: {
        padding: 6,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 15,
        backgroundColor: '#fff',
        color: '#333',
    },
    iconButton: {
        marginLeft: 8,
        padding: 8,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    passwordForm: {
        marginTop: 6,
        gap: 8,
    },
    passwordInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: '#fff',
        color: '#333',
    },
    passwordActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    passwordBtn: {
        flex: 1,
        paddingVertical: 9,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    passwordBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
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
