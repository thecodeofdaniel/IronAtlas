import React from 'react';
import { Href, useRouter } from 'expo-router';

type Props = {
  children: React.ReactElement;
  href: Href | Href<object>;
};

export default function PushOntoStackWrapper({ children, href }: Props) {
  const router = useRouter();

  return React.cloneElement(children, {
    onPress: () => {
      router.push(href);
    },
  });
}
