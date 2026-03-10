import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, spacing, borderRadius } from '../../theme/colors';
import BuzzBreachLogo from '../../components/common/BuzzBreachLogo';

const { width, height } = Dimensions.get('window');

// User avatars for the network graphic (4 total on outer circle)
const userAvatars = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', // Top right
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', // Mid left
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', // Mid right
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', // Bottom left
];

// Network Connection Graphic Component with user avatars
const NetworkGraphic = ({ graphicWidth }) => {
  const w = graphicWidth;
  const h = 280;
  const centerX = w * 0.5;
  const centerY = h * 0.5;
  const outerRadius = w * 0.35;
  const innerRadius = outerRadius * 0.6;
  const avatarSize = 35; // Minimized avatar size
  
  // Calculate positions for 4 avatars on outer circle
  const avatarPositions = [
    { angle: -Math.PI / 4, label: 'top-right' },      // Top right
    { angle: 3 * Math.PI / 4, label: 'mid-left' },   // Mid left
    { angle: Math.PI / 4, label: 'mid-right' },      // Mid right
    { angle: -3 * Math.PI / 4, label: 'bottom-left' }, // Bottom left
  ];

  // Generate dots along circles
  const generateDots = (radius, count) => {
    const dots = [];
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      dots.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
    return dots;
  };

  const outerDots = generateDots(outerRadius, 24);
  const innerDots = generateDots(innerRadius, 16);

  const networkStyles = StyleSheet.create({
    container: {
      position: 'relative',
      width: w,
      height: h,
      alignSelf: 'center',
    },
    svg: {
      position: 'absolute',
    },
    avatarContainer: {
      position: 'absolute',
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.backgroundCard,
      overflow: 'hidden',
    },
    avatar: {
      width: '100%',
      height: '100%',
    },
    dot: {
      position: 'absolute',
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary,
    },
  });

  return (
    <View style={networkStyles.container}>
      <Svg width={w} height={h} style={networkStyles.svg}>
        {/* Outer dashed circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          stroke={colors.primary}
          strokeWidth={1.5}
          strokeDasharray="4,4"
          fill="none"
          opacity={0.6}
        />
        
        {/* Inner dashed circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          stroke={colors.primary}
          strokeWidth={1.5}
          strokeDasharray="4,4"
          fill="none"
          opacity={0.6}
        />
      </Svg>

      {/* Solid purple dots along circles */}
      {outerDots.map((dot, i) => (
        <View
          key={`outer-dot-${i}`}
          style={[
            networkStyles.dot,
            {
              left: dot.x - 2,
              top: dot.y - 2,
            },
          ]}
        />
      ))}
      {innerDots.map((dot, i) => (
        <View
          key={`inner-dot-${i}`}
          style={[
            networkStyles.dot,
            {
              left: dot.x - 2,
              top: dot.y - 2,
            },
          ]}
        />
      ))}

      {/* User Avatars on outer circle (4 total) */}
      {avatarPositions.map((pos, i) => {
        const x = centerX + outerRadius * Math.cos(pos.angle);
        const y = centerY + outerRadius * Math.sin(pos.angle);
        return (
          <View
            key={`avatar-${i}`}
            style={[
              networkStyles.avatarContainer,
              {
                left: x - avatarSize / 2,
                top: y - avatarSize / 2,
              },
            ]}
          >
            <Image
              source={{ uri: userAvatars[i] }}
              style={networkStyles.avatar}
            />
          </View>
        );
      })}
    </View>
  );
};

const WelcomeScreen = ({ navigation }) => {
  const graphicWidth = Math.min(width - spacing.lg * 2, 300);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image - Same as splash screen */}
      <ImageBackground
        source={require('../../../assets/splash-screen.jpeg')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
      >
        {/* Dark Overlay - same as splash screen */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.5)']}
          locations={[0, 1]}
          style={styles.overlay}
        >
          {/* Content */}
          <View style={styles.content}>
            {/* Top Left - Logo and Brand (minimized) */}
            <View style={styles.topRightSection}>
              <View style={styles.logoContainer}>
                {/* Logo and Platform Name together */}
                <View style={styles.logoRow}>
                  <BuzzBreachLogo size={24} />
                  <Text style={styles.brandName}>BUZZBREACH</Text>
                </View>
                {/* Tagline exactly below BUZZBREACH */}
                <View style={styles.taglineContainer}>
                  <Text style={styles.tagline}>breaking through the noise</Text>
                </View>
              </View>
            </View>
            
            {/* Main Content Section */}
            <View style={styles.mainContent}>
              {/* Tagline - larger, bold, title case */}
              <Text style={styles.mainTagline}>Find & Connect !</Text>
              
              {/* Description - smaller, regular weight */}
              <Text style={styles.description}>
                Enjoy together, happy to share and save your time connecting with people.
              </Text>

              {/* Middle Section - Circular Graphic */}
              <View style={styles.graphicContainer}>
                <NetworkGraphic graphicWidth={graphicWidth} />
              </View>

              {/* Bottom Section - Get Started Button */}
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
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
    flex: 1,
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || spacing.md) : spacing.md,
    paddingBottom: spacing.xl,
  },
  topRightSection: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing.lg : spacing.lg,
    left: spacing.sm,
    zIndex: 10,
    alignItems: 'flex-start',
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  brandName: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.white,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 6,
    // ITC Machine style - matching splash screen exactly
    fontFamily: Platform.select({
      ios: 'Arial',
      android: 'sans-serif-black',
    }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  taglineContainer: {
    marginLeft: 30, // Logo width (24) + marginLeft (6) = 30 to align with BUZZBREACH start
    marginTop: 1,
  },
  tagline: {
    fontSize: 11,
    color: colors.white,
    letterSpacing: 0.75,
    fontWeight: '300',
    textAlign: 'left',
    textTransform: 'lowercase',
    // Roboto or similar geometric sans-serif - matching splash screen exactly
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: spacing.xl,
  },
  mainTagline: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: spacing.md,
    // Roboto or similar geometric sans-serif
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
    // Roboto or similar geometric sans-serif
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  graphicContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing.lg,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 280,
    maxWidth: 280,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    // Roboto or similar geometric sans-serif
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
  },
});

export default WelcomeScreen;
