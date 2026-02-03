import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import SplashScreen from '../screens/onboarding/SplashScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/home/HomeScreen';
import JobsScreen from '../screens/jobs/JobsScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import EventsScreen from '../screens/events/EventsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import { colors, fontSize } from '../theme/colors';
import { checkAuthAsync } from '../store/slices/authSlice';
import { LoadingScreen } from '../components/common/Loading';
import { isOnboardingComplete } from '../utils/storage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isShortDevice = screenHeight < 700;

// Bottom Tab Navigator
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  // Calculate responsive tab bar height
  const tabBarHeight = isSmallDevice || isShortDevice ? 50 : 60;
  const bottomPadding = Platform.OS === 'ios' ? insets.bottom : 4;
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          // Adjust icon size for small devices
          const iconSize = isSmallDevice ? size - 4 : size;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Jobs':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Events':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: isSmallDevice ? 10 : fontSize.xs,
          fontWeight: '500',
          marginBottom: isSmallDevice ? 2 : 4,
        },
        tabBarStyle: {
          backgroundColor: colors.backgroundCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: bottomPadding,
          paddingTop: isSmallDevice ? 4 : 8,
          height: tabBarHeight + bottomPadding,
          minHeight: 50,
        },
        tabBarItemStyle: {
          paddingVertical: isSmallDevice ? 2 : 4,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.white,
          fontWeight: '600',
        },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator (for authenticated users)
const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: 'Job Details' }}
      />
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check auth status
        await dispatch(checkAuthAsync());
        
        // Check onboarding status
        const onboardingDone = await isOnboardingComplete();
        setHasCompletedOnboarding(onboardingDone);
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  // Show splash for 2 seconds on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking auth
  if (isLoading || showSplash) {
    return <LoadingScreen message="Loading..." />;
  }

  // Determine initial route based on auth and onboarding status
  const getInitialRouteName = () => {
    if (isAuthenticated && hasCompletedOnboarding) {
      return 'Main';
    }
    return 'Welcome';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRouteName()}
      >
        {/* Auth/Onboarding Screens */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        
        {/* Main App */}
        <Stack.Screen name="Main" component={MainStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
