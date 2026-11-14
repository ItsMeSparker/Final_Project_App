import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useCallback, useContext, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Image, Alert, Dimensions, Animated, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guide frame dimensions matching the close-up vertical paw proportions in the dataset
const GUIDE_WIDTH = Math.round(SCREEN_WIDTH * 0.65);
const GUIDE_HEIGHT = Math.round(SCREEN_HEIGHT * 0.48);

const GUIDE_ASPECT = GUIDE_WIDTH / GUIDE_HEIGHT;
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Reusable paw alignment guide (used on live camera and on gallery photo review)
function PawGuideFrame({ width = GUIDE_WIDTH, height = GUIDE_HEIGHT, showSilhouette = true }) {
  return (
    <View style={[styles.guideFrame, { width, height }]}>
      {/* 4 Corner Framing Brackets */}
      <View style={[styles.cornerBracket, styles.cornerTL]} />
      <View style={[styles.cornerBracket, styles.cornerTR]} />
      <View style={[styles.cornerBracket, styles.cornerBL]} />
      <View style={[styles.cornerBracket, styles.cornerBR]} />

      {/* Tapered Hind Paw Silhouette */}
      {showSilhouette && (
      <View style={styles.pawSilhouetteContainer}>
        {/* Top Label: TOES */}
        <View style={styles.zonePillTop}>
          <Text style={styles.zonePillText}>▲ TOES (FOREFOOT)</Text>
        </View>

        {/* Upper Forefoot / Toes Contour (Wider) */}
        <View style={styles.pawUpperContour}>
          <Text style={styles.contourHintText}>Wider Toe Pad</Text>
        </View>

        {/* Mid-sole Waist Connectors */}
        <View style={styles.pawWaistRow}>
          <View style={styles.waistTickLeft} />
          <Text style={styles.waistLabel}>MID-SOLE</Text>
          <View style={styles.waistTickRight} />
        </View>

        {/* Lower Heel / Hock Contour (Narrower) */}
        <View style={styles.pawLowerContour}>
          {/* Target Hock Inspection Circle */}
          <View style={styles.hockTargetZone}>
            <Text style={styles.hockTargetText}>HOCK</Text>
          </View>
        </View>

        {/* Bottom Label: HEEL */}
        <View style={styles.zonePillBottom}>
          <Text style={styles.zonePillText}>▼ HEEL / HOCK</Text>
        </View>
      </View>
      )}
    </View>
  );
}

// Gallery photo aligner: the guide stays fixed while the user drags / pinches the photo
// underneath it. getCrop() returns the area inside the guide as normalized (0–1) coordinates.
const PawAlignEditor = forwardRef(function PawAlignEditor(
  { uri, imageWidth, imageHeight, showSilhouette },
  ref
) {
  const containerRef = useRef(null);
  const originRef = useRef({ x: 0, y: 0 }); // container position in window coords
  const [layout, setLayout] = useState(null);

  const geo = useMemo(() => {
    if (!layout || !imageWidth || !imageHeight) return null;
    // Fit the guide inside the available area while keeping the camera guide's proportions
    let frameH = Math.min(GUIDE_HEIGHT, layout.height - 70);
    let frameW = frameH * GUIDE_ASPECT;
    if (frameW > layout.width - 40) {
      frameW = layout.width - 40;
      frameH = frameW / GUIDE_ASPECT;
    }
    // At zoom 1 the photo just covers the guide frame
    const baseScale = Math.max(frameW / imageWidth, frameH / imageHeight);
    return {
      containerW: layout.width,
      containerH: layout.height,
      frameW,
      frameH,
      baseScale,
      dispW: imageWidth * baseScale,
      dispH: imageHeight * baseScale,
    };
  }, [layout, imageWidth, imageHeight]);

  const geoRef = useRef(null);
  geoRef.current = geo;

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const current = useRef({ tx: 0, ty: 0, z: 1 });
  const gesture = useRef({ startTx: 0, startTy: 0, startZ: 1, startX: 0, startY: 0, startDist: 1, touchCount: 0 });

  // Clamp so the photo always fully covers the guide frame, then apply
  const apply = useCallback((tx, ty, z) => {
    const g = geoRef.current;
    if (!g) return;
    const nz = clamp(z, MIN_ZOOM, MAX_ZOOM);
    const maxTx = Math.max(0, (g.dispW * nz - g.frameW) / 2);
    const maxTy = Math.max(0, (g.dispH * nz - g.frameH) / 2);
    const ntx = clamp(tx, -maxTx, maxTx);
    const nty = clamp(ty, -maxTy, maxTy);
    current.current = { tx: ntx, ty: nty, z: nz };
    translateX.setValue(ntx);
    translateY.setValue(nty);
    scale.setValue(nz);
  }, [translateX, translateY, scale]);

  // Reset alignment whenever a new photo is loaded or the layout changes
  useEffect(() => {
    apply(0, 0, 1);
  }, [uri, geo, apply]);

  const beginGesture = useCallback((touches) => {
    const g = gesture.current;
    g.startTx = current.current.tx;
    g.startTy = current.current.ty;
    g.startZ = current.current.z;
    g.touchCount = touches.length;
    if (touches.length >= 2) {
      const [a, b] = touches;
      g.startDist = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) || 1;
      g.startX = (a.pageX + b.pageX) / 2;
      g.startY = (a.pageY + b.pageY) / 2;
    } else if (touches.length === 1) {
      g.startX = touches[0].pageX;
      g.startY = touches[0].pageY;
    }
  }, []);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (evt) => beginGesture(evt.nativeEvent.touches),
    onPanResponderMove: (evt) => {
      const touches = evt.nativeEvent.touches;
      const g = gesture.current;
      // A finger was added or lifted: re-baseline so the photo doesn't jump
      if (touches.length !== g.touchCount) {
        beginGesture(touches);
        return;
      }
      if (touches.length >= 2) {
        const geoNow = geoRef.current;
        if (!geoNow) return;
        const [a, b] = touches;
        const dist = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
        const midX = (a.pageX + b.pageX) / 2;
        const midY = (a.pageY + b.pageY) / 2;
        const z = clamp(g.startZ * (dist / g.startDist), MIN_ZOOM, MAX_ZOOM);
        const r = z / g.startZ;
        // Keep the point under the fingers fixed while zooming
        const cx = originRef.current.x + geoNow.containerW / 2;
        const cy = originRef.current.y + geoNow.containerH / 2;
        const tx = midX - cx - r * (g.startX - cx - g.startTx);
        const ty = midY - cy - r * (g.startY - cy - g.startTy);
        apply(tx, ty, z);
      } else if (touches.length === 1) {
        apply(
          g.startTx + (touches[0].pageX - g.startX),
          g.startTy + (touches[0].pageY - g.startY),
          g.startZ
        );
      }
    },
  }), [apply, beginGesture]);

  useImperativeHandle(ref, () => ({
    getCrop: () => {
      const g = geoRef.current;
      if (!g) return null;
      const { tx, ty, z } = current.current;
      const s = g.baseScale * z; // screen px per image px
      const left = (g.dispW * z / 2 - g.frameW / 2 - tx) / s;
      const top = (g.dispH * z / 2 - g.frameH / 2 - ty) / s;
      return {
        x: clamp(left / imageWidth, 0, 1),
        y: clamp(top / imageHeight, 0, 1),
        width: clamp(g.frameW / s / imageWidth, 0, 1),
        height: clamp(g.frameH / s / imageHeight, 0, 1),
      };
    },
    reset: () => apply(0, 0, 1),
  }), [apply, imageWidth, imageHeight]);

  const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
    containerRef.current?.measureInWindow((x, y) => {
      originRef.current = { x, y };
    });
  };

  return (
    <View
      ref={containerRef}
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
      onLayout={onLayout}
      {...panResponder.panHandlers}
    >
      {geo && (
        <>
          <Animated.Image
            source={{ uri }}
            style={{
              position: 'absolute',
              width: geo.dispW,
              height: geo.dispH,
              left: (geo.containerW - geo.dispW) / 2,
              top: (geo.containerH - geo.dispH) / 2,
              transform: [{ translateX }, { translateY }, { scale }],
            }}
          />

          {/* Dimmed mask around the guide frame (the area that will be cropped away) */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={[styles.alignMask, { height: (geo.containerH - geo.frameH) / 2 }]} />
            <View style={{ flexDirection: 'row', height: geo.frameH }}>
              <View style={[styles.alignMask, { flex: 1 }]} />
              <PawGuideFrame width={geo.frameW} height={geo.frameH} showSilhouette={showSilhouette} />
              <View style={[styles.alignMask, { flex: 1 }]} />
            </View>
            <View style={[styles.alignMask, { flex: 1 }]} />
          </View>
        </>
      )}
    </View>
  );
});

export default function CameraScreen() {
  const { rabbitId } = useLocalSearchParams();
  const { token } = useContext(AuthContext);
  const [facing, setFacing] = useState('back');
  const [torch, setTorch] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [limb, setLimb] = useState('back_left');
  const [photoSource, setPhotoSource] = useState(null); // 'camera' | 'gallery'
  const [showGuide, setShowGuide] = useState(true);
  const [photoSize, setPhotoSize] = useState(null); // { width, height } of gallery photo
  const alignRef = useRef(null);
  const cameraRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      isSubmittingRef.current = false;
      setIsLoading(false);
      return () => {
        setIsFocused(false);
        setTorch(false);
      };
    }, [])
  );

  const handleZoomChange = useCallback((value) => {
    setZoom(value);
  }, []);

  const pickImage = async () => {
    if (isSubmittingRef.current || isLoading) return;
    // Use quality < 1 so iOS/Android always transcodes HEIC/HEIF gallery photos to standard JPEG
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setPhotoSource('gallery');
      setShowGuide(true);
      if (asset.width && asset.height) {
        setPhotoSize({ width: asset.width, height: asset.height });
      } else {
        setPhotoSize(null);
        Image.getSize(asset.uri, (width, height) => setPhotoSize({ width, height }));
      }
      setPhotoUri(asset.uri);
    }
  };

  if (!isFocused) {
    return <View style={styles.container} />;
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => {
      const next = current === 'back' ? 'front' : 'back';
      if (next === 'front') setTorch(false);
      return next;
    });
  }

  function toggleTorch() {
    if (facing === 'back') {
      setTorch(current => !current);
    }
  }

  async function takePhoto() {
    if (!cameraRef.current) return;
    try {
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
      });
      setTorch(false);
      setPhotoSource('camera');
      setPhotoUri(photo.uri);
    } catch (error) {
      console.error('Error taking photo:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function retakePhoto() {
    if (isSubmittingRef.current) return;
    setPhotoUri(null);
    setPhotoSource(null);
    setPhotoSize(null);
  }

  async function processAndNavigate() {
    if (!photoUri || isSubmittingRef.current || isLoading) return;
    if (!token) {
      Alert.alert("Authentication Error", "You must be logged in to scan.");
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    let succeeded = false;
    try {
      let targetRabbitId = rabbitId;
      if (!targetRabbitId) {
        const rabbitsRes = await axios.get(`${BASE_URL}/rabbits/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (rabbitsRes.data && rabbitsRes.data.length > 0) {
          targetRabbitId = rabbitsRes.data[0].id;
        } else {
          Alert.alert("No Rabbit Found", "Please create a rabbit profile first before scanning.");
          return;
        }
      }

      const formData = new FormData();
      const filename = photoUri.split('/').pop() || 'paw_scan.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: photoUri,
        name: filename,
        type: type,
      });
      formData.append('rabbit_id', targetRabbitId);
      formData.append('limb', limb);

      // Gallery photos: send the area inside the paw guide so the server crops to it
      if (photoSource === 'gallery' && alignRef.current) {
        const crop = alignRef.current.getCrop();
        if (crop) {
          formData.append('crop_x', String(crop.x));
          formData.append('crop_y', String(crop.y));
          formData.append('crop_w', String(crop.width));
          formData.append('crop_h', String(crop.height));
        }
      }

      const response = await axios.post(`${BASE_URL}/scans/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      succeeded = true;
      router.replace({
        pathname: '/Report',
        params: { scanData: JSON.stringify(response.data) }
      });
    } catch (error) {
      console.error('Error processing photo:', error);
      if (error.response?.status !== 401) {
        Alert.alert("Scan Failed", error.response?.data?.detail || "Failed to analyze paw photo. Please try again.");
      }
    } finally {
      if (!succeeded) {
        isSubmittingRef.current = false;
        setIsLoading(false);
      }
    }
  }

  // 1. POST-CAPTURE PREVIEW SCREEN (with Limb Selector)
  if (photoUri) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitle: 'Review Paw Scan',
            headerRight: () => null,
          }}
        />
        <View style={styles.previewWrapper}>
          {photoSource === 'gallery' && photoSize ? (
            // Draggable / pinchable photo under a fixed paw guide
            <PawAlignEditor
              ref={alignRef}
              uri={photoUri}
              imageWidth={photoSize.width}
              imageHeight={photoSize.height}
              showSilhouette={showGuide}
            />
          ) : (
            <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />
          )}

          {photoSource === 'gallery' && photoSize && (
            <View style={styles.alignToolbar}>
              <TouchableOpacity
                style={styles.guideToggleButton}
                onPress={() => alignRef.current?.reset()}
                activeOpacity={0.8}
              >
                <Ionicons name="scan-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.guideToggleText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.guideToggleButton}
                onPress={() => setShowGuide((v) => !v)}
                activeOpacity={0.8}
              >
                <Ionicons name={showGuide ? 'eye-off-outline' : 'eye-outline'} size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.guideToggleText}>{showGuide ? 'Hide Outline' : 'Show Outline'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.previewCheckBanner} pointerEvents="none">
            <Ionicons
              name={photoSource === 'gallery' ? 'move-outline' : 'checkmark-circle-outline'}
              size={16}
              color="#2ECC71"
            />
            <Text style={styles.previewCheckText}>
              {photoSource === 'gallery'
                ? 'Drag & pinch the photo to fit the paw inside the outline'
                : 'Make sure the full sole (toes to heel) is centered and sharp'}
            </Text>
          </View>
        </View>

        {/* Limb selection selector (appears after taking picture) */}
        <View style={styles.limbSelectorContainer}>
          <Text style={styles.limbLabel}>Select Which Hind Paw Was Scanned:</Text>
          <View style={styles.limbButtonsRow}>
            {[
              { id: 'back_left', label: 'Back Left Paw' },
              { id: 'back_right', label: 'Back Right Paw' }
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.limbButton,
                  limb === item.id && styles.limbButtonActive
                ]}
                onPress={() => setLimb(item.id)}
                disabled={isLoading}
              >
                <Ionicons
                  name="paw"
                  size={15}
                  color={limb === item.id ? '#fff' : '#bbb'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[
                  styles.limbButtonText,
                  limb === item.id && styles.limbButtonTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.previewButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={photoSource === 'gallery' ? pickImage : retakePhoto}
            disabled={isLoading}
          >
            <Ionicons name={photoSource === 'gallery' ? 'images-outline' : 'refresh'} size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>{photoSource === 'gallery' ? 'Choose Another' : 'Retake'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#e05c5c' }, isLoading && { opacity: 0.65 }]}
            onPress={processAndNavigate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Processing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.buttonText}>Process Scan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e05c5c" />
        <Text style={{ marginTop: 10, color: '#333', fontWeight: '600' }}>Capturing...</Text>
      </SafeAreaView>
    );
  }

  // 2. LIVE CAMERA SCREEN WITH PAW ALIGNMENT GUIDE
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: '#fff',
          headerTitle: 'Scan Rabbit Paw',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () =>
            facing === 'back' ? (
              <TouchableOpacity
                onPress={toggleTorch}
                style={[styles.torchButton, torch && styles.torchButtonActive]}
              >
                <Ionicons
                  name={torch ? 'flash' : 'flash-off-outline'}
                  size={20}
                  color={torch ? '#FFD700' : '#fff'}
                />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={torch}
        ref={cameraRef}
        zoom={zoom}
      />

      {/* Unified Overlay Column: Top Mask -> Guide Frame -> Hint Text -> Bottom Controls */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Top dimmed area + Instruction Pill */}
        <View style={styles.maskTop} pointerEvents="none">
          <View style={styles.instructionBanner}>
            <Ionicons name="paw" size={16} color="#FFE0E0" style={{ marginRight: 8 }} />
            <Text style={styles.instructionText}>
              Point <Text style={styles.instructionHighlight}>TOES UP</Text> & fill the foot outline
            </Text>
          </View>
        </View>

        {/* Middle Row: Left Mask + Guide Window + Right Mask */}
        <View style={styles.maskMiddleRow} pointerEvents="none">
          <View style={styles.maskSide} />

          {/* Target Guide Frame */}
          <PawGuideFrame />

          <View style={styles.maskSide} />
        </View>

        {/* Bottom dimmed area with Distance Hint */}
        <View style={styles.maskBottom} pointerEvents="none">
          <Text style={styles.distanceHintText}>
            Hold camera 10–15 cm above the sole • Keep fur in sharp focus
          </Text>
        </View>

        {/* Interactive Bottom Camera Controls (stacked below maskBottom so it never overlaps) */}
        <View style={styles.bottomControlsOuter}>
          <View style={styles.bottomControls}>
            <View style={styles.zoomRow}>
              <Ionicons name="search-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.zoomText}>Zoom {(1 + zoom * 2).toFixed(1)}x</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={zoom}
                onValueChange={handleZoomChange}
                minimumTrackTintColor="#e05c5c"
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                thumbTintColor="#fff"
              />
            </View>
            <View style={styles.cameraActions}>
              <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
                <Ionicons name="images" size={26} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse" size={26} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  torchButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  torchButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    borderColor: '#FFD700',
  },

  /* Camera Guide Mask & Overlay */
  maskTop: {
    flex: 1,
    paddingTop: 76,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(224, 92, 92, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  instructionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  instructionHighlight: {
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  maskMiddleRow: {
    flexDirection: 'row',
    height: GUIDE_HEIGHT,
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  guideFrame: {
    width: GUIDE_WIDTH,
    height: GUIDE_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskBottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  distanceHintText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* Corner Framing Brackets */
  cornerBracket: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#ffffff',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 14,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 14,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 14,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 14,
  },

  /* Tapered Paw Silhouette inside Guide Frame */
  pawSilhouetteContainer: {
    width: '90%',
    height: '93%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  zonePillTop: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    marginBottom: 5,
  },
  zonePillBottom: {
    backgroundColor: 'rgba(224, 92, 92, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 5,
  },
  zonePillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  pawUpperContour: {
    width: '92%',
    flex: 1.15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.88)',
    borderStyle: 'dashed',
    borderBottomWidth: 0,
    borderTopLeftRadius: 105,
    borderTopRightRadius: 105,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  contourHintText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  pawWaistRow: {
    width: '76%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: -2,
  },
  waistTickLeft: {
    width: 18,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  waistLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  waistTickRight: {
    width: 18,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  pawLowerContour: {
    width: '74%',
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.88)',
    borderStyle: 'dashed',
    borderTopWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  hockTargetZone: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: 'rgba(224, 92, 92, 0.95)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(224, 92, 92, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hockTargetText: {
    color: '#FFE0E0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
  },

  /* Bottom Camera Controls */
  bottomControlsOuter: {
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 44,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  zoomText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    width: 72,
  },
  slider: {
    flex: 1,
  },
  cameraActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 26,
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(224, 92, 92, 0.45)',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Preview Screen Styles */
  previewWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0a0a0a',
    position: 'relative',
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  alignMask: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  alignToolbar: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  guideToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  guideToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  previewCheckBanner: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  previewCheckText: {
    color: '#eee',
    fontSize: 12,
    fontWeight: '500',
  },
  limbSelectorContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#141414',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  limbLabel: {
    color: '#bbb',
    fontSize: 13,
    marginBottom: 10,
    fontWeight: '600',
  },
  limbButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  limbButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#444',
  },
  limbButtonActive: {
    backgroundColor: '#e05c5c',
    borderColor: '#e05c5c',
  },
  limbButtonText: {
    color: '#bbb',
    fontSize: 13,
    fontWeight: '600',
  },
  limbButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    gap: 14,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
    backgroundColor: '#2c2c2c',
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
