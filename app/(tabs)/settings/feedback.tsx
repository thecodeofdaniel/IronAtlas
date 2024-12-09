import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';

export default function Feedback() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState({
    rating: '',
    feedback: '',
  });

  const handleSubmit = () => {
    let hasError = false;

    if (rating === 0) {
      setError((prevError) => ({
        ...prevError,
        rating: 'Please select a rating',
      }));
      hasError = true;
    } else {
      setError((prevError) => ({ ...prevError, rating: '' }));
    }

    if (feedback.length < 10) {
      setError((prevError) => ({
        ...prevError,
        feedback: 'Feedback must be at least 10 characters',
      }));
      hasError = true;
    }

    if (hasError) return;

    Alert.alert('Feedback submitted', 'Thank you for your feedback!');
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Feedback' }} />
      <View className="flex-1 gap-2 bg-neutral p-4">
        {/* Star Rating */}
        <View className="gap-1">
          <Text className="text-xl font-medium text-neutral-contrast">
            How would you rate your experience?
          </Text>
          <View className="flex flex-row gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)}>
                <FontAwesome
                  name={star <= rating ? 'star' : 'star-o'}
                  size={32}
                  color={star <= rating ? '#FFD700' : '#666'}
                />
              </Pressable>
            ))}
          </View>
          {error.rating && <Text className="text-red-500">{error.rating}</Text>}
        </View>

        {/* Feedback Text Input */}
        <View className="gap-1">
          <Text className="text-lg font-medium text-neutral-contrast">
            Additional Comments:
          </Text>
          <TextInput
            textAlignVertical="top"
            className="border border-neutral-accent p-2 text-neutral-contrast"
            multiline
            numberOfLines={4}
            value={feedback}
            onChangeText={setFeedback}
          />
        </View>
        {error.feedback && (
          <Text className="text-red-500">{error.feedback}</Text>
        )}
        {/* Submit Button */}
        <MyButtonOpacity onPress={handleSubmit}>
          <Text className="text-primary-contrast text-center text-lg font-medium text-white">
            Submit Feedback
          </Text>
        </MyButtonOpacity>
      </View>
    </>
  );
}
