import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
        headerShown: false,
        headerStyle: {
          backgroundColor: 'black',
        },
        tabBarStyle: {
          backgroundColor: 'red', // Add your desired tab bar color
        },
      }}
    >
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'list' : 'list-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tags"
        options={{
          title: 'Tags',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'pricetag' : 'pricetag-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'barbell' : 'barbell-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="database"
        options={{
          title: 'DB',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'server' : 'server-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'cog' : 'cog-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
