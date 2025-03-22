import { Image, StyleSheet, Platform, Button, Alert } from 'react-native';
import { useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { setupSocketListeners, getSocketId } from '@/services/socketService';

export default function HomeScreen() {
  useEffect(() => {
    const cleanup = setupSocketListeners((socketId: string) => {
      console.log('Connected to socket server with ID:', socketId);
    });

    return cleanup;
  }, []);

  async function postParkingSpot(latitude: number, longitude: number) {
    try {
        console.log('Starting request...');
        // Use the correct URL based on platform
        const url = Platform.OS === 'android'
            ? 'http://10.0.2.2:30001/post-parking-spot'    // For Android emulator
            : Platform.OS === 'ios'
                ? 'http://10.136.12.40:30002/post-parking-spot' // For iOS simulator
                : 'http://localhost:30001/post-parking-spot'; // For web

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
                reporterId: getSocketId() // Add the socket ID to identify the reporter
            })
        });
        
        const data = await response.json();
        console.log('Received data:', data);
        return data;
    } catch (error) {
        console.log('Full error details:', error);
        throw error;
    }
}

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12'
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
      <Button  
      title="Press me"
      onPress={() => postParkingSpot(37.7749, -122.4194)}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
