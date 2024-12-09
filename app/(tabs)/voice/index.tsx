import { View, Text, Button, ScrollView } from 'react-native';
import React, { useState } from 'react';
import ScreenLayoutWrapper from '@/components/ui/ScreenLayoutWrapper';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { wordsToNumbers } from 'words-to-numbers';
import MySimpleButton from '@/components/ui/MySimpleButton';
import TextContrast from '@/components/ui/TextContrast';

export default function VoiceTab() {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');

  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('result', (event) => {
    const spokenText = event.results[0]?.transcript || '';
    const parsed = extractWeightAndReps(spokenText);
    if (parsed) {
      console.log(
        `Weight: ${parsed.weight}, Reps: ${parsed.reps}, Type: ${parsed.type}`,
      );
      setTranscript(
        `${spokenText}: ${parsed.weight} lbs × ${parsed.reps} reps (${parsed.type})`,
      );
    } else {
      setTranscript(spokenText);
    }
  });
  useSpeechRecognitionEvent('error', (event) => {
    console.log('error code:', event.error, 'error message:', event.message);
  });

  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn('Permissions not granted', result);
      return;
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
      requiresOnDeviceRecognition: false,
      addsPunctuation: false,
      contextualStrings: ['Carlsen', 'Nepomniachtchi', 'Praggnanandhaa'],
    });
  };

  const extractWeightAndReps = (text: string) => {
    // First convert any word numbers to digits
    const normalizedText = String(wordsToNumbers(text) || text)
      .toLowerCase()
      // Replace "for" with "4" if it appears between numbers
      .replace(/(\d+)\s+for\s+(\d+)/i, '$1 4 $2');

    // Match either:
    // - First number (weight) followed by optional "for/4/x" and second number (reps)
    // - Or just two numbers in sequence
    const matches = normalizedText.match(/(\d+)(?:\s+(?:for|4|x))?\s+(\d+)/i);

    if (matches) {
      return {
        weight: parseInt(matches[1]),
        reps: parseInt(matches[2]),
        type:
          normalizedText.includes('dropset') ||
          normalizedText.includes('drop set')
            ? 'D'
            : 'N',
      };
    }

    return null;
  };

  return (
    <ScreenLayoutWrapper>
      {!recognizing ? (
        <MySimpleButton
          title="Start"
          onPress={handleStart}
          className="bg-green-500"
        />
      ) : (
        <MySimpleButton
          title="Stop"
          onPress={() => ExpoSpeechRecognitionModule.stop()}
          className="bg-red-500"
        />
      )}

      <ScrollView>
        <TextContrast>{transcript}</TextContrast>
      </ScrollView>
    </ScreenLayoutWrapper>
  );
}
