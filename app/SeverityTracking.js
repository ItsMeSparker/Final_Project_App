import React, { useState, useContext, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const background = require('../assets/images/Background_1.png');
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GRADE_CONFIG = {
    0: { color: '#2ECC71', bg: '#E8F8F0', short: 'G0', label: 'Healthy' },
    1: { color: '#F1C40F', bg: '#FEF9E7', short: 'G1', label: 'Grade I' },
    2: { color: '#F39C12', bg: '#FEF5E7', short: 'G2', label: 'Grade II' },
    3: { color: '#E67E22', bg: '#FDF2E9', short: 'G3', label: 'Grade III' },
    4: { color: '#E74C3C', bg: '#FDEDEC', short: 'G4', label: 'Grade IV' },
    5: { color: '#C0392B', bg: '#F9EBEA', short: 'G5', label: 'Grade V' },
};

const GRADES_DESC = [5, 4, 3, 2, 1, 0];
const CHART_HEIGHT = 190;
const TOP_PAD = 18;
const BOTTOM_PAD = 18;
const USABLE_HEIGHT = CHART_HEIGHT - TOP_PAD - BOTTOM_PAD;
const POINT_SPACING = 68;
const LEFT_MARGIN = 30;

const getYForGrade = (grade) => {
    const clamped = Math.max(0, Math.min(5, Number(grade) || 0));
    return TOP_PAD + ((5 - clamped) / 5) * USABLE_HEIGHT;
};

const parseLocalDate = (isoString) => {
    if (!isoString) return null;
    const str = String(isoString);
    // If the timestamp from DB has no timezone indicator, treat it as UTC ('Z') so JS converts it to device local timezone
    const normalized = /(Z|[+-]\d{2}:\d{2})$/.test(str) ? str : `${str}Z`;
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
};

const formatShortDate = (isoString) => {
    const d = parseLocalDate(isoString);
    if (!d) return '';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${monthNames[d.getMonth()]}`;
};

const formatShortTime = (isoString) => {
    const d = parseLocalDate(isoString);
    if (!d) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getTrendInfo = (sortedScans) => {
    if (!sortedScans || sortedScans.length === 0) return null;
    if (sortedScans.length === 1) {
        return { label: 'Baseline', icon: 'Analytics', color: '#7F8C8D', bg: '#F2F4F4', iconName: 'remove-outline' };
    }
    const prev = sortedScans[sortedScans.length - 2].classification;
    const curr = sortedScans[sortedScans.length - 1].classification;
    if (curr < prev) {
        return { label: 'Improving', color: '#27AE60', bg: '#E8F8F0', iconName: 'trending-down' };
    }
    if (curr > prev) {
        return { label: 'Worsening', color: '#E74C3C', bg: '#FDEDEC', iconName: 'trending-up' };
    }
    return { label: 'Stable', color: '#2980B9', bg: '#EBF5FB', iconName: 'swap-horizontal' };
};

const LimbTimelineCard = ({ limbKey, limbTitle, scans, onSelectReport, onScanNow }) => {
    // Sort scans oldest -> newest for the timeline X-axis
    const sortedScans = React.useMemo(() => {
        return [...scans].sort((a, b) => new Date(a.analyzed_at) - new Date(b.analyzed_at));
    }, [scans]);

    const [selectedScan, setSelectedScan] = useState(null);

    // Default selected point to latest scan when data loads/changes
    React.useEffect(() => {
        if (sortedScans.length > 0) {
            setSelectedScan(sortedScans[sortedScans.length - 1]);
        } else {
            setSelectedScan(null);
        }
    }, [sortedScans]);

    const trend = getTrendInfo(sortedScans);
    const minPlotWidth = SCREEN_WIDTH - 135;
    const plotWidth = Math.max(minPlotWidth, sortedScans.length * POINT_SPACING + LEFT_MARGIN);

    const points = sortedScans.map((scan, index) => {
        const x =
            sortedScans.length === 1
                ? plotWidth / 2
                : LEFT_MARGIN + index * POINT_SPACING;
        const y = getYForGrade(scan.classification);
        return { x, y, scan };
    });

    return (
        <View style={styles.card}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
                <View style={styles.limbTitleRow}>
                    <View style={styles.pawIconBadge}>
                        <Ionicons name="paw" size={18} color="#e05c5c" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>{limbTitle}</Text>
                        <Text style={styles.cardSubtitle}>
                            {sortedScans.length} {sortedScans.length === 1 ? 'scan recorded' : 'scans recorded'}
                        </Text>
                    </View>
                </View>

                {trend && (
                    <View style={[styles.trendBadge, { backgroundColor: trend.bg }]}>
                        <Ionicons name={trend.iconName} size={14} color={trend.color} style={{ marginRight: 4 }} />
                        <Text style={[styles.trendText, { color: trend.color }]}>{trend.label}</Text>
                    </View>
                )}
            </View>

            {sortedScans.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="analytics-outline" size={40} color="#ccc" />
                    <Text style={styles.emptyTitle}>No scans for {limbTitle.toLowerCase()} yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Record paw scans to track pododermatitis severity grades over time.
                    </Text>
                    <TouchableOpacity style={styles.scanEmptyBtn} onPress={onScanNow} activeOpacity={0.8}>
                        <Ionicons name="camera-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.scanEmptyBtnText}>Scan Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    {/* Timeline Graph Container */}
                    <View style={styles.chartWrapper}>
                        {/* Fixed Y-Axis (Classification Grade 0 - 5) */}
                        <View style={[styles.yAxisColumn, { height: CHART_HEIGHT }]}>
                            {GRADES_DESC.map((grade) => {
                                const top = getYForGrade(grade) - 10;
                                const cfg = GRADE_CONFIG[grade];
                                return (
                                    <View key={grade} style={[styles.yAxisLabelContainer, { top }]}>
                                        <View style={[styles.yGradeDot, { backgroundColor: cfg.color }]} />
                                        <Text style={styles.yAxisText}>{cfg.short}</Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Scrollable Plot Area + X-Axis */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ width: plotWidth }}
                        >
                            <View style={{ width: plotWidth }}>
                                {/* Plot Canvas */}
                                <View style={{ height: CHART_HEIGHT, width: plotWidth, position: 'relative' }}>
                                    {/* Horizontal Grid Lines for Grades 0-5 */}
                                    {GRADES_DESC.map((grade) => {
                                        const y = getYForGrade(grade);
                                        return (
                                            <View
                                                key={`grid-${grade}`}
                                                style={[
                                                    styles.gridLine,
                                                    {
                                                        top: y,
                                                        borderColor: grade === 0 ? '#D5F5E3' : '#ECECEC',
                                                    },
                                                ]}
                                            />
                                        );
                                    })}

                                    {/* Connecting Line Segments */}
                                    {points.map((pt, idx) => {
                                        if (idx === points.length - 1) return null;
                                        const nextPt = points[idx + 1];
                                        const dx = nextPt.x - pt.x;
                                        const dy = nextPt.y - pt.y;
                                        const length = Math.sqrt(dx * dx + dy * dy);
                                        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                                        const cx = (pt.x + nextPt.x) / 2;
                                        const cy = (pt.y + nextPt.y) / 2;

                                        return (
                                            <View
                                                key={`line-${pt.scan.photo_id}`}
                                                pointerEvents="none"
                                                style={[
                                                    styles.lineSegment,
                                                    {
                                                        width: length,
                                                        left: cx - length / 2,
                                                        top: cy - 1.5,
                                                        transform: [{ rotate: `${angle}deg` }],
                                                    },
                                                ]}
                                            />
                                        );
                                    })}

                                    {/* Data Point Nodes */}
                                    {points.map((pt) => {
                                        const cfg = GRADE_CONFIG[pt.scan.classification] || GRADE_CONFIG[1];
                                        const isSelected = selectedScan?.photo_id === pt.scan.photo_id;
                                        return (
                                            <TouchableOpacity
                                                key={pt.scan.photo_id}
                                                onPress={() => setSelectedScan(pt.scan)}
                                                activeOpacity={0.8}
                                                style={[
                                                    styles.pointTouchArea,
                                                    {
                                                        left: pt.x - 18,
                                                        top: pt.y - 18,
                                                    },
                                                ]}
                                            >
                                                <View
                                                    style={[
                                                        styles.pointOuter,
                                                        {
                                                            backgroundColor: cfg.color,
                                                            borderColor: isSelected ? '#2C3E50' : '#fff',
                                                            transform: [{ scale: isSelected ? 1.25 : 1 }],
                                                        },
                                                    ]}
                                                >
                                                    <Text style={styles.pointGradeText}>{pt.scan.classification}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* X-Axis Date Labels */}
                                <View style={styles.xAxisRow}>
                                    {points.map((pt) => {
                                        const isSelected = selectedScan?.photo_id === pt.scan.photo_id;
                                        return (
                                            <TouchableOpacity
                                                key={`xlabel-${pt.scan.photo_id}`}
                                                onPress={() => setSelectedScan(pt.scan)}
                                                style={[
                                                    styles.xAxisLabelBox,
                                                    { left: pt.x - 32 },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.xAxisDateText,
                                                        isSelected && styles.xAxisDateTextSelected,
                                                    ]}
                                                >
                                                    {formatShortDate(pt.scan.analyzed_at)}
                                                </Text>
                                                <Text style={styles.xAxisTimeText}>
                                                    {formatShortTime(pt.scan.analyzed_at)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </ScrollView>
                    </View>

                    {/*Axis Caption */}
                    <View style={styles.axisLegendRow}>
                        <Text style={styles.axisHintText}>Y-Axis: Classification Grade (G0–G5)</Text>
                        <Text style={styles.axisHintText}>X-Axis: Scan Date • Tap point for details</Text>
                    </View>

                    {/* Selected Scan Details Box */}
                    {selectedScan && (
                        <TouchableOpacity
                            style={styles.selectedScanCard}
                            activeOpacity={0.85}
                            onPress={() => onSelectReport(selectedScan)}
                        >
                            {selectedScan.image_url ? (
                                <Image
                                    source={{ uri: `${BASE_URL}${selectedScan.image_url}` }}
                                    style={styles.selectedThumb}
                                />
                            ) : (
                                <View style={styles.selectedThumbPlaceholder}>
                                    <Ionicons name="paw" size={20} color="#e05c5c" />
                                </View>
                            )}

                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <View
                                        style={[
                                            styles.miniGradePill,
                                            {
                                                backgroundColor:
                                                    (GRADE_CONFIG[selectedScan.classification] || GRADE_CONFIG[1]).color,
                                            },
                                        ]}
                                    >
                                        <Text style={styles.miniGradePillText}>
                                            Grade {selectedScan.classification}
                                        </Text>
                                    </View>
                                    <Text style={styles.selectedDateText}>
                                        {parseLocalDate(selectedScan.analyzed_at)?.toLocaleDateString()} •{' '}
                                        {formatShortTime(selectedScan.analyzed_at)}
                                    </Text>
                                </View>
                                <Text style={styles.selectedGradeTitle} numberOfLines={1}>
                                    {selectedScan.grade_title ||
                                        (GRADE_CONFIG[selectedScan.classification] || GRADE_CONFIG[1]).label}
                                </Text>
                            </View>

                            <View style={styles.viewReportBtn}>
                                <Text style={styles.viewReportText}>Report</Text>
                                <Ionicons name="chevron-forward" size={14} color="#e05c5c" />
                            </View>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
};

const SeverityTracking = () => {
    const router = useRouter();
    const { rabbitId, rabbitName } = useLocalSearchParams();
    const { token } = useContext(AuthContext);

    const [name, setName] = useState(rabbitName || '');
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('both'); // 'both' | 'back_left' | 'back_right'

    const loadTimelineData = async () => {
        if (!rabbitId || !token) {
            setLoading(false);
            return;
        }
        try {
            const requests = [
                axios.get(`${BASE_URL}/scans/rabbit/${rabbitId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ];
            if (!rabbitName) {
                requests.push(
                    axios.get(`${BASE_URL}/rabbits/${rabbitId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                );
            }
            const [scansRes, rabbitRes] = await Promise.all(requests);
            setScans(scansRes.data || []);
            if (rabbitRes?.data?.name) {
                setName(rabbitRes.data.name);
            }
        } catch (error) {
            console.log('Error loading severity timeline:', error);
            if (error.response?.status !== 401) {
                Alert.alert('Error', 'Failed to load severity timeline data.');
            }
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadTimelineData();
        }, [rabbitId, token])
    );

    const backLeftScans = scans.filter((s) => s.limb === 'back_left');
    const backRightScans = scans.filter((s) => s.limb === 'back_right');

    const handleOpenReport = (scan) => {
        router.push({
            pathname: '/Report',
            params: { scanData: JSON.stringify(scan) },
        });
    };

    const handleScanNow = () => {
        router.push({
            pathname: '/scan',
            params: { rabbitId },
        });
    };

    return (
        <ImageBackground
            source={background}
            resizeMode="cover"
            style={{ flex: 1 }}
            imageStyle={{ transform: [{ scale: 1.1 }] }}
        >
            <Stack.Screen
                options={{
                    headerStyle: { backgroundColor: 'transparent' },
                    headerTransparent: true,
                    headerTitle: name ? `${name}'s Timeline` : 'Severity Timeline',
                    headerTitleStyle: { color: '#fff', fontWeight: 'bold' },
                    headerTintColor: '#fff',
                }}
            />

            {loading ? (
                <View style={styles.loadingCenter}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    {/* Limb Filter Switcher */}
                    <View style={styles.filterBar}>
                        {[
                            { key: 'both', label: 'Both Limbs' },
                            { key: 'back_left', label: `Back Left (${backLeftScans.length})` },
                            { key: 'back_right', label: `Back Right (${backRightScans.length})` },
                        ].map((tab) => {
                            const active = activeFilter === tab.key;
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    style={[styles.filterTab, active && styles.filterTabActive]}
                                    onPress={() => setActiveFilter(tab.key)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Grade Severity Reference Bar */}
                    <View style={styles.legendCard}>
                        <Text style={styles.legendHeader}>SEVERITY GRADE SCALE</Text>
                        <View style={styles.legendPillsRow}>
                            {[0, 1, 2, 3, 4, 5].map((g) => {
                                const cfg = GRADE_CONFIG[g];
                                return (
                                    <View key={g} style={[styles.legendPill, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
                                        <View style={[styles.legendDot, { backgroundColor: cfg.color }]} />
                                        <Text style={[styles.legendPillText, { color: cfg.color }]}>
                                            {g === 0 ? 'G0 Healthy' : `G${g}`}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Back Left Paw Timeline */}
                    {(activeFilter === 'both' || activeFilter === 'back_left') && (
                        <LimbTimelineCard
                            limbKey="back_left"
                            limbTitle="Back Left Paw"
                            scans={backLeftScans}
                            onSelectReport={handleOpenReport}
                            onScanNow={handleScanNow}
                        />
                    )}

                    {/* Back Right Paw Timeline */}
                    {(activeFilter === 'both' || activeFilter === 'back_right') && (
                        <LimbTimelineCard
                            limbKey="back_right"
                            limbTitle="Back Right Paw"
                            scans={backRightScans}
                            onSelectReport={handleOpenReport}
                            onScanNow={handleScanNow}
                        />
                    )}
                </ScrollView>
            )}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    loadingCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 18,
        paddingTop: 105,
        paddingBottom: 40,
    },
    filterBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 14,
        padding: 4,
        marginBottom: 14,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 9,
        borderRadius: 11,
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
    },
    filterTabText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    filterTabTextActive: {
        color: '#e05c5c',
        fontWeight: 'bold',
    },
    legendCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.93)',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 16,
    },
    legendHeader: {
        fontSize: 10,
        fontWeight: '700',
        color: '#7F8C8D',
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    legendPillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    legendPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
    },
    legendDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    legendPillText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        borderRadius: 20,
        padding: 18,
        width: '100%',
        marginBottom: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    limbTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pawIconBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFEAEA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 1,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    trendText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    chartWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FAFAFA',
        borderRadius: 14,
        paddingVertical: 10,
        paddingRight: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    yAxisColumn: {
        width: 44,
        position: 'relative',
        borderRightWidth: 1,
        borderRightColor: '#E5E7E9',
    },
    yAxisLabelContainer: {
        position: 'absolute',
        left: 6,
        flexDirection: 'row',
        alignItems: 'center',
        height: 20,
    },
    yGradeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    yAxisText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#555',
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        borderBottomWidth: 1,
        borderStyle: 'dashed',
    },
    lineSegment: {
        position: 'absolute',
        height: 3,
        backgroundColor: '#e05c5c',
        borderRadius: 2,
        opacity: 0.75,
    },
    pointTouchArea: {
        position: 'absolute',
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    pointOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    pointGradeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    xAxisRow: {
        height: 36,
        position: 'relative',
        marginTop: 4,
    },
    xAxisLabelBox: {
        position: 'absolute',
        width: 64,
        alignItems: 'center',
    },
    xAxisDateText: {
        fontSize: 11,
        color: '#555',
        fontWeight: '600',
    },
    xAxisDateTextSelected: {
        color: '#e05c5c',
        fontWeight: 'bold',
    },
    xAxisTimeText: {
        fontSize: 9,
        color: '#999',
        marginTop: 1,
    },
    axisLegendRow: {
        flexDirection: 'column',
        gap: 2,
        marginTop: 8,
        paddingHorizontal: 4,
    },
    axisHintText: {
        fontSize: 10,
        color: '#95A5A6',
        fontWeight: '500',
    },
    selectedScanCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F8',
        borderRadius: 14,
        padding: 10,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#FADBD8',
    },
    selectedThumb: {
        width: 44,
        height: 44,
        borderRadius: 10,
    },
    selectedThumbPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#FFEAEA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniGradePill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    miniGradePillText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    selectedDateText: {
        fontSize: 11,
        color: '#7F8C8D',
    },
    selectedGradeTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginTop: 3,
    },
    viewReportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    viewReportText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#e05c5c',
        marginRight: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 22,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
        marginTop: 8,
    },
    emptySubtitle: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 4,
        paddingHorizontal: 20,
    },
    scanEmptyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A90E2',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        marginTop: 12,
    },
    scanEmptyBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export default SeverityTracking;
