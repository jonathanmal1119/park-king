import { Alert } from 'react-native';
import io from 'socket.io-client';

const socket = io('http://10.136.12.40:30002', {
    transports: ['websocket'],
    autoConnect: true
});

let currentSocketId = null;

export const setupSocketListeners = (onConnect) => {
    socket.on('connect', () => {
        console.log('Connected with ID:', socket.id);
        if (onConnect) onConnect(socket.id);
    });

    socket.on('newParkingSpot', (data) => {
        Alert.alert(
            'New Parking Spot!',
            `Parking spot available at: ${data.latitude}, ${data.longitude}`,
            [{ text: 'OK' }]
        );
    });

    return () => {
        socket.off('connect');
        socket.off('newParkingSpot');
        socket.off('newParkingSpot');
        currentSocketId = null;
    };
};

export async function postParkingSpot(latitude, longitude) {
    try {
        console.log('Starting request...');
        const url = Platform.OS === 'android'
            ? 'http://10.0.2.2:30002/post-parking-spot'          
            : 'http://10.136.12.40:30002/post-parking-spot';
                
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude,
                longitude,
                reporterId: socket.id
            })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Full error details:', error);
        throw error;
    }
}

export function updateLocation(latitude, longitude) {
    socket.emit('updateLocation', { latitude, longitude });
} 

export const getSocketId = () => socket.id;