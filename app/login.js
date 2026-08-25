import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useRouter,Stack } from 'expo-router';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      router.replace('/');
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  return (
    
      <ImageBackground source={require('../assets/images/Background_1.png')} resizeMode="cover" style={styles.container}>
        <Stack.Screen
                        options={{
                            headerStyle: { backgroundColor: 'transparent' },
                            headerTransparent: true,
                            headerTitle: "",
                            headerTintColor: '#fff'
                        }}
            />
      <View style={{ padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10 }}>
        <Text style={styles.title}>Welcome Back</Text>
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
      <Button title="Login" onPress={handleLogin} disabled={!isFormValid} />
      
      <TouchableOpacity onPress={() => router.push('/signup')} style={styles.link}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
      </View>
      
      </ImageBackground>
      
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#747474', padding: 10, marginBottom: 15, borderRadius: 5, },
  link: { marginTop: 15, alignItems: 'center' },
  linkText: { color: 'blue' }
});
