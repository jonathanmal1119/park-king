// App.js
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';
import { LocationObject } from 'expo-location';
import { setupSocketListeners } from '@/services/socketService';

type MarkerType = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  id: string;
};

export default function MapScreen() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [markers, setMarkers] = useState<MarkerType[]>([]);

  useEffect(() => {
    (async () => {
      // Request both foreground and background permissions
      let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Start watching position
      let locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );

      // Cleanup subscription on unmount
      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    })();
  }, []);

  useEffect(() => {
    const cleanup = setupSocketListeners(
      (socketId: string) => {
        console.log('Connected to socket server with ID:', socketId);
      },
      addPin
    );

    return cleanup;
  }, []);

  const addPin = (latitude: number, longitude: number) => {
    setMarkers(prevMarkers => [
      ...prevMarkers,
      {
        coordinate: { latitude, longitude },
        id: Date.now().toString()
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        followsUserLocation={true}
        initialRegion={{
          latitude: location?.coords.latitude ?? 40.7128,
          longitude: location?.coords.longitude ?? -74.0060,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
