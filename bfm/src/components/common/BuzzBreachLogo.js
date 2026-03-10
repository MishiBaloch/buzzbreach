import React from 'react';
import { Image, StyleSheet } from 'react-native';

// BuzzBreach Logo Component using image asset
const BuzzBreachLogo = ({ size = 24 }) => {
  return (
    <Image
      source={require('../../../assets/buzzbreach-logo.png')}
      style={[styles.logo, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    // Ensure the logo maintains aspect ratio
  },
});

export default BuzzBreachLogo;
