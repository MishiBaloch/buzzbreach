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
import { colors, fontSize, spacing, borderRadius } from '../../theme/colors';
import { registerAsync, loginWithGoogleAsync, loginWithFacebookAsync, loginWithAppleAsync } from '../../store/slices/authSlice';
import { LoadingOverlay } from '../../components/common/Loading';
import { isOnboardingComplete } from '../../utils/storage';
import BuzzBreachLogo from '../../components/common/BuzzBreachLogo';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

// Validation helpers
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  return password.length >= 6;
};

const SignUpScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  // Step 1: Email, Step 2: Password
  const [step, setStep] = useState(1);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate Step 1 (Email)
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 2 (Passwords)
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field blur
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    if (step === 1) {
      validateStep1();
    } else {
      validateStep2();
    }
  };

  // Handle Step 1 Continue
  const handleStep1Continue = () => {
    if (validateStep1()) {
      setStep(2);
      setTouched({});
    }
  };

  // Handle Sign Up
  const handleSignUp = async () => {
    if (!validateStep2()) return;

    try {
      const result = await dispatch(registerAsync({
        email,
        password,
        firstName: '',
        lastName: '',
      }));

      if (registerAsync.fulfilled.match(result)) {
        // Registration successful - navigate directly to Login screen
        // Navigate immediately after successful signup
        navigation.navigate('Login');
      } else {
        Alert.alert(
          'Registration Failed',
          result.payload || 'Could not create account. Please try again.'
        );
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
          
          console.log('Social signup onboarding check:', { 
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
          `${provider} Sign Up Failed`,
          result.payload || `Failed to sign up with ${provider}. Please try again.`
        );
      }
    } catch (error) {
      Alert.alert('Error', `Something went wrong with ${provider} sign up. Please try again.`);
    }
  };

  // Step 1 Form Valid
  const isStep1Valid = email && isValidEmail(email);

  // Step 2 Form Valid
  const isStep2Valid = password && confirmPassword && 
    isValidPassword(password) && password === confirmPassword;

  // Social Login Section (shared between steps)
  const renderSocialSection = () => (
    <>
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
    </>
  );

  // Render Step 1: Email
  const renderStep1 = () => (
    <>
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

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[styles.signUpButton, !isStep1Valid && styles.buttonDisabled]}
        onPress={handleStep1Continue}
        activeOpacity={0.8}
        disabled={!isStep1Valid}
      >
        <Text style={styles.signUpButtonText}>Continue</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>

      {renderSocialSection()}
    </>
  );

  // Render Step 2: Password
  const renderStep2 = () => (
    <>
      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={[
          styles.inputWrapper,
          touched.password && errors.password && styles.inputError
        ]}>
          <TextInput
            style={styles.input}
            placeholder="Create your password"
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
              // When showPassword is true: show eye-off-outline (line/cross through) and password is visible
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

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <View style={[
          styles.inputWrapper,
          touched.confirmPassword && errors.confirmPassword && styles.inputError
        ]}>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor={colors.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => handleBlur('confirmPassword')}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.6}
            accessible={true}
            accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              // When showConfirmPassword is true: show eye-off-outline (line/cross through) and password is visible
              // When showConfirmPassword is false: show eye-outline (normal eye) and password is hidden (stars)
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {touched.confirmPassword && errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
      </View>

      {/* API Error Message */}
      {error && (
        <View style={styles.apiErrorContainer}>
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text style={styles.apiErrorText}>{error}</Text>
        </View>
      )}

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[styles.signUpButton, !isStep2Valid && styles.buttonDisabled]}
        onPress={handleSignUp}
        activeOpacity={0.8}
        disabled={!isStep2Valid || isLoading}
      >
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>

      {renderSocialSection()}
    </>
  );

  return (
    <ImageBackground
      source={require('../../../assets/signup.jpeg')}
      style={styles.container}
      imageStyle={styles.backgroundImageStyle}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Dark Overlay */}
      <LinearGradient
        colors={['rgba(13, 11, 30, 0.3)', 'rgba(13, 11, 30, 0.8)']}
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
          {/* Header - empty for spacing */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.placeholder} />
            <View style={styles.placeholder} />
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
              {/* Step Indicator */}
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                <View style={styles.stepLine} />
                <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
              </View>

              {/* Title Section */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Let's Talk To{'\n'}Your Goals!</Text>
                <Text style={styles.subtitle}>
                  BuzzBreach will connect people to help{'\n'}them achieve their goals!
                </Text>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                {step === 1 ? renderStep1() : renderStep2()}
              </View>
            </LinearGradient>
          </View>

          {/* Bottom Indicator */}
          <View style={styles.bottomIndicator}>
            <View style={styles.indicator} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Creating account..." />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing.md : spacing.lg,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
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
  signUpButton: {
    backgroundColor: colors.primary,
    paddingVertical: isSmallDevice ? spacing.sm + 2 : spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginTop: spacing.xs,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  signUpButtonText: {
    fontSize: isSmallDevice ? fontSize.md : fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  loginText: {
    fontSize: isSmallDevice ? fontSize.sm : fontSize.md,
    color: colors.textSecondary,
  },
  loginLink: {
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

export default SignUpScreen;
