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
import { loginAsync } from '../../store/slices/authSlice';
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
        // Check if onboarding is complete
        const onboardingDone = await isOnboardingComplete();
        
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
  const handleSocialLogin = (provider) => {
    Alert.alert(
      `${provider} Login`,
      `${provider} login will be implemented with Keycloak integration.`,
      [{ text: 'OK' }]
    );
  };

  // Handle Forgot Password
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const isFormValid = email && password && isValidEmail(email) && isValidPassword(password);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image Area */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800' }}
        style={styles.backgroundArea}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(13, 11, 30, 0.45)', 'rgba(13, 11, 30, 0.95)']}
          locations={[0, 1]}
          style={styles.gradient}
        >
          <View style={styles.heroImagePlaceholder}>
            <BuzzBreachLogo size={80} color={colors.primary} />
          </View>
        </LinearGradient>
      </ImageBackground>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Logo */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <BuzzBreachLogo size={22} color={colors.primary} />
              <Text style={styles.logoText}>BUZZBREACH</Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Main Content Card */}
          <View style={styles.mainCard}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Let's Talk To</Text>
              <Text style={styles.titleHighlight}>Your Goals!</Text>
              <Text style={styles.subtitle}>
                BuzzBreach will connect people to help{'\n'}them achieve their goals.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[
                  styles.inputWrapper,
                  touched.email && errors.email && styles.inputError
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
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
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
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
          </View>

          {/* Bottom Indicator */}
          <View style={styles.bottomIndicator}>
            <View style={styles.indicator} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Signing in..." />
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
  backgroundArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: isSmallDevice ? 180 : 250,
  },
  // Bias the hero photo down slightly so its focal area sits in the visible top strip (like the mock).
  backgroundImageStyle: {
    transform: [{ scale: 1.12 }, { translateY: 16 }],
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImagePlaceholder: {
    width: isSmallDevice ? 100 : 120,
    height: isSmallDevice ? 70 : 80,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isSmallDevice ? 40 : 50,
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + spacing.sm : spacing.xl,
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  spacer: {
    height: isSmallDevice ? 60 : 100,
  },
  mainCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  titleSection: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: isSmallDevice ? 22 : 28,
    fontWeight: '700',
    color: colors.white,
  },
  titleHighlight: {
    fontSize: isSmallDevice ? 22 : 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: isSmallDevice ? fontSize.sm : fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
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
