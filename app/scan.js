import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useCallback, useContext } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CameraScreen() {
  const { rabbitId } = useLocalSearchParams();
  const { token } = useContext(AuthContext);
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [limb, setLimb] = useState('front_left');
  const cameraRef = useRef(null);
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  const handleZoomChange = useCallback((value) => {
    setZoom(value);
  }, []);

  const pickImage = async() => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect:[4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  if (!isFocused) {
    return <View style={styles.container} />;
  }

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePhoto(){
    if(!cameraRef.current) return;
    try{
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({});
      setPhotoUri(photo.uri);
    } catch(error){
      console.error('Error taking photo:', error);
    } finally{
      setIsLoading(false);
    }
  }  

  function retakePhoto(){
    setPhotoUri(null);
  }

  async function processAndNavigate() {
    if (!photoUri) return;
    if (!token) {
      Alert.alert("Authentication Error", "You must be logged in to scan.");
      return;
    }

    setIsLoading(true);
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
          setIsLoading(false);
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

      const response = await axios.post(`${BASE_URL}/scans/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      router.push({
        pathname: '/Report',
        params: { scanData: JSON.stringify(response.data) }
      });
    } catch (error) {
      console.error('Error processing photo:', error);
      Alert.alert("Scan Failed", error.response?.data?.detail || "Failed to analyze paw photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (photoUri) {
    return (
      <SafeAreaView style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} />

        {/* Limb selection selector */}
        <View style={styles.limbSelectorContainer}>
          <Text style={styles.limbLabel}>Select Paw:</Text>
          <View style={styles.limbButtonsRow}>
            {[
              { id: 'front_left', label: 'Front L' },
              { id: 'front_right', label: 'Front R' },
              { id: 'back_left', label: 'Back L' },
              { id: 'back_right', label: 'Back R' }
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.limbButton,
                  limb === item.id && styles.limbButtonActive
                ]}
                onPress={() => setLimb(item.id)}
              >
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
          <TouchableOpacity style={styles.actionButton} onPress={retakePhoto} disabled={isLoading}>
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#e05c5c' }]} onPress={processAndNavigate} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Process Scan</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if(isLoading) {
    return(
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff"/>
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing={facing} ref={cameraRef} zoom={zoom} />
      
      <SafeAreaView style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]} pointerEvents="box-none">
        <View style={styles.bottomControls}>
          <View style={styles.zoomRow}>
            <Text style={styles.zoomText}>Zoom: {zoom.toFixed(1)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={zoom}
              onValueChange={handleZoomChange}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
            />
          </View>
          <View style={styles.cameraActions}>
            <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
              <Ionicons name="images" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black'
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white'
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'transparent'
  },
  topControls: {
    padding: 20
  },
  bottomControls: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  zoomText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    width: 80,
  },
  slider: {
    flex: 1,
  },
  cameraActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  iconButton: {
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#000',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#333',
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center"
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#000',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  slider: {
    flex: 1,
  },
  image:{
    width:200,
    height: 200,
  },
  limbSelectorContainer: {
    padding: 12,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  limbLabel: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  limbButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  limbButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
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
});