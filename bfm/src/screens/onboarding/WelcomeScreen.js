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
} from 'react-native';
import Svg, { Circle, Line, G, Defs, RadialGradient, Stop, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, spacing, borderRadius } from '../../theme/colors';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

// Custom BuzzBreach Logo Component
const BuzzBreachLogo = ({ size = 24, color = colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <G>
      {/* Left vertical line of B */}
      <Path
        d="M25 20 L25 80"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* Top curve of B */}
      <Path
        d="M25 20 Q55 20 55 35 Q55 50 25 50"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bottom curve of B */}
      <Path
        d="M25 50 Q60 50 60 65 Q60 80 25 80"
        stroke={color}
        strokeWidth="10"
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
        strokeWidth="3"
        strokeDasharray="4,3"
        opacity="0.6"
      />
      <Path
        d="M60 65 L72 75"
        stroke={color}
        strokeWidth="3"
        strokeDasharray="4,3"
        opacity="0.6"
      />
    </G>
  </Svg>
);

// User avatars for the network graphic
const userAvatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
];

// Network Connection Graphic Component with user avatars
const NetworkGraphic = ({ graphicWidth }) => {
  const w = graphicWidth;
  const h = isSmallDevice ? 270 : 330;
  const centerX = w * 0.5;
  const centerY = isSmallDevice ? 150 : 175;
  const outerRadius = isSmallDevice ? w * 0.34 : w * 0.36;
  const innerRadius = outerRadius * 0.6;
  const avatarSize = 44;
  
  // Calculate points on the outer circle (4 points for avatars)
  const avatarPositions = [
    { x: centerX + outerRadius * Math.cos(-Math.PI / 4), y: centerY + outerRadius * Math.sin(-Math.PI / 4) }, // Top right
    { x: centerX + outerRadius * Math.cos(Math.PI / 4), y: centerY + outerRadius * Math.sin(Math.PI / 4) }, // Bottom right
    { x: centerX + outerRadius * Math.cos(3 * Math.PI / 4), y: centerY + outerRadius * Math.sin(3 * Math.PI / 4) }, // Bottom left
    { x: centerX + outerRadius * Math.cos(-3 * Math.PI / 4), y: centerY + outerRadius * Math.sin(-3 * Math.PI / 4) }, // Top left
  ];

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
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.backgroundCard,
      overflow: 'hidden',
    },
    avatar: {
      width: '100%',
      height: '100%',
    },
    centerLogo: {
      position: 'absolute',
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={networkStyles.container}>
      <Svg width={w} height={h} style={networkStyles.svg}>
        <Defs>
          <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Glow effect */}
        <Circle cx={centerX} cy={centerY} r={outerRadius + 30} fill="url(#centerGlow)" />

        {/* Outer dashed circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          stroke={colors.border}
          strokeWidth={1.5}
          strokeDasharray="6,6"
          fill="none"
          opacity={0.6}
        />
        
        {/* Inner circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          stroke={colors.primary}
          strokeWidth={1.5}
          strokeOpacity={0.5}
          fill="none"
        />

        {/* Connection lines from center to avatar positions */}
        {avatarPositions.map((pos, i) => (
          <Line
            key={`line-${i}`}
            x1={centerX}
            y1={centerY}
            x2={pos.x}
            y2={pos.y}
            stroke={colors.primary}
            strokeWidth={1}
            strokeOpacity={0.3}
            strokeDasharray="4,4"
          />
        ))}

        {/* Center circle background */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={35}
          fill={colors.backgroundCard}
          stroke={colors.primary}
          strokeWidth={2}
        />
        
        {/* Center inner glow */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={25}
          fill={colors.primary}
          opacity={0.15}
        />
      </Svg>

      {/* User Avatars positioned absolutely */}
      {avatarPositions.map((pos, i) => (
        <View
          key={`avatar-${i}`}
          style={[
            networkStyles.avatarContainer,
            {
              left: pos.x - avatarSize / 2,
              top: pos.y - avatarSize / 2,
            },
          ]}
        >
          <Image
            source={{ uri: userAvatars[i] }}
            style={networkStyles.avatar}
          />
        </View>
      ))}

      {/* Center logo */}
      <View style={[networkStyles.centerLogo, { left: centerX - 15, top: centerY - 15 }]}>
        <BuzzBreachLogo size={30} color={colors.primary} />
      </View>
    </View>
  );
};

const WelcomeScreen = ({ navigation }) => {
  const graphicWidth = Math.min(width - spacing.lg * 2, isSmallDevice ? 280 : 320);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200' }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(13, 11, 30, 0.35)', 'rgba(13, 11, 30, 0.95)', colors.background]}
          locations={[0, 0.65, 0.95]}
          style={styles.overlay}
        >
          {/* Main card (matches the mock "Splash" with background photo + glass card) */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <BuzzBreachLogo size={22} color={colors.primary} />
              <Text style={styles.logoText}>BUZZBREACH</Text>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Find & Connect !</Text>
              <Text style={styles.subtitle}>
                Enjoy together, happy to share and save{'\n'}your time connecting with people.
              </Text>
            </View>

            <View style={styles.graphicContainer}>
              <NetworkGraphic graphicWidth={graphicWidth} />
            </View>

            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom indicator */}
          <View style={styles.bottomIndicator}>
            <View style={styles.indicator} />
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
    width: '100%',
    maxWidth: width,
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    transform: [{ scale: 1.12 }, { translateY: 14 }],
  },
  overlay: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: borderRadius.xxl,
    backgroundColor: 'rgba(26, 23, 52, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.22)',
    padding: isSmallDevice ? spacing.md : spacing.lg,
    alignSelf: 'center',
    maxWidth: 420,
    marginTop: isSmallDevice ? spacing.xl : spacing.xxl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
    letterSpacing: 2,
  },
  titleContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isSmallDevice ? fontSize.sm : fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  graphicContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    width: '100%',
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    paddingVertical: isSmallDevice ? spacing.sm + 2 : spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    width: '100%',
  },
  getStartedText: {
    fontSize: isSmallDevice ? fontSize.md : fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  bottomIndicator: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  indicator: {
    width: 100,
    height: 4,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    opacity: 0.3,
  },
});

export default WelcomeScreen;
