import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { wordsToNumbers } from 'words-to-numbers';
import TextContrast from '@/components/ui/TextContrast';
import MyButtonOpacity from '@/components/ui/MyButtonOpacity';
import { Ionicons } from '@expo/vector-icons';
import { useTemplateStore } from '@/store/zustand/template/templateStore';

type Props = {
  uuid: string;
};

export default function VoiceButton({ uuid }: Props) {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parseError, setParseError] = useState(false);
  const [latestResult, setLatestResult] = useState('');
  const addSetByVoice = useTemplateStore((state) => state.addSetByVoice);

  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => {
    setRecognizing(false);
    if (latestResult) {
      const parsed = extractWeightAndReps(latestResult);
      if (parsed) {
        const { type, weight, reps } = parsed;
        setParseError(false);
        setTranscript(
          `"${latestResult}": ${weight}lbs x ${reps} reps (${type})`,
        );
        addSetByVoice(uuid, type, weight, reps);
      } else {
        setParseError(true);
        setTranscript(latestResult);
      }
    }
    setLatestResult(''); // Reset for next time
  });

  useEffect(() => {
    if (!recognizing && latestResult) {
      const parsed = extractWeightAndReps(latestResult);
      if (parsed) {
        const { type, weight, reps } = parsed;
        setParseError(false);
        setTranscript(
          `"${latestResult}": ${weight}lbs x ${reps} reps (${type})`,
        );
        addSetByVoice(uuid, type, weight, reps);
      } else {
        setParseError(true);
        setTranscript(latestResult);
      }
      setLatestResult(''); // Reset for next time
    }
  }, [recognizing, latestResult]);

  useSpeechRecognitionEvent('result', (event) => {
    const spokenText = event.results[0]?.transcript || '';
    setLatestResult(spokenText); // Just keep updating the latest result
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
        weight: matches[1],
        reps: matches[2],
        type:
          normalizedText.includes('dropset') ||
          normalizedText.includes('drop set')
            ? 'D'
            : 'N',
      };
    }

    return null;
  };

  if (!recognizing) {
    return (
      <>
        <MyButtonOpacity
          onPress={handleStart}
          className="items-center bg-neutral-accent"
        >
          <Ionicons name="mic-outline" size={24} color="white" />
        </MyButtonOpacity>

        {parseError && transcript && (
          <View className="items-center justify-center border">
            <TextContrast>You said: "{transcript}"</TextContrast>
            <TextContrast>Use format "255 for 6 reps"</TextContrast>
          </View>
        )}
        {transcript && (
          <TextContrast className="text-center">
            You said: {transcript}
          </TextContrast>
        )}
      </>
    );
  } else {
    return (
      <MyButtonOpacity
        onPress={() => ExpoSpeechRecognitionModule.stop()}
        className="items-center bg-neutral-accent"
      >
        <Ionicons name="mic" size={24} color="white" />
      </MyButtonOpacity>
    );
  }
}
