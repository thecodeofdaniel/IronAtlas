import * as React from 'react';
import { Dimensions, Text, View, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import SetsTable from '@/components/SetsTable/SetsTable';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  uuids: string[];
};

export default function CarouselComp({ uuids }: Props) {
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;
  const carouselRef = React.useRef(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToNext = () => {
    if (currentIndex < uuids.length - 1) {
      carouselRef.current?.next();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      carouselRef.current?.prev();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
    >
      <Carousel
        ref={carouselRef}
        loop={false}
        width={width}
        pagingEnabled={true}
        mode="parallax"
        // height={height * 0.8}
        data={uuids}
        scrollAnimationDuration={1000}
        onSnapToItem={setCurrentIndex}
        // panGestureHandlerProps={{
        //   activeOffsetX: [-999999, 999999],
        // }}
        style={{ borderWidth: 2, borderColor: 'orange' }}
        renderItem={({ item: uuid }) => (
          <View
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              // paddingHorizontal: 8,
            }}
          >
            <SetsTable title="Idk" uuid={uuid} />
          </View>
        )}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={goToPrev}
          disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        <Text>{`${currentIndex + 1} / ${uuids.length}`}</Text>

        <TouchableOpacity
          onPress={goToNext}
          disabled={currentIndex === uuids.length - 1}
          style={{ opacity: currentIndex === uuids.length - 1 ? 0.5 : 1 }}
        >
          <Ionicons name="chevron-forward" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
