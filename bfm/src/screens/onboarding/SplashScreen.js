import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { colors, fontSize, spacing } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

// Custom BuzzBreach Logo Component
const BuzzBreachLogo = ({ size = 60, color = colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Main B shape with network nodes */}
    <G>
      {/* Left vertical line of B */}
      <Path
        d="M25 20 L25 80"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Top curve of B */}
      <Path
        d="M25 20 Q55 20 55 35 Q55 50 25 50"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bottom curve of B */}
      <Path
        d="M25 50 Q60 50 60 65 Q60 80 25 80"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Network connection nodes */}
      <Circle cx="70" cy="25" r="8" fill={color} />
      <Circle cx="78" cy="50" r="6" fill={color} opacity="0.7" />
      <Circle cx="72" cy="75" r="8" fill={color} />
      {/* Connection lines */}
      <Path
        d="M55 35 L70 25"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="4,3"
        opacity="0.6"
      />
      <Path
        d="M60 65 L72 75"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="4,3"
        opacity="0.6"
      />
      <Path
        d="M70 25 L78 50"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="4,3"
        opacity="0.5"
      />
      <Path
        d="M78 50 L72 75"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="4,3"
        opacity="0.5"
      />
    </G>
  </Svg>
);

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Auto navigate to Welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image - Modern office/workspace */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200' }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
      >
        {/* Dark Overlay Gradient */}
        <LinearGradient
          colors={['rgba(13, 11, 30, 0.45)', 'rgba(13, 11, 30, 0.92)']}
          locations={[0, 1]}
          style={styles.overlay}
        >
          {/* Logo and Brand */}
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              {/* Custom Logo Icon */}
              <View style={styles.logoIconWrapper}>
                <BuzzBreachLogo size={70} color={colors.primary} />
              </View>
              
              {/* Brand Name */}
              <View style={styles.brandContainer}>
                <Text style={styles.brandName}>BUZZBREACH</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // Slight shift down so the photo focal area sits closer to the top like the mock.
  backgroundImageStyle: {
    transform: [{ scale: 1.12 }, { translateY: 18 }],
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIconWrapper: {
    marginBottom: spacing.md,
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 1,
    fontStyle: 'italic',
  },
});

export default SplashScreen;
