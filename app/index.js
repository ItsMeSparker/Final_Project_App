import React, {useState} from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ImageBackground, Image } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar';
import { COLORS, icons, images, SIZES , wallpaper} from '../constants'
import { ScreenHeaderBtn } from '../components'

const background = require('../assets/images/Background_1.png');
const Red_Button = require('../assets/images/Red_Button.png');
const Orange_Button = require('../assets/images/Orange_Button.png');
const Blue_Button = require('../assets/images/Blue_Button.png');
const Purple_Button = require('../assets/images/Purple_Button.png');
const Rabbit = require('../assets/images/Bunny_Logo.png');

const Home = () => {
    const [count, setCount] = useState(0);
    const onPress = () => setCount(prevCount => prevCount + 1);
    const router = useRouter();
    const QuickScan = () => Alert.alert("QuickScan")

    return (
        <ImageBackground source={background} resizeMode="cover" style={{flex:1, width: '100%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80}}>
            <Stack.Screen
                        options={{
                            headerStyle: { backgroundColor: 'transparent' },
                            headerTransparent: true,
                            headerTitle: "",
                            headerTintColor: '#fff'
                        }}
            />
            <Image source={Rabbit} resizeMode='contain' style={{width: 100, height: 100 }}/>
            <Text style={[styles_head.text, { marginBottom: 20, marginTop: 15}]}>Rabbit Lens</Text>
            <View style={styles_normal.container}>                
                <TouchableOpacity onPress={() => router.push('/Report')}>
                    <View style={{position: 'relative', width: 300, height: 90, justifyContent: 'center', marginVertical: 5}}>
                        <Image source={Red_Button} resizeMode='contain' style={{width: '100%', height: '100%' }}/>
                        <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={styles_normal.text}>Quick Scan</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity  onPress={onPress}>
                    <View style={{position: 'relative', width: 300, height: 90, justifyContent: 'center', marginVertical: 5}}>
                        <Image source={Orange_Button} resizeMode='contain' style={{width: '100%', height: '100%' }}/>
                        <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={styles_normal.text}>Weekly Report</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity  onPress={() => router.push('/Information')}>
                    <View style={{position: 'relative', width: 300, height: 90, justifyContent: 'center', marginVertical: 5}}>
                        <Image source={Purple_Button} resizeMode='contain' style={{width: '100%', height: '100%' }}/>
                        <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={styles_normal.text}>Information</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={onPress}>
                    <View style={{position: 'relative', width: 300, height: 90, justifyContent: 'center', marginVertical: 5}}>
                        <Image source={Blue_Button} resizeMode='contain' style={{width: '100%', height: '100%'}}/>
                        <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={styles_normal.text}>Settings</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            </ImageBackground>
    )
}

const styles_head = StyleSheet.create({
    container:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 40,
        fontWeight: 'bold',
        textAlign: 'center',
        textDecorationColor: '#008631'
    },
    })

const styles_normal = StyleSheet.create({
    container:{
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    text: {
        fontSize: 10,
        fontWeight: '400',
        textAlign: 'center',
    },
    button: {
        width: 90 * 4,
        height: 90,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5E6A9',
        margin: 20,

        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    })

    Home.id = 'HomeScreen';

export default Home;