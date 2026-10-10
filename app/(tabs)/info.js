import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, images } from '../../constants';
import { ScreenHeaderBtn } from '../../components';

const translations = {
  en: {
    title: "Pododermatitis (Sore Hocks)",
    desc: "Pododermatitis, commonly known as Sore Hocks, is a frequent condition in rabbits. It is caused by excessive pressure on the soles of their feet, often due to hard or wire cage floors, obesity, or overgrown nails, leading to inflammation and ulcers.",
    levelsTitle: "Grades of Pododermatitis",
    grade1Title: "Grade I: Early Stage",
    grade1Desc: "Symptoms: Hair loss on the sole, thickened and red skin, but no open wound.",
    grade1Action: "Action: Change flooring to soft materials like soft mats or fleece, and trim nails.",
    grade2Title: "Grade II: Mild Ulceration",
    grade2Desc: "Symptoms: Increased inflammation, swelling, redness, and shallow abrasions.",
    grade2Action: "Action: Clean the wound, apply prescribed ointment, and immediately improve the environment.",
    grade3Title: "Grade III: Deep Ulceration & Infection",
    grade3Desc: "Symptoms: Deep open wounds, bleeding, severe inflammation, possible pus. The rabbit will experience pain and reluctance to move.",
    grade3Action: "Action: Visit an Exotic Vet for wound dressing, bandages, antibiotics, and pain relief medication.",
    grade4Title: "Grade IV: Tendon Involvement",
    grade4Desc: "Symptoms: Infection spreads deeply into tendons and deep tissues. The rabbit is in severe pain.",
    grade4Action: "Action: Requires intensive veterinary care, possible X-rays, and aggressive wound management.",
    grade5Title: "Grade V: Bone Infection",
    grade5Desc: "Symptoms: Infection reaches the bone (Osteomyelitis). The rabbit cannot bear weight or balance properly.",
    grade5Action: "Action: Extremely dangerous. May require surgery or advanced critical care to save the rabbit's life.",
    whatToDoTitle: "What to do when diagnosed?",
    whatToDo1: "1. Change the flooring: Strictly avoid wire floors. Use soft mats, EVA foam, or washable fleece.",
    whatToDo2: "2. Maintain hygiene: Keep the cage floor completely dry and clean to prevent wounds from contacting urine or feces.",
    whatToDo3: "3. Weight management: Overweight rabbits place more pressure on their feet. Control their diet, reduce treats, and focus on hay.",
    whatToDo4: "4. Regular nail trimming: Long nails force the rabbit to bear weight incorrectly, increasing pressure on the heels.",
    whatToDo5: "5. Follow vet instructions strictly: Consistent wound care, medication, and follow-up appointments are crucial for recovery."
  },
  th: {
    title: "โรคฝ่าเท้าอักเสบ (Sore Hocks)",
    desc: "โรคฝ่าเท้าอักเสบ หรือ Sore Hocks เกิดจากการลงน้ำหนักบนฝ่าเท้ามากเกินไป พื้นกรงแข็งหรือเป็นซี่ลวด ความอ้วน หรือเล็บยาวเกินไป ทำให้ผิวหนังบริเวณส้นเท้าอักเสบและเกิดแผล",
    levelsTitle: "ระดับความรุนแรงของโรค",
    grade1Title: "ระดับที่ 1 (Grade I): ระยะเริ่มต้น",
    grade1Desc: "อาการ: ฝ่าเท้ามีอาการขนร่วง ผิวหนังแดงหนาตัวขึ้น แต่ยังไม่มีแผลเปิด",
    grade1Action: "การดูแล: เปลี่ยนพื้นกรงให้เป็นวัสดุนุ่ม เช่น แผ่นรองนุ่ม หรือผ้าฟลีซ และตัดเล็บให้สั้น",
    grade2Title: "ระดับที่ 2 (Grade II): ระยะเริ่มเป็นแผล",
    grade2Desc: "อาการ: ผิวหนังเริ่มอักเสบมากขึ้น มีการบวม แดง และอาจเริ่มมีรอยถลอกหรือแผลตื้นๆ",
    grade2Action: "การดูแล: เริ่มทำความสะอาดแผล ทายาตามที่สัตวแพทย์สั่ง และปรับปรุงสภาพแวดล้อมทันที",
    grade3Title: "ระดับที่ 3 (Grade III): ระยะแผลลึกและติดเชื้อ",
    grade3Desc: "อาการ: แผลเปิดลึก มีเลือดออก อักเสบมาก กระต่ายจะเริ่มเจ็บและไม่อยากเดิน",
    grade3Action: "การดูแล: ต้องพบสัตวแพทย์ (Exotic Vet) เพื่อทำแผล พันแบนเดจ และกินยา",
    grade4Title: "ระดับที่ 4 (Grade IV): ระยะลุกลามถึงเส้นเอ็น",
    grade4Desc: "อาการ: การติดเชื้อลุกลามลึกลงไปถึงเส้นเอ็นและเนื้อเยื่อส่วนลึก กระต่ายเจ็บปวดรุนแรง",
    grade4Action: "การดูแล: จำเป็นต้องรักษาทางสัตวแพทย์อย่างใกล้ชิด อาจต้องเอกซเรย์",
    grade5Title: "ระดับที่ 5 (Grade V): ระยะติดเชื้อที่กระดูก",
    grade5Desc: "อาการ: การติดเชื้อลุกลามจนถึงกระดูก กระต่ายไม่สามารถลงน้ำหนักได้",
    grade5Action: "การดูแล: เป็นระยะที่อันตรายมาก อาจต้องพิจารณาการผ่าตัด",
    whatToDoTitle: "เมื่อถูกวินิจฉัยว่าเป็นโรคนี้ ควรทำอย่างไร?",
    whatToDo1: "1. ปรับเปลี่ยนพื้นกรง: หลีกเลี่ยงกรงพื้นลวดเหล็กเด็ดขาด ให้ใช้แผ่นรองนุ่ม หรือผ้าฟลีซ",
    whatToDo2: "2. การรักษาความสะอาด: ดูแลพื้นกรงให้แห้งและสะอาดเสมอ",
    whatToDo3: "3. การคุมน้ำหนัก: ควรคุมอาหาร ลดขนม และเน้นหญ้าแห้ง",
    whatToDo4: "4. ตัดเล็บเป็นประจำ: เล็บที่ยาวจะทำให้กระต่ายวางเท้าผิดรูป",
    whatToDo5: "5. ปฏิบัติตามคำแนะนำของสัตวแพทย์อย่างเคร่งครัด"
  }
};

const GradeCard = ({ title, desc, action, color, icon }) => (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 5 }]}>
        <View style={styles.cardHeader}>
            <Ionicons name={icon} size={24} color={color} />
            <Text style={[styles.cardTitle, { color: color }]}>{title}</Text>
        </View>
        <Text style={styles.cardDesc}>{desc}</Text>
        <Text style={styles.cardAction}>{action}</Text>
    </View>
);

const Information = () => {
    const [lang, setLang] = useState('en');
    const t = translations[lang];

    const toggleLang = () => {
        setLang(prev => prev === 'en' ? 'th' : 'en');
    };

    return (
        <SafeAreaView style={{flex:1, backgroundColor: "#F7F9FC"}}>
            <Stack.Screen
                options={{
                    headerStyle: { backgroundColor: "#F7F9FC" },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <ScreenHeaderBtn iconUrl={images.profile} dimension="100" />
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={toggleLang} style={styles.langBtn}>
                            <Ionicons name="language" size={20} color="#e05c5c" />
                            <Text style={styles.langText}>{lang === 'en' ? 'EN / ไทย' : 'ไทย / EN'}</Text>
                        </TouchableOpacity>
                    ),
                    headerTitle: ""
                }}
            />
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.headerContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="paw" size={36} color="#e05c5c" />
                    </View>
                    <Text style={styles.mainTitle}>{t.title}</Text>
                    <Text style={styles.description}>{t.desc}</Text>
                </View>

                <Text style={styles.sectionTitle}>{t.levelsTitle}</Text>
                
                <GradeCard 
                    title={t.grade1Title} 
                    desc={t.grade1Desc} 
                    action={t.grade1Action} 
                    color="#F1C40F" 
                    icon="alert-circle" 
                />
                <GradeCard 
                    title={t.grade2Title} 
                    desc={t.grade2Desc} 
                    action={t.grade2Action} 
                    color="#F39C12" 
                    icon="warning" 
                />
                <GradeCard 
                    title={t.grade3Title} 
                    desc={t.grade3Desc} 
                    action={t.grade3Action} 
                    color="#E67E22" 
                    icon="bandage" 
                />
                <GradeCard 
                    title={t.grade4Title} 
                    desc={t.grade4Desc} 
                    action={t.grade4Action} 
                    color="#E74C3C" 
                    icon="medkit" 
                />
                <GradeCard 
                    title={t.grade5Title} 
                    desc={t.grade5Desc} 
                    action={t.grade5Action} 
                    color="#C0392B" 
                    icon="skull" 
                />

                <View style={styles.actionCard}>
                    <Text style={styles.actionTitle}>{t.whatToDoTitle}</Text>
                    <View style={styles.actionItem}><Ionicons name="checkmark-circle" size={22} color="#4CAF50" /><Text style={styles.actionText}>{t.whatToDo1}</Text></View>
                    <View style={styles.actionItem}><Ionicons name="checkmark-circle" size={22} color="#4CAF50" /><Text style={styles.actionText}>{t.whatToDo2}</Text></View>
                    <View style={styles.actionItem}><Ionicons name="checkmark-circle" size={22} color="#4CAF50" /><Text style={styles.actionText}>{t.whatToDo3}</Text></View>
                    <View style={styles.actionItem}><Ionicons name="checkmark-circle" size={22} color="#4CAF50" /><Text style={styles.actionText}>{t.whatToDo4}</Text></View>
                    <View style={styles.actionItem}><Ionicons name="checkmark-circle" size={22} color="#4CAF50" /><Text style={styles.actionText}>{t.whatToDo5}</Text></View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(224, 92, 92, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    langText: {
        color: '#e05c5c',
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: 14,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFE5E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2C3E50',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 15,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 15,
        marginLeft: 5,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    cardDesc: {
        fontSize: 14,
        color: '#34495E',
        marginBottom: 8,
        lineHeight: 20,
    },
    cardAction: {
        fontSize: 14,
        fontWeight: '600',
        color: '#7F8C8D',
        lineHeight: 20,
    },
    actionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    actionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 15,
    },
    actionItem: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingRight: 20,
    },
    actionText: {
        fontSize: 14,
        color: '#34495E',
        marginLeft: 10,
        lineHeight: 22,
    }
});

export default Information;