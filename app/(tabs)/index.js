import { View, FlatList,Text, StyleSheet,ActivityIndicator, SafeAreaView, TouchableOpacity, Alert, ScrollView, Image, ImageBackground} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { globalStyles } from '../../styles/globalstyles.js';
import { rabbitsStyles } from '../../styles/rabbitsstyles.js';
import  { useContext,useState, useCallback} from 'react';
import { useFocusEffect } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
const background = require('../../assets/images/Background_3.png');
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const Rabbits = () => {
    const router = useRouter();
    const { token, logout } = useContext(AuthContext);
    const [rabbits, setRabbits] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchRabbits = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/rabbits/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRabbits(response.data);
        } catch (error) {
            Alert.alert("Error", "Failed to load rabbits.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
    useCallback(() => {
            fetchRabbits();
        }, [])
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={rabbitsStyles.card}
            onPress={() => router.push({ pathname: '/RabbitDetail', params: { id: item.id } })}
        >
            <Ionicons name="heart" size={30} color="#e05c5c" style={{ marginRight: 15 }} />
            <View>
                <Text style={rabbitsStyles.cardTitle}>{item.name}</Text>
                <Text style={rabbitsStyles.cardSubtitle}>{item.breed}</Text>
                <Text style={rabbitsStyles.cardSubtitle}>{item.date_of_birth}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
    );


    return (
        <ImageBackground source={background} resizeMode="cover" style={{flex:1, width: '100%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20}}>
            <Stack.Screen
                options={{
                    headerStyle: { backgroundColor: 'transparent' },
                    headerTransparent: true,
                    headerTitle: "",
                    headerTintColor: 'grey',
                }}
            />
            <Text style={[globalStyles.headText, { marginBottom: 20, marginTop: 40}]}>Rabbits</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#fff" style={{ marginTop: 200 }} />
            ) : rabbits.length === 0 ? (
                <View style={rabbitsStyles.emptyContainer}>
                    <Ionicons name="heart-outline" size={60} color="rgba(255,255,255,0.6)" />
                    <Text style={rabbitsStyles.emptyText}>No rabbits yet!</Text>
                    <Text style={rabbitsStyles.emptySubText}>Tap the + button to add your first rabbit.</Text>
                </View>
            ) : (
                <FlatList
                    data={rabbits}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={rabbitsStyles.list}
                    ListFooterComponent={
                        <TouchableOpacity
                            onPress={() => router.push('/AddRabbit')}
                            style={rabbitsStyles.addButton}
                        >
                            <Ionicons name="add" size={28} color="white" />
                            <Text style={{ color: 'white', marginLeft: 10, fontSize: 18, fontWeight: 'bold' }}>Add Rabbit</Text>
                        </TouchableOpacity>
                    }
                />
                
                
            )}
        </ImageBackground>

    )
}



export default Rabbits;