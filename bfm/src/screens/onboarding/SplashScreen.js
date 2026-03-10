import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, spacing } from '../../theme/colors';
import BuzzBreachLogo from '../../components/common/BuzzBreachLogo';

const { width, height } = Dimensions.get('window');

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
      
      {/* Background Image - Splash screen image */}
      <ImageBackground
        source={require('../../../assets/splash-screen.jpeg')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
      >
        {/* Light Overlay - subtle darkening for text readability */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.5)']}
          locations={[0, 1]}
          style={styles.overlay}
        >
          {/* Logo and Brand - Centered */}
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              {/* Logo Icon and Text side by side */}
              <View style={styles.logoRow}>
                <BuzzBreachLogo size={60} />
                <View style={styles.brandContainer}>
                  <Text style={styles.brandName}>BUZZBREACH</Text>
                  {/* Tagline aligned directly below brand name */}
                  <Text style={styles.tagline}>breaking through the noise</Text>
                </View>
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
  // Background image style
  backgroundImageStyle: {
    opacity: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 1,
    // Perfectly centered - overlay already has justifyContent: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    marginLeft: 12,
    alignItems: 'flex-start',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900', // Extra bold for ITC Machine style
    color: colors.white,
    letterSpacing: 3,
    textTransform: 'uppercase',
    // ITC Machine style - using closest available bold sans-serif
    fontFamily: Platform.select({
      ios: 'Arial-BoldMT', // Heavy bold sans-serif similar to ITC Machine
      android: 'sans-serif-black', // Extra bold sans-serif on Android
    }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    color: colors.white,
    letterSpacing: 1.5,
    fontWeight: '300',
    textAlign: 'left',
    textTransform: 'lowercase',
    // Roboto or similar geometric sans-serif
    fontFamily: Platform.select({
      ios: 'System', // San Francisco - similar geometric sans-serif
      android: 'Roboto', // Roboto is default on Android
    }),
    opacity: 0.9,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default SplashScreen;
