import { Image } from 'expo-image'
import LottieView from 'lottie-react-native';
import React, { memo } from 'react'
import { Dimensions, Text, View } from 'react-native'
import { withTheme } from 'react-native-paper';

const { width, height } = Dimensions.get('window');
function NoDataFound({ message = "No data found" }: { message?: string }) {
    return (
        <View
            style={{
                alignSelf: "center",
                justifyContent: "center",
            }}
        >
            <LottieView
                autoPlay
                loop
                style={{
                    width: width - 25,
                    height: width - 35,
                }}
                source={require('../assets/lottie/404.json')}
            />
            <Text style={{ fontFamily: 'Nunito_700Bold', textAlign: 'center' }}>{message}</Text>
        </View>
    )
}

export default NoDataFound