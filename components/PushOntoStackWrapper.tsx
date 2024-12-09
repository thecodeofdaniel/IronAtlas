import React from 'react';
import { Href, useRouter } from 'expo-router';

type Props = {
  children: React.ReactElement;
  href: Href | Href<object>;
  func?: () => void;
};

export default function PushOntoStackWrapper({ children, href, func }: Props) {
  const router = useRouter();

  return React.cloneElement(children, {
    onPress: () => {
      if (func) func();
      router.push(href);
    },
  });
}
