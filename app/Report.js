import React, {useState} from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView, Image, ImageBackground} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { COLORS, icons, images, SIZES , wallpaper} from '../constants'
import { ScreenHeaderBtn } from '../components'
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width; 

const Report = () => {
    const [count, setCount] = useState(0);
    const onPress = () => setCount(prevCount => prevCount + 1);
    const router = useRouter();
    const background = require('../assets/images/Background_4.png');
    const calendar  = require('../assets/images/Calendar_Pixel.png');
    const document  = require('../assets/images/Document_Pixel.png');
    const back_button = require('../assets/images/Small_Yellow_Button.png')

    return (
        <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{flex:1, backgroundColor: "#ADD8E6"}}>
            <ImageBackground source={background} resizeMode="cover" style={{flex:1, width: '100%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20}}>
                <Text style={[styles_head.text_big, {marginTop: 5}]}>Result for Scanning</Text>
                
                <View style = {{justifyContent: 'space-around', flexDirection: 'row', margin: 'auto'}}>
                    <View style={[styles_normal.frame, {width: 0.4*screenWidth, justifyContent: 'space-evenly',alignItems: 'flex-start'}]}>
                        <Text style={[styles_normal.text, {textDecorationColor: '#FF0000'}]}>   Risk: </Text>
                    </View>

                    <View style={[styles_normal.frame, {width: 0.4*screenWidth, justifyContent: 'space-evenly',alignItems: 'flex-start'}]}>
                        <Text style={[styles_normal.text, {textDecorationColor: '#FF0000'}]}>   Level: </Text>
                    </View>
                </View>

                <View style = {{justifyContent: 'flex-start', margin: 'auto'}}>
                    <View style={[styles_normal.frame, {width: 300, alignItems: 'center'}]}>
                        <Text style={styles_normal.text}>Explanation</Text>
                    </View>

                    <View style={[styles_normal.frame_big, {alignItems: 'center'}]}>
                    </View>
                    
                    <View style={[styles_normal.frame, {width: 0.9*screenWidth, alignItems: 'flex-start'}]}>
                        <Text style={styles_normal.text}>   Serveillance period:</Text>
                    </View>

                    <View style= {{alignSelf: 'center', flexDirection: 'row'}}>
                        <TouchableOpacity style={[styles_normal.frame_big, {width: 180, height: 180, backgroundColor: '#53CFFB', alignItems: 'center', gap: 10}]} onPress={() => router.push('/weekly')}>
                            <Text style={[styles_normal.text, {fontSize: 20}]}>Add to Rabbit Tracking</Text>
                            <Image source={calendar} style={{width: 100, height: 100 }}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles_normal.frame_big, {width: 180, height: 180, backgroundColor: '#D9D9D9', alignItems: 'center', gap: 10}]} onPress={() => router.push('/Information')}>
                             <Text style={[styles_normal.text, {fontSize: 20, marginTop: 5}]}>More Information</Text>
                            <Image source={document}  style={{width: 120, height: 120 , marginLeft: 10}}/>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={[styles_normal.button, {marginHorizontal: 10, marginTop: 30, borderWidth: 2}]} onPress={() => router.push('/')}>
                        
                            <Text style={styles_head.text_small}>Back</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </SafeAreaView>
        </>
    )
}

const styles_head = StyleSheet.create({
    container:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text_big: {
        fontSize: 40,
        fontWeight: 'bold',
        textAlign: 'center',
        textDecorationColor: '#008631'
    },
    text_small: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        textDecorationColor: '#FFFB8F'
    }
    })

const styles_normal = StyleSheet.create({
    container:{
        flex:1,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        margin: 5,
    },
    frame:{
        height: 50,
        justifyContent: 'center',
        backgroundColor: '#F5E6A9',
        margin: 10,
        borderWidth: 2,

        borderTopLeftRadius: 80,
        borderTopRightRadius: 80,
        borderBottomLeftRadius: 80,
        borderBottomRightRadius: 80,
    },
    frame_big:{
        width: screenWidth * 0.9, 
        height: 200,
        justifyContent: 'center',
        backgroundColor: '#F5E6A9',
        borderWidth: 2,
        margin: 10,

        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    text: {
        fontSize: 30,
        fontWeight: 'Bold',
        textAlign: 'center',
    },
    button: {
        width: 40 * 4,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5E6A9',
        
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    image:{
        width: 400,
        height: 400,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5E6A9',
        margin: 10,
    },
    wallpaper:{
        flex: 1,
        justifyContent: 'center'
    }
    })

Report.id = 'Report';

export default Report;