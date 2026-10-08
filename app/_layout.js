import { Stack, useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect, useContext } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

const InitialLayout = () => {
    const { user, isLoading } = useContext(AuthContext);
    const segments = useSegments();
    const router = useRouter();

    const [fontsLoaded] = useFonts({
        DMBold: require('../assets/fonts/DMSans-Bold.ttf'),
        DMMedium: require('../assets/fonts/DMSans-Medium.ttf'),
        DMRegular: require('../assets/fonts/DMSans-Regular.ttf')
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded && !isLoading) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, isLoading]);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';

        if (!user && !inAuthGroup) {
            // Redirect to the login page.
            router.replace('/login');
        } else if (user && inAuthGroup) {
            // Redirect away from the login page.
            router.replace('/');
        }
    }, [user, isLoading, segments]);

    if (!fontsLoaded || isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
        
    return (
        <Stack onLayout={onLayoutRootView}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}

const Layout = () => {
    return (
        <AuthProvider>
            <InitialLayout />
        </AuthProvider>
    );
}

export default Layout;