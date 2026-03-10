import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { Dimensions, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import SplashScreen from '../screens/onboarding/SplashScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import HomeScreen from '../screens/home/HomeScreen';
import JobsScreen from '../screens/jobs/JobsScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import EventsScreen from '../screens/events/EventsScreen';
import BlogScreen from '../screens/blog/BlogScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AccountPreferencesScreen from '../screens/profile/AccountPreferencesScreen';
import VisibilityScreen from '../screens/profile/VisibilityScreen';
import DataPrivacyScreen from '../screens/profile/DataPrivacyScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import JobNotificationsScreen from '../screens/profile/JobNotificationsScreen';

import { colors, fontSize, spacing, borderRadius } from '../theme/colors';
import { checkAuthAsync } from '../store/slices/authSlice';
import { LoadingScreen } from '../components/common/Loading';
import { isOnboardingComplete } from '../utils/storage';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isShortDevice = screenHeight < 700;

// Base tab styles (for components that don't need dynamic bottomPadding)
const baseTabStyles = StyleSheet.create({
  tabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 50,
    maxWidth: 80,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    marginTop: 4,
  },
  centralButton: {
    position: 'absolute',
    left: '50%',
    marginLeft: -17,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
  centralButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Custom Tab Bar Button for Central Action
const CentralTabButton = ({ onPress, bottomPadding = 0 }) => {
  const safeBottom = Math.max(bottomPadding, 4);
  return (
    <TouchableOpacity
      style={[baseTabStyles.centralButton, { bottom: safeBottom - 22 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={baseTabStyles.centralButtonInner}>
        <Ionicons name="add" size={22} color={colors.white} />
      </View>
    </TouchableOpacity>
  );
};

// Bottom Tab Navigator
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  // Calculate responsive tab bar height
  const tabBarHeight = 60;
  // Use safe area insets for bottom padding
  const bottomPadding = Platform.OS === 'ios' ? insets.bottom : 0;
  
  // Create tab styles with bottom padding
  const dynamicTabStyles = createTabStyles(bottomPadding);
  
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
            case 'Events':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Jobs':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Blog':
              iconName = focused ? 'document-text' : 'document-text-outline';
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
          backgroundColor: '#FFFFFF', // White background matching the image
          borderTopColor: colors.border,
          borderTopWidth: 0,
          paddingBottom: 0,
          paddingTop: 0,
          height: 60,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
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
      tabBar={(props) => {
        const routes = props.state.routes.filter((_, index) => index !== 2); // Filter out CreatePost
        const descriptors = Object.fromEntries(
          Object.entries(props.descriptors).filter(([key]) => {
            const routeIndex = props.state.routes.findIndex(r => r.key === key);
            return routeIndex !== 2; // Filter out CreatePost
          })
        );

        return (
          <View style={dynamicTabStyles.tabBarContainer}>
            {/* Left side tabs (Home, Events) */}
            <View style={[baseTabStyles.tabBarContent, { flex: 1, paddingRight: 10 }]}>
              {routes.slice(0, 2).map((route, displayIndex) => {
                const originalIndex = displayIndex;
                const { options } = descriptors[route.key] || props.descriptors[route.key];
                const isFocused = props.state.index === originalIndex;
                const label = options?.tabBarLabel || options?.title || route.name;

                const onPress = () => {
                  const event = props.navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    props.navigation.navigate(route.name);
                  }
                };

                const onLongPress = () => {
                  props.navigation.emit({
                    type: 'tabLongPress',
                    target: route.key,
                  });
                };

                return (
                  <TouchableOpacity
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={options?.tabBarAccessibilityLabel}
                    testID={options?.tabBarTestID}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    style={baseTabStyles.tabItem}
                  >
                    {options?.tabBarIcon &&
                      options.tabBarIcon({
                        focused: isFocused,
                        color: isFocused ? colors.primary : colors.textMuted,
                        size: isSmallDevice ? 20 : 24,
                      })}
                    <Text
                      style={[
                        baseTabStyles.tabLabel,
                        { color: isFocused ? colors.primary : colors.textMuted },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Central + Button */}
            <View style={{ width: 46, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 }}>
              <CentralTabButton
                bottomPadding={bottomPadding}
                onPress={() => {
                  // Navigate to create post screen or show action sheet
                  console.log('Create post pressed');
                }}
              />
            </View>
            
            {/* Right side tabs (Jobs, Blog) */}
            <View style={[baseTabStyles.tabBarContent, { flex: 1, paddingLeft: 10 }]}>
              {routes.slice(2).map((route, displayIndex) => {
                const originalIndex = displayIndex + 3; // Skip CreatePost (index 2)
                const { options } = descriptors[route.key] || props.descriptors[route.key];
                const isFocused = props.state.index === originalIndex;
                const label = options?.tabBarLabel || options?.title || route.name;

                const onPress = () => {
                  const event = props.navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    props.navigation.navigate(route.name);
                  }
                };

                const onLongPress = () => {
                  props.navigation.emit({
                    type: 'tabLongPress',
                    target: route.key,
                  });
                };

                return (
                  <TouchableOpacity
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={options?.tabBarAccessibilityLabel}
                    testID={options?.tabBarTestID}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    style={baseTabStyles.tabItem}
                  >
                    {options?.tabBarIcon &&
                      options.tabBarIcon({
                        focused: isFocused,
                        color: isFocused ? colors.primary : colors.textMuted,
                        size: isSmallDevice ? 20 : 24,
                      })}
                    <Text
                      style={[
                        baseTabStyles.tabLabel,
                        { color: isFocused ? colors.primary : colors.textMuted },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false, tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{ headerShown: false, tabBarLabel: 'Events' }}
      />
      <Tab.Screen
        name="CreatePost"
        component={HomeScreen} // Placeholder, will be replaced by button
        options={{
          headerShown: false,
          tabBarButton: () => null, // Hide the tab button
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{ headerShown: false, tabBarLabel: 'Jobs' }}
      />
      <Tab.Screen
        name="Blog"
        component={BlogScreen}
        options={{ headerShown: false, tabBarLabel: 'Blog' }}
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
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccountPreferences"
        component={AccountPreferencesScreen}
        options={{ title: 'Account Preferences' }}
      />
      <Stack.Screen
        name="Visibility"
        component={VisibilityScreen}
        options={{ title: 'Visibility' }}
      />
      <Stack.Screen
        name="DataPrivacy"
        component={DataPrivacyScreen}
        options={{ title: 'Data Privacy' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="JobNotifications"
        component={JobNotificationsScreen}
        options={{ title: 'Job Notifications' }}
      />
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigationRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check auth status
        const authResult = await dispatch(checkAuthAsync());
        
        // Check onboarding status - prioritize backend user data if authenticated
        let onboardingDone = false;
        if (checkAuthAsync.fulfilled.match(authResult)) {
          const user = authResult.payload;
          // If user is authenticated, check backend isOnboarded status
          const userOnboarded = user?.isOnboarded;
          const hasOnboardedProperty = user && ('isOnboarded' in user);
          
          if (hasOnboardedProperty) {
            // Check for boolean true, string "true", or number 1
            onboardingDone = userOnboarded === true || userOnboarded === 'true' || userOnboarded === 1;
            // Sync local storage with backend status
            const { markOnboardingComplete, resetOnboarding } = await import('../utils/storage');
            if (onboardingDone) {
              await markOnboardingComplete();
            } else {
              await resetOnboarding();
            }
            
            console.log('AppNavigator onboarding check:', {
              userOnboarded: userOnboarded,
              userOnboardedType: typeof userOnboarded,
              hasOnboardedProperty,
              onboardingDone,
              userKeys: user ? Object.keys(user) : []
            });
          } else {
            // Fallback to local storage if backend data not available
            onboardingDone = await isOnboardingComplete();
            console.log('AppNavigator: No isOnboarded property, using local storage:', onboardingDone);
          }
        } else {
          // Not authenticated - check local storage only
          onboardingDone = await isOnboardingComplete();
          console.log('AppNavigator: Not authenticated, using local storage:', onboardingDone);
        }
        
        setHasCompletedOnboarding(onboardingDone);
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  // Handle deep linking for password reset
  useEffect(() => {
    // Handle initial URL when app opens from a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle URL when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Parse and handle deep link
  const handleDeepLink = (url) => {
    console.log('Deep link received:', url);
    
    try {
      // Parse URL - supports both http:// and buzzbreach:// schemes
      // Format: http://localhost:3000/reset-password?token=xxx&email=yyy
      // Or: buzzbreach://reset-password?token=xxx&email=yyy
      
      let urlObj;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        urlObj = new URL(url);
      } else if (url.startsWith('buzzbreach://')) {
        // Convert custom scheme to standard URL format for parsing
        const standardUrl = url.replace('buzzbreach://', 'http://');
        urlObj = new URL(standardUrl);
      } else {
        console.log('Unknown URL format:', url);
        return;
      }

      const path = urlObj.pathname;
      const params = new URLSearchParams(urlObj.search);

      // Handle password reset link
      if (path.includes('reset-password')) {
        const token = params.get('token');
        const email = params.get('email');

        if (token && email && navigationRef.current) {
          console.log('Navigating to ResetPassword with token and email');
          navigationRef.current.navigate('ResetPassword', {
            token: decodeURIComponent(token),
            email: decodeURIComponent(email),
          });
        } else {
          console.log('Missing token or email in reset password link');
        }
      }
    } catch (error) {
      console.error('Error parsing deep link:', error);
    }
  };

  // Show loading while checking auth (but not the splash screen)
  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  // Determine initial route based on auth and onboarding status
  const getInitialRouteName = () => {
    // Always start with Splash screen first
    return 'Splash';
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRouteName()}
      >
        {/* Splash Screen - First screen shown */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        
        {/* Auth/Onboarding Screens */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen 
          name="ResetPassword" 
          component={ResetPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        
        {/* Main App */}
        <Stack.Screen name="Main" component={MainStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Tab Bar Styles - will be created inside component to access insets
const createTabStyles = (bottomPadding) => StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? Math.max(bottomPadding, 4) : 4,
    paddingTop: 8,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default AppNavigator;
