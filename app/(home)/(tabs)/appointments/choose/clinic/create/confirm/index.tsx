import React, { useEffect, useRef } from 'react';
import { View, BackHandler, Text, ScrollView, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { Image } from 'expo-image';
import LottieView from 'lottie-react-native';
import { Button, Card } from 'react-native-paper';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
function Index() {
    useEffect(() => {
        const backAction = () => {
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        Speech.speak('appointment सफलतापूर्वक बनाई गई', { language: "hi" });
    }, []);

    const animation = useRef<LottieView>(null);
    return (
        <ScrollView contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: "space-evenly", paddingVertical: 12, paddingHorizontal: 16 }}>
            <LottieView
                autoPlay
                ref={animation}
                style={{
                    width: 100, height: 100,
                    backgroundColor: '#eee',
                }}
                loop
                source={require('../../../../../../../../assets/images/animations/confirmation.json')}
            />

            <View>
                <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 19, textAlign: 'center' }}>Jon, we've got you </Text>
                <Text style={{ fontFamily: "Nunito_400Regular", fontSize: 19, textAlign: 'center' }}>confirmed for your appointment </Text>
            </View>

            <View>
                <Text style={{ fontFamily: "Nunito_600SemiBold", fontSize: 24, textAlign: 'center', color: '#1A1A1D' }}>3:20 PM | Dr.Smith</Text>
                <View style={{}}>
                    <Text style={{ textAlign: "center", marginVertical: 6, fontSize: 18, fontFamily: "Nunito_600SemiBold" }}>Friday, January 6, 2017</Text>
                    <Text style={{ textAlign: "center", fontSize: 16, fontFamily: "Nunito_500Medium", marginVertical: 15 }}>ATX SOUTH BRANCH | AUSTIN, TX</Text>
                </View>
            </View>

            <Button mode='contained' contentStyle={{ paddingVertical: 6 }} style={{ borderRadius: 25, width: "75%" }} labelStyle={{ fontFamily: "Nunito_600SemiBold" }} icon={'home'} onPress={() => {
                router.dismissAll();
                router.push('/(home)/(tabs)/home')
            }}>Go to Home</Button>
        </ScrollView >
    );
}

export default Index;
