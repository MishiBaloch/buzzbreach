import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { loginAsync, loginWithGoogleAsync, loginWithFacebookAsync, loginWithAppleAsync } from '../../store/slices/authSlice';
import { colors, fontSize, spacing, borderRadius } from '../../theme/colors';
import { LoadingOverlay } from '../../components/common/Loading';
import { isOnboardingComplete } from '../../utils/storage';
import BuzzBreachLogo from '../../components/common/BuzzBreachLogo';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 6 characters)
const isValidPassword = (password) => {
  return password.length >= 6;
};

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field blur
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(loginAsync({ email, password }));
      if (loginAsync.fulfilled.match(result)) {
        // Use user data from login response (backend should return latest isOnboarded status)
        const user = result.payload?.user;
        
        console.log('Login response user:', user);
        
        // Check if onboarding is complete - prioritize backend user data
        let onboardingDone = false;
        
        // First check backend user data (most reliable)
        // Handle both boolean true and string "true" values, and check if property exists
        const userOnboarded = user?.isOnboarded;
        
        // Check if user object exists and has isOnboarded property (even if undefined)
        if (user && user.hasOwnProperty('isOnboarded')) {
          // Check for boolean true, string "true", or number 1
          // Explicitly check for false, null, undefined, empty string, 0, or false string
          const isExplicitlyOnboarded = userOnboarded === true || userOnboarded === 'true' || userOnboarded === 1;
          const isExplicitlyNotOnboarded = userOnboarded === false || userOnboarded === 'false' || userOnboarded === 0 || userOnboarded === null || userOnboarded === undefined;
          
          if (isExplicitlyOnboarded) {
            onboardingDone = true;
          } else if (isExplicitlyNotOnboarded) {
            onboardingDone = false;
          } else {
            // If it's some other value, default to false
            onboardingDone = false;
          }
          
          // Sync local storage with backend status
          const { markOnboardingComplete, resetOnboarding } = await import('../../utils/storage');
          if (onboardingDone) {
            // Backend says onboarded - update local storage to match
            await markOnboardingComplete();
          } else {
            // Backend says not onboarded - clear local storage to avoid conflicts
            await resetOnboarding();
          }
        } else {
          // Fallback to local storage if backend data not available
          onboardingDone = await isOnboardingComplete();
        }
        
        console.log('Onboarding check:', { 
          userOnboarded: userOnboarded,
          userOnboardedType: typeof userOnboarded,
          userOnboardedValue: JSON.stringify(userOnboarded),
          hasOnboardedProperty: user && user.hasOwnProperty('isOnboarded'),
          onboardingDone,
          hasUser: !!user,
          userKeys: user ? Object.keys(user) : [],
          fullUserObject: JSON.stringify(user)
        });
        
        if (onboardingDone) {
          // User has completed onboarding - go to main app
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          // User needs to complete onboarding
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        }
      } else {
        Alert.alert('Login Failed', result.payload || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  // Handle Social Login
  const handleSocialLogin = async (provider) => {
    try {
      let result;
      if (provider === 'Google') {
        result = await dispatch(loginWithGoogleAsync());
      } else if (provider === 'Facebook') {
        result = await dispatch(loginWithFacebookAsync());
      } else if (provider === 'Apple') {
        result = await dispatch(loginWithAppleAsync());
      }

      if (result && (loginWithGoogleAsync.fulfilled.match(result) || 
                     loginWithFacebookAsync.fulfilled.match(result) || 
                     loginWithAppleAsync.fulfilled.match(result))) {
        // For social login, get user details from backend to check onboarding status
        try {
          const { getCurrentUser } = await import('../../api/services/authService');
          const userResult = await getCurrentUser();
          const user = userResult?.data;
          let onboardingDone = false;
          
          // Prioritize backend user data
          // Handle both boolean true and string "true" values, and check if property exists
          const userOnboarded = user?.isOnboarded;
          const hasOnboardedProperty = user && ('isOnboarded' in user);
          
          if (hasOnboardedProperty) {
            // Check for boolean true, string "true", or number 1
            onboardingDone = userOnboarded === true || userOnboarded === 'true' || userOnboarded === 1;
            
            // Sync local storage with backend status
            const { markOnboardingComplete, resetOnboarding } = await import('../../utils/storage');
            if (onboardingDone) {
              // Backend says onboarded - update local storage to match
              await markOnboardingComplete();
            } else {
              // Backend says not onboarded - clear local storage to avoid conflicts
              await resetOnboarding();
            }
          } else {
            // Fallback to local storage
            onboardingDone = await isOnboardingComplete();
          }
          
          console.log('Social login onboarding check:', { 
            userOnboarded: userOnboarded,
            userOnboardedType: typeof userOnboarded,
            hasOnboardedProperty,
            onboardingDone,
            userKeys: user ? Object.keys(user) : []
          });
          
          if (onboardingDone) {
            // User has completed onboarding - go to main app
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          } else {
            // User needs to complete onboarding
            navigation.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            });
          }
        } catch (err) {
          console.error('Error checking user onboarding status:', err);
          // Default to showing onboarding if we can't determine status
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        }
      } else if (result && (loginWithGoogleAsync.rejected.match(result) || 
                            loginWithFacebookAsync.rejected.match(result) || 
                            loginWithAppleAsync.rejected.match(result))) {
    Alert.alert(
          `${provider} Login Failed`,
          result.payload || `Failed to login with ${provider}. Please try again.`
    );
      }
    } catch (error) {
      Alert.alert('Error', `Something went wrong with ${provider} login. Please try again.`);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const isFormValid = email && password && isValidEmail(email) && isValidPassword(password);

  return (
    <ImageBackground
      source={require('../../../assets/splash-screen.jpeg')}
      style={styles.container}
      imageStyle={styles.backgroundImageStyle}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Dark Overlay */}
      <LinearGradient
        colors={['rgba(13, 11, 30, 0.3)', 'rgba(13, 11, 30, 0.7)']}
        locations={[0, 1]}
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {/* Header - Login text at top left */}
          <View style={styles.header}>
            <Text style={styles.loginHeaderText}></Text>
          </View>

          {/* Logo and Tagline at TOP - above the card */}
          <View style={styles.topLogoSection}>
            {/* Logo and Platform Name together */}
            <View style={styles.logoRow}>
              <BuzzBreachLogo size={35} />
              <Text style={styles.brandName}>BUZZBREACH</Text>
            </View>
            {/* Tagline exactly below platform name */}
            <View style={styles.taglineContainer}>
              <Text style={styles.topTagline}>breaking through the noise</Text>
            </View>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Main Content Card with Gradient Blend */}
          <View style={styles.mainCard}>
            <LinearGradient
              colors={['rgba(13, 11, 30, 0)', 'rgba(13, 11, 30, 0.3)', 'rgba(13, 11, 30, 0.7)', 'rgba(13, 11, 30, 0.95)', colors.background]}
              locations={[0, 0.1, 0.25, 0.5, 0.75]}
              style={styles.cardGradient}
            >
              {/* Title Section */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Let's Talk To{'\n'}Your Goals!</Text>
                <Text style={styles.subtitle}>
                  BuzzBreach will connect people to help{'\n'}them achieve their goals!
                </Text>
              </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[
                  styles.inputWrapper,
                  touched.email && errors.email && styles.inputError
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email address"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    onBlur={() => handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[
                  styles.inputWrapper,
                  touched.password && errors.password && styles.inputError
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    activeOpacity={0.6}
                    accessible={true}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Ionicons
                      // When showPassword is true: show eye-off-outline (line through) and password is visible
                      // When showPassword is false: show eye-outline (normal eye) and password is hidden (stars)
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* API Error Message */}
              {error && (
                <View style={styles.apiErrorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.apiErrorText}>{error}</Text>
                </View>
              )}

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, !isFormValid && styles.buttonDisabled]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={!isFormValid || isLoading}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>

              {/* Create Account Link */}
              <View style={styles.createAccountContainer}>
                <Text style={styles.createAccountText}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.createAccountLink}>Create Account</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialContainer}>
                <TouchableOpacity 
                  style={styles.socialButton} 
                  activeOpacity={0.7}
                  onPress={() => handleSocialLogin('Apple')}
                >
                  <Ionicons name="logo-apple" size={24} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.socialButton} 
                  activeOpacity={0.7}
                  onPress={() => handleSocialLogin('Facebook')}
                >
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.socialButton} 
                  activeOpacity={0.7}
                  onPress={() => handleSocialLogin('Google')}
                >
                  <Ionicons name="logo-google" size={24} color="#EA4335" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

          {/* Bottom Indicator */}
          <View style={styles.bottomIndicator}>
            <View style={styles.indicator} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Signing in..." />
    </LinearGradient>
  </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    opacity: 1,
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing.md : spacing.lg,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  loginHeaderText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  topLogoSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  brandName: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginLeft: 8,
    // ITC Machine style - matching splash screen
    fontFamily: Platform.select({
      ios: 'Arial-BoldMT',
      android: 'sans-serif-black',
    }),
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglineContainer: {
    marginLeft: 43, // Logo width (35) + marginLeft (8) = 43 to align with BUZZBREACH start
    alignItems: 'flex-start',
    marginTop: -2,
  },
  topTagline: {
    fontSize: 10,
    color: colors.white,
    letterSpacing: 1,
    fontWeight: '300',
    textAlign: 'left',
    textTransform: 'lowercase',
    // Roboto or similar geometric sans-serif
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  spacer: {
    height: isSmallDevice ? 20 : 30,
  },
  mainCard: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    width: '100%',
    overflow: 'hidden',
  },
  cardGradient: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    width: '100%',
  },
  titleSection: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: isSmallDevice ? 28 : 36,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: isSmallDevice ? 36 : 44,
  },
  subtitle: {
    fontSize: isSmallDevice ? fontSize.md : fontSize.lg,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.sm,
    width: '100%',
  },
  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: isSmallDevice ? spacing.sm : spacing.md,
    fontSize: isSmallDevice ? fontSize.sm : fontSize.md,
    color: colors.white,
  },
  eyeButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  apiErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.md,
  },
  apiErrorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
    flex: 1,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: isSmallDevice ? spacing.sm + 2 : spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: isSmallDevice ? fontSize.md : fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  createAccountText: {
    fontSize: isSmallDevice ? fontSize.sm : fontSize.md,
    color: colors.textSecondary,
  },
  createAccountLink: {
    fontSize: isSmallDevice ? fontSize.sm : fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  socialButton: {
    width: isSmallDevice ? 48 : 52,
    height: isSmallDevice ? 48 : 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bottomIndicator: {
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

export default LoginScreen;
