import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

const CameraScreen = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);
  const [isSimulator, setIsSimulator] = useState(false);

  // Check if running on simulator
  useEffect(() => {
    const checkSimulator = async () => {
      try {
        // For newer versions of expo-camera, we'll just assume camera is available
        // and handle errors gracefully
        setIsSimulator(false);
      } catch (error) {
        setIsSimulator(true);
      }
    };
    checkSimulator();
  }, []);

  // Request camera permission
  const handleCameraPermission = async () => {
    if (!permission) {
      const { status } = await requestPermission();
      if (status === 'granted') {
        setShowCamera(true);
      } else {
        Alert.alert('Camera permission denied');
      }
    } else if (permission.granted) {
      setShowCamera(true);
    } else {
      const { status } = await requestPermission();
      if (status === 'granted') {
        setShowCamera(true);
      } else {
        Alert.alert('Camera permission denied');
      }
    }
  };

  // Take a photo
  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          exif: false,
        });
        console.log('Photo taken:', photo);
        Alert.alert('Photo taken!', `URI: ${photo.uri}`);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!showCamera) {
    return (
      <View style={styles.container}>
        {isSimulator && (
          <Text style={styles.simulatorText}>
            Camera not available in simulator. Please test on device.
          </Text>
        )}
        <TouchableOpacity style={styles.button} onPress={handleCameraPermission}>
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          <Text style={styles.captureText}>📸</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.flipButton} 
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
        >
          <Text style={styles.buttonText}>Flip</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => setShowCamera(false)}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  captureButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureText: {
    fontSize: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
  },
  flipButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraScreen;