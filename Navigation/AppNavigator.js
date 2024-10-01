// src/navigation/AppNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import Page1Screen from '../screens/Page1Screen';
import Page2Screen from '../screens/Page2Screen';
import DailyDiscussion from './DailyDiscussion';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: 'blue',
        inactiveTintColor: 'gray',
        labelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
        style: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#ccc',
          height: 60,
          justifyContent: 'center',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Page1"
        component={Page1Screen}
        options={{
          tabBarLabel: 'Page 1',
        }}
      />
      <Tab.Screen
        name="Infinite Campus"
        component={Page2Screen}
        options={{
          tabBarLabel: 'Infinite Campus',
        }}
      />
      <Tab.Screen
        name="DailyDiscussion"
        component={DailyDiscussion}
        options={{
          tabBarLabel: 'Daily Discussion',
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
