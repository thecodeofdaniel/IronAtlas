import { View, Text, TextInput, Pressable } from 'react-native';
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

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

        {/* Submit Button */}
        <MyButtonOpacity
          onPress={() => {
            console.log({ rating, feedback });
          }}
        >
          <Text className="text-primary-contrast text-center text-lg font-medium text-white">
            Submit Feedback
          </Text>
        </MyButtonOpacity>
      </View>
    </>
  );
}
