import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast } from 'react-native-toast-message';
import ErrorToast from './ErrorToast';

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={[styles.toast, styles.successToast]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  error: (props) => <ErrorToast {...props} />,
  info: (props) => (
    <BaseToast
      {...props}
      style={[styles.toast, styles.infoToast]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
};

const styles = StyleSheet.create({
  toast: {
    borderLeftWidth: 0,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  successToast: {
    backgroundColor: '#4CAF50',
  },
  infoToast: {
    backgroundColor: '#2196F3',
  },
  text1: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text2: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
  },
}); 