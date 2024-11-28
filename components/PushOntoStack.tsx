import React from 'react';
import { Pressable } from 'react-native';
import { Href, useRouter } from 'expo-router';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
  href: Href<''>;
  className?: string;
};

export default function PushOntoStack({ children, href, className }: Props) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(href)} className={clsx(className)}>
      {children}
    </Pressable>
  );
}
