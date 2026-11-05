import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useAbhaStore } from '../stores/abhaStore';

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

import { ABHA } from '../../../../../utils/api';

export default function CreateAddressScreen() {
  const router = useRouter();

  // Receive the API response passed from the OTP screen.
  const {abha_address,transactionId } = useLocalSearchParams<{
    abha_address?: string;
    transactionId?: string;
  }>();

  const token = useAbhaStore((state) => state.token);

  // Read the transaction ID from Zustand at request time.
  // The API call will not use the route parameter as a substitute.
  const getTransactionId = () => {
    return useAbhaStore.getState().txnId?.trim() || '';
  };

  console.log('Frontend token exists:', Boolean(token));
  console.log('Zustand transaction ID exists:', Boolean(useAbhaStore.getState().txnId));

  const [selectedAddress, setSelectedAddress] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<
    'idle' | 'checking' | 'available' | 'unavailable'
  >('idle');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  console.log('Received suggestion data:', abha_address); 
  console.log('Received transaction ID:', transactionId);

  useEffect(() => {
    setErrorMessage('');

    if (!abha_address) {
      setSuggestions([]);
      setSelectedAddress('');
      return;
    }

    try {
      const addressParam = Array.isArray(abha_address)
        ? abha_address[0]
        : abha_address;

      const parsedData = JSON.parse(addressParam);
      console.log('Received suggestion API data:', parsedData);
      console.log('Received transaction ID:', transactionId);

      const rawSuggestions = Array.isArray(parsedData)
        ? parsedData
        : parsedData?.suggestions ??
          parsedData?.data?.suggestions ??
          parsedData?.Response?.suggestions ??
          parsedData?.Response?.abhaAddressList ??
          parsedData?.abhaAddressList ??
          [];

      if (!Array.isArray(rawSuggestions)) {
        setSuggestions([]);
        setSelectedAddress('');
        setErrorMessage('No valid address suggestions were received.');
        return;
      }

      const addresses = rawSuggestions
        .map((item: unknown) => {
          if (typeof item === 'string') {
            return item.trim();
          }

          if (item && typeof item === 'object') {
            const addressItem = item as {
              abhaAddress?: unknown;
              address?: unknown;
              suggestion?: unknown;
            };

            const value =
              addressItem.abhaAddress ??
              addressItem.address ??
              addressItem.suggestion;

            return typeof value === 'string' ? value.trim() : '';
          }

          return '';
        })
        .filter((address: string) => address.length > 0);

      const firstThreeAddresses = addresses.slice(0, 3);
      setSuggestions(firstThreeAddresses);
      setSelectedAddress(firstThreeAddresses[0] ?? '');

      if (firstThreeAddresses.length === 0) {
        setErrorMessage('No address suggestions are available. You can enter your own address.');
      }
    } catch (error) {
      console.error('Unable to parse ABHA suggestions:', error);
      setSuggestions([]);
      setSelectedAddress('');
      setErrorMessage('Unable to read address suggestions from the server.');
    }
  }, [abha_address, transactionId]);

const handleCheckAvailability = async () => {
  const addressToCheck = customAddress.trim().replace(/@abdm$/i, '');
  const txnId = getTransactionId();

  setErrorMessage('');

  if (!addressToCheck) {
    setAvailabilityStatus('idle');
    setErrorMessage('Please enter a new ABHA address first.');
    return;
  }

  if (!txnId) {
    setAvailabilityStatus('idle');
    setErrorMessage('Transaction ID is missing. Please try again.');
    return;
  }

  setCheckingAvailability(true);
  setAvailabilityStatus('checking');

  try {
    // The user-entered ABHA address is sent in the request BODY.
    // The transaction ID retrieved from Zustand is sent in the HEADER.
    const requestBody = {
      abhaAddress: addressToCheck,
    };

    console.log('ABHA address request URL: enrollment/enrol/abha-address');
    console.log('ABHA address request body:', requestBody);
    console.log('Transaction ID available for header:', Boolean(txnId));

    const response = await ABHA.post(
      'enrollment/enrol/abha-address',
      requestBody,
      {
        headers: {
          txnId: txnId,
        },
      }
    );

    console.log('========== ABHA ADDRESS API RESPONSE ==========');
    console.log('HTTP status:', response?.status);
    console.log('Response data:', JSON.stringify(response?.data ?? response, null, 2));
    console.log('===============================================');

    if (response?.status === 200 || response?.status === 202) {
      setAvailabilityStatus('available');
      setErrorMessage('');
    } else {
      setAvailabilityStatus('unavailable');
      setErrorMessage(
        response?.data?.message ??
          response?.data?.Message ??
          'This ABHA address is not available. Please try another.'
      );
    }
  } catch (error: any) {
    console.error('ABHA availability request failed:', error?.response?.data ?? error?.message);
    setAvailabilityStatus('unavailable');
    setErrorMessage(
      error?.response?.data?.message ??
        error?.response?.data?.Message ??
        error?.message ??
        'Unable to check this ABHA address. Please try again.'
    );
  } finally {
    setCheckingAvailability(false);
  }
};

const handleContinue = async () => {
  const txnId = getTransactionId();

  const selected = selectedAddress.trim();
  const custom = customAddress.trim();

  // Determine which address the user wants.
  const rawAddress = custom || selected;

  if (!rawAddress) {
    setErrorMessage(
      'Please select a suggested address or enter your own.'
    );
    return;
  }

  if (!txnId) {
    setErrorMessage(
      'Transaction ID is missing. Please try again.'
    );
    return;
  }

  // A custom address must be checked before assignment.
  if (custom && availabilityStatus !== 'available') {
    setErrorMessage(
      'Please check the availability of your custom address first.'
    );
    return;
  }

  setErrorMessage('');

  const address = `${rawAddress.replace(/@abdm$/i, '')}@abdm`;

  try {
    setCheckingAvailability(true);

    // Step 1: Assign the selected or verified custom address.
    // Address goes in the BODY; Zustand transaction ID goes in the HEADER.
    const assignmentRequestBody = {
      abhaAddress: address.replace(/@abdm$/i, ''),
    };

    const assignmentResponse = await ABHA.post(
      'enrollment/enrol/abha-address',
      assignmentRequestBody,
      {
        headers: {
          txnId: txnId,
        },
      }
    );

    console.log('========== ABHA ADDRESS ASSIGNMENT RESPONSE ==========');
    console.log('HTTP status:', assignmentResponse?.status);
    console.log(
      'Response data:',
      JSON.stringify(assignmentResponse?.data ?? assignmentResponse, null, 2)
    );
    console.log('======================================================');

    // Step 2: Fetch the profile after successful assignment.
    const profileResponse = await ABHA.get(
      'enroll/profile/account',
      {
        headers: {
          token: token?.trim(),
        },
      }
    );

    const profile = profileResponse.data?.Response;
    console.log(profile)

    const ABHANumber =
      profile?.ABHANumber ??
      profile?.ABHAProfile?.ABHANumber;

    const assignedAddress =
      profile?.preferredAbhaAddress ?? address;

    if (!ABHANumber) {
      console.error(
        'ABHA number was not found in the profile response:',
        profileResponse.data
      );
    }

    // Step 3: Navigate to the success screen.
    router.push({
      pathname: '/abha/create/success',
      params: {
        ABHANumber: String(ABHANumber ?? ''),
        abha_address: String(assignedAddress),
      },
    });
  } catch (error: any) {
    console.error(
      'ABHA address assignment failed:',
      error?.response?.data ?? error?.message
    );

    setErrorMessage(
      error?.response?.data?.message ??
        error?.response?.data?.Message ??
        'Unable to assign the ABHA address. Please try again.'
    );
  } finally {
    setCheckingAvailability(false);
  }
};


  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        Create your ABHA Address
      </Text>

      <Text style={styles.subtitle}>
        Your unique identifier to access and securely share
        your digital health records.
      </Text>

      <Text style={styles.sectionTitle}>
        Suggested for you
      </Text>

      <View style={styles.suggestionsContainer}>
        {suggestions.length > 0 ? (
          suggestions.map((address) => {
            const isSelected =
              selectedAddress === address &&
              !customAddress.trim();

            return (
              <TouchableOpacity
                key={address}
                style={[
                  styles.suggestionCard,
                  isSelected &&
                    styles.suggestionCardSelected,
                ]}
                onPress={() => {
                  setSelectedAddress(address);
                  setCustomAddress('');
                  setErrorMessage('');
                }}
                activeOpacity={0.8}
              >
                <View style={styles.radioContainer}>
                  {isSelected ? (
                    <View
                      style={styles.radioSelectedOuter}
                    >
                      <View
                        style={styles.radioSelectedInner}
                      />
                    </View>
                  ) : (
                    <View
                      style={styles.radioUnselected}
                    />
                  )}
                </View>

                <Text style={styles.suggestionText}>
                  {address.replace(/@abdm$/i, '')}@abdm
                </Text>

                <View style={styles.availableBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#10B981"
                  />
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.emptyText}>
            No address suggestions are available.
          </Text>
        )}
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />

        <Text style={styles.dividerText}>
          Or create your own
        </Text>

        <View style={styles.dividerLine} />
      </View>

      <View style={styles.customInputContainer}>
        <TextInput
          style={styles.customInput}
          placeholder="Enter ABHA Address"
          placeholderTextColor="#9CA3AF"
          value={customAddress}
          onChangeText={(text) => {
            // Keep only the username portion.
            const cleanedText = text
              .replace(/@abdm$/i, '')
              .trimStart();

            setCustomAddress(cleanedText);
            setErrorMessage('');
            setAvailabilityStatus('idle');
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.suffixText}>
          @abdm
        </Text>
      </View>

      {errorMessage !== '' && (
        <Text style={styles.errorText}>
          {errorMessage}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.secondaryButton,
          availabilityStatus === 'available' && styles.availableButton,
          availabilityStatus === 'unavailable' && styles.unavailableButton,
        ]}
        onPress={handleCheckAvailability}
        disabled={checkingAvailability}
        activeOpacity={0.8}
      >
        {checkingAvailability ? (
          <ActivityIndicator color="#0A5898" />
        ) : (
          <Text
            style={[
              styles.secondaryButtonText,
              availabilityStatus === 'available' && styles.availableButtonText,
              availabilityStatus === 'unavailable' && styles.unavailableButtonText,
            ]}
          >
            {availabilityStatus === 'available'
              ? 'Available'
              : availabilityStatus === 'unavailable'
                ? 'Not available'
                : 'Check availability'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          Continue
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },

  suggestionsContainer: {
    gap: 12,
    marginBottom: 24,
  },

  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },

  suggestionCardSelected: {
    borderColor: '#0A5898',
    backgroundColor: '#F0F6FA',
  },

  radioContainer: {
    marginRight: 12,
  },

  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },

  radioSelectedOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#0A5898',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioSelectedInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0A5898',
  },

  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },

  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  availableText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },

  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    paddingVertical: 12,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#6B7280',
  },

  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 16,
  },

  customInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 14,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },

  suffixText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 16,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#0A5898',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },

  secondaryButtonText: {
    color: '#0A5898',
    fontSize: 16,
    fontWeight: '600',
  },

  availableButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },

  availableButtonText: {
    color: '#FFFFFF',
  },

  unavailableButton: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },

  unavailableButtonText: {
    color: '#FFFFFF',
  },

  primaryButton: {
    backgroundColor: '#0A5898',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

