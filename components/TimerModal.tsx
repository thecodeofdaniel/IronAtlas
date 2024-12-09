import { View, Text } from 'react-native';
import React from 'react';
import Modal from 'react-native-modal';
import MyBorder from './ui/MyBorder';
import { useTimerStore } from '@/store/zustand/timer/timerStore';
import MySimpleButton from './ui/MySimpleButton';
import CountdownTimer from './CountDownTimer';

type Props = {
  isModalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TimerModal({ isModalVisible, setModalVisible }: Props) {
  const seconds = useTimerStore((state) => state.seconds);
  const { startTimer, stopTimer, incrementTimer, decrementTimer } =
    useTimerStore((state) => state.actions);

  return (
    <Modal
      isVisible={isModalVisible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={200}
      animationOutTiming={200}
      backdropTransitionInTiming={200}
      backdropTransitionOutTiming={0}
      useNativeDriver={true}
      style={{
        margin: 0,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 50,
      }}
      onBackdropPress={() => setModalVisible(false)}
      hideModalContentWhileAnimating={true}
    >
      <MyBorder className="mx-4 w-[90%] bg-neutral p-4">
        {seconds === 0 && (
          <View className="gap-1">
            <MySimpleButton title="1:00" onPress={() => startTimer(60)} />
            <MySimpleButton title="2:00" onPress={() => startTimer(120)} />
            <MySimpleButton title="3:00" onPress={() => startTimer(180)} />
          </View>
        )}
        {seconds > 0 && (
          <View className="gap-4">
            <View className="flex flex-row items-center justify-center gap-2">
              <MySimpleButton
                title="-10"
                onPress={() => decrementTimer(10)}
                className="flex-1"
              />
              <CountdownTimer className="px-4 text-xl text-neutral-contrast" />
              <MySimpleButton
                title="+10"
                onPress={() => incrementTimer(10)}
                className="flex-1 bg-green-500"
              />
            </View>
            <MySimpleButton
              title="Stop Timer"
              onPress={() => {
                setModalVisible(false);
                setTimeout(() => {
                  stopTimer();
                }, 200);
              }}
            />
          </View>
        )}
      </MyBorder>
    </Modal>
  );
}
