import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ImageBackground, Dimensions } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const background = require('../assets/images/Background_1.png');
const Bunny = require('../assets/images/Bunny_Logo.png');
const Document = require('../assets/images/document.png');
const Calandar = require('../assets/images/Calendar_Pixel.png'); 
const Back = require('../assets/images/Back.png'); 
const Paw = require('../assets/images/paw.png');
const Alert = require('../assets/images/Alert_Pixel.png');
const Clock = require('../assets/images/clock.png');
//const Yale_Button = require('../assets/images/yale.png');
//const AirForce_Button = require('../assets/images/airforce.png');
//const Cambridge_Button = require('../assets/images/cambridge.png');

const GRADE_CONFIG = {
    0: { color: '#2ECC71', bg: '#E8F8F0', risk: 'None', label: 'Healthy Paw' },
    1: { color: '#F1C40F', bg: '#FEF9E7', risk: 'Low Risk', label: 'Grade I: Early Stage' },
    2: { color: '#F39C12', bg: '#FEF5E7', risk: 'Moderate Risk', label: 'Grade II: Mild Ulceration' },
    3: { color: '#E67E22', bg: '#FDF2E9', risk: 'High Risk', label: 'Grade III: Deep Ulceration' },
    4: { color: '#E74C3C', bg: '#FDEDEC', risk: 'Severe Risk', label: 'Grade IV: Tendon Involvement' },
    5: { color: '#C0392B', bg: '#F9EBEA', risk: 'Critical Risk', label: 'Grade V: Osteomyelitis' },
};

const Report = () => {
    const router = useRouter();
    const { scanData } = useLocalSearchParams();

    let scan = null;
    if (scanData) {
        try {
            scan = typeof scanData === 'string' ? JSON.parse(scanData) : scanData;
        } catch (e) {
            console.log("Failed to parse scanData", e);
        }
    }

    const classification = scan?.classification ?? 1;
    const config = GRADE_CONFIG[classification] || GRADE_CONFIG[1];
    const risk = scan?.risk_level ?? config.risk;
    const levelTitle = scan?.grade_title ?? config.label;
    const explanation = scan?.explanation ?? 'Hair loss on the sole, thickened and red skin, but no open wound. Action: Change flooring to soft mats or fleece, and trim nails.';
    const surveillance = scan?.surveillance_period ?? '1–2 weeks';
    const pawImage = scan?.image_url ? `${BASE_URL}${scan.image_url}` : null;
    const limbText = scan?.limb ? scan.limb.replace('_', ' ').toUpperCase() : 'BACK LEFT';
    const confidencePct = scan?.confidence ? `${Math.round(scan.confidence * 100)}%` : null;

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
                        headerTitle: "Scan Result",
                        headerTitleStyle: { color: '#fff', fontWeight: 'bold' },
                        headerTintColor: '#fff',
                    }}
                />

                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    
                    {/* 1. Paw Image & Limb Badge */}
                    <View style={styles.imageCard}>
                        {pawImage ? (
                            <Image source={{ uri: pawImage }} style={styles.pawImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Image source={Paw} style = {{width: 60, height: 60}} resizeMode="contain"/>
                            </View>
                        )}
                        <View style={styles.imageOverlayBadges}>
                            <View style={styles.limbBadge}>
                                <Image source={Paw} style = {{width: 16, height: 16, marginRight: 6}} resizeMode="contain"/>
                                <Text style={styles.limbBadgeText}>{limbText} PAW</Text>
                            </View>
                            {confidencePct && (
                                <View style={styles.confidenceBadge}>
                                    <Text style={styles.confidenceText}>{confidencePct} Match</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* 2. Main Diagnosis Card */}
                    <View style={styles.card}>
                        {/* Status / Grade Header */}
                        <View style={styles.diagnosisHeader}>
                            <View style={[styles.gradePill, { backgroundColor: config.bg, borderColor: config.color }]}>
                                <View style={[styles.statusDot, { backgroundColor: config.color }]} />
                                <Text style={[styles.gradePillText, { color: config.color }]}>Grade {classification}</Text>
                            </View>
                            <View style={[styles.riskPill, { backgroundColor: config.color }]}>
                                <Text style={styles.riskPillText}>{risk}</Text>
                            </View>
                        </View>

                        <Text style={styles.diagnosisTitle}>{levelTitle}</Text>

                        <View style={styles.divider} />

                        {/* Clinical Assessment */}
                        <View style={styles.sectionHeaderRow}>
                            <Image source={Alert} style = {{width: 18, height: 18}} resizeMode="contain"/>
                            <Text style={styles.sectionHeader}>CLINICAL ASSESSMENT</Text>
                        </View>
                        <Text style={styles.explanationText}>{explanation}</Text>

                        {/* Surveillance Period Box */}
                        <View style={styles.surveillanceBox}>
                            <Image source={Clock} style = {{width: 24, height: 24, marginRight: 12}} resizeMode="contain"/>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.surveillanceLabel}>Recommended Surveillance</Text>
                                <Text style={styles.surveillanceValue}>{surveillance}</Text>
                            </View>
                        </View>
                    </View>

                    {/* 3. Action Cards */}
                    <View style={styles.actionCardsRow}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() =>
                                scan?.rabbit_id
                                    ? router.push({ pathname: '/SeverityTracking', params: { rabbitId: scan.rabbit_id } })
                                    : router.replace('/')
                            }
                            activeOpacity={0.8}
                        >
                            <View style={[styles.actionIconCircle, { backgroundColor: '#9FBFB8' }]}>
                                <Image source={Calandar} style = {{width: 24, height: 24}} resizeMode="contain"/>
                            </View>
                            <Text style={styles.actionCardTitle}>Tracking</Text>
                            <Text style={styles.actionCardSubtitle}>Severity Timeline</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => router.push('/info')}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.actionIconCircle, { backgroundColor: '#6386BA' }]}>
                                <Image source={Document} style = {{width: 32, height: 32}} resizeMode="contain" />
                            </View>
                            <Text style={styles.actionCardTitle}>Care Guide</Text>
                            <Text style={styles.actionCardSubtitle}>Sore Hocks Info</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 4. Navigation Buttons */}
                    <View style={styles.buttonContainer}>
                        
                        {scan?.rabbit_id && (
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => router.replace({ pathname: '/RabbitDetail', params: { id: scan.rabbit_id } })}
                                activeOpacity={0.8}
                            >
                                <Image source={Back} style = {{width: 24, height: 24, marginRight: 6}} resizeMode="contain"/>
                                <Text style={styles.secondaryButtonText}>Back to Rabbit Profile</Text>
                            </TouchableOpacity>
                        )}

                        
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.replace('/')}
                            activeOpacity={0.8}
                        >
                            <Image source={Bunny} style = {{width: 26, height: 26, marginRight: 6}} resizeMode="contain"/>
                            <Text style={styles.primaryButtonText}>Home Dashboard</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 105,
        paddingBottom: 40,
    },
    imageCard: {
        width: '100%',
        height: 210,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 16,
    },
    pawImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#A7B9D4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageOverlayBadges: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    limbBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    limbBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    confidenceBadge: {
        backgroundColor: 'rgba(46, 204, 113, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    confidenceText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        borderRadius: 20,
        padding: 22,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
    },
    diagnosisHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    gradePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1.5,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    gradePillText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    riskPill: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
    },
    riskPillText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    diagnosisTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#A7B9D4',
        marginVertical: 14,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#7F8C8D',
        marginLeft: 6,
        letterSpacing: 0.8,
    },
    explanationText: {
        fontSize: 14,
        color: '#34495E',
        lineHeight: 22,
        marginBottom: 16,
    },
    surveillanceBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#A7B9D4',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#1B4079',
    },
    surveillanceLabel: {
        fontSize: 12,
        color: '#1B4079',
        fontWeight: '500',
    },
    surveillanceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B4079',
        marginTop: 2,
    },
    actionCardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
        gap: 12,
    },
    actionCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        borderRadius: 18,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    actionIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    actionCardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    actionCardSubtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#1B4079',
        borderRadius: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        borderWidth: 1.5,
        borderColor: '#4D7C8A',
        borderRadius: 14,
        paddingVertical: 13,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#4D7C8A',
        fontSize: 15,
        fontWeight: 'bold',
    },
});

export default Report;