import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Stack,useRouter } from 'expo-router';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup } = useContext(AuthContext);
  const router = useRouter();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Signup Failed', 'Passwords do not match.');
      return;
    }
    const result = await signup(email, password);
    if (result.success) {
      Alert.alert('Success', 'Account created! Please log in.', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } else {
      Alert.alert('Signup Failed', result.error);
    }
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '';

  return (
    <ImageBackground source={require('../assets/images/Background_1.png')} resizeMode="cover" style={styles.container} imageStyle={{ transform: [{ scale: 1.1 }] }}>
        <Stack.Screen
                        options={{
                            headerStyle: { backgroundColor: 'transparent' },
                            headerTransparent: true,
                            headerTitle: "",
                            headerTintColor: '#fff'
                        }}
            />
      <View style={{ padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10 }}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#686868"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#686868"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#686868"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignup} disabled={!isFormValid} />
      
      <TouchableOpacity onPress={() => router.replace('/login')} style={styles.link}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#747474', padding: 10, marginBottom: 15, borderRadius: 5 },
  link: { marginTop: 15, alignItems: 'center' },
  linkText: { color: 'blue' }
});
