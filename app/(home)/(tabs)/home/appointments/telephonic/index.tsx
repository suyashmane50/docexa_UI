import { fetchCallsForBoth } from '@/store/features/appointments/oncall/CallsSlice';
import { AppDispatch, RootState } from '@/store';
import { router } from 'expo-router';
import React, { memo, useEffect, useCallback } from 'react';
import { Linking, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Appbar, Button, Card, IconButton, withTheme } from 'react-native-paper';
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import * as Clipboard from 'expo-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import Loading from '@/components/Loading';
import NoDataFound from '@/components/NoDataFound';
import { yyyyymmddToInterpable, scale, verticalScale, responsiveFontSize } from '@/utils/common';

function index({ theme }: any) {
    const dispatch: AppDispatch = useDispatch();
    const { callsData, isLoading, isError, isSuccess, isNotFound, message } = useSelector((state: RootState) => state.FetchCallsForBoth);

    useEffect(() => {
        dispatch(fetchCallsForBoth());
    }, []);

    useEffect(() => {
        if (isError) {
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: "Error",
                textBody: message ? message : "Try again later",
            });
        }
    }, [isError, isSuccess, message]);

    const RenderAppointment = useCallback(({ item }: any) => {
        const isAccepted = item?.status === 1;

        return (
            <Card mode="contained" style={{ marginBottom: verticalScale(12), marginHorizontal: scale(16) }}>
                <Card.Content>
                    <View>
                        <Text
                            style={{
                                marginVertical: verticalScale(6),
                                fontFamily: "Nunito_700Bold",
                                fontSize: responsiveFontSize(16.5),
                            }}
                        >
                            {item?.doctor?.name
                                ? `${item?.doctor?.name} (${item?.doctor?.speciality || 'General'})`
                                : "Unknown Doctor"}
                        </Text>

                        <View className='flex-row items-center' style={{ marginTop: verticalScale(4) }}>
                            <Text
                                style={{
                                    fontSize: responsiveFontSize(14.5),
                                    color: "#555",
                                    fontFamily: "Nunito_600SemiBold",
                                    flex: 1,
                                }}
                                numberOfLines={1}
                            >
                                {item?.doctor?.phone}
                            </Text>
                            <IconButton icon={'content-copy'} size={scale(18)} onPress={async () => {
                                const phone = item?.doctor?.phone;
                                if (phone) {
                                    await Clipboard.setStringAsync(phone);
                                    Toast.show({
                                        type: ALERT_TYPE.SUCCESS,
                                        title: "Copied",
                                        textBody: "Phone number copied to clipboard",
                                    });
                                } else {
                                    Toast.show({
                                        type: ALERT_TYPE.WARNING,
                                        title: "Warning",
                                        textBody: "Phone number not available",
                                    });
                                }
                            }} />
                        </View>

                        <Text
                            style={{
                                fontSize: responsiveFontSize(14),
                                color: "#555",
                                marginBottom: verticalScale(6),
                                fontFamily: "Nunito_600SemiBold",
                            }}
                        >
                            {yyyyymmddToInterpable(item.request_date_time)}
                        </Text>



                        <Text
                            style={{
                                fontSize: responsiveFontSize(14.5),
                                color: isAccepted ? "green" : "red",
                                fontFamily: "Nunito_600SemiBold",
                            }}
                        >
                            {isAccepted ? "Call request accepted" : "Call request not accepted"}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: verticalScale(12) }}>
                        <Button
                            disabled={!isAccepted}
                            mode='contained'
                            icon="phone"
                            labelStyle={{ fontFamily: 'Nunito_700Bold', fontSize: responsiveFontSize(12) }}
                            style={{ borderRadius: scale(10), minWidth: scale(120) }}
                            contentStyle={{ paddingVertical: verticalScale(4) }}
                            onPress={() => {
                                const phoneNumber = item?.doctor?.phone;
                                if (phoneNumber) {
                                    const url = `tel:${phoneNumber}`;
                                    Linking.openURL(url);
                                } else {
                                    Toast.show({
                                        type: ALERT_TYPE.WARNING,
                                        title: "Warning",
                                        textBody: "Phone number not available",
                                    });
                                }
                            }}
                        >
                            Call
                        </Button>
                    </View>
                </Card.Content>
            </Card>
        );
    }, []);


    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.BackAction color={theme.colors.primary}
                    onPress={() => { router.back() }}
                />
                <Appbar.Content color={theme.colors.primary}
                    titleStyle={{ fontFamily: 'Nunito_700Bold' }}
                    title="Telephonic Appointments"
                />
            </Appbar.Header>
            {isLoading ? (
                <Loading />
            ) : (
                    <FlatList
                    style={{ padding: scale(16) }}
                        keyExtractor={(item, index) => index.toString()}
                    data={isSuccess ? callsData : []}
                        renderItem={RenderAppointment}
                    ListEmptyComponent={
                        isNotFound ? (
                            <View className='flex-1' style={{ padding: scale(16) }}>
                        <NoDataFound />
                    </View>
                        ) : null
                }
                />
            )}
        </View>
    );
}

export default memo(withTheme(index));





