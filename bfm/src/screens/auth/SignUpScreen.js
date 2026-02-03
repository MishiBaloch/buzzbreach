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
import { registerAsync } from '../../store/slices/authSlice';
import { LoadingOverlay } from '../../components/common/Loading';
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
        // Registration successful - show success and navigate to Login
        Alert.alert(
          'Account Created!',
          'Your account has been created successfully. Please login to continue.',
          [
            {
              text: 'Login',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
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
  const handleSocialLogin = (provider) => {
    Alert.alert(
      `${provider} Sign Up`,
      `${provider} sign up will be implemented with Keycloak integration.`,
      [{ text: 'OK' }]
    );
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
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image Area */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800' }}
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
              onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
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
            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Let's Talk To</Text>
              <Text style={styles.titleHighlight}>Your Goals!</Text>
              <Text style={styles.subtitle}>
                {step === 1 
                  ? 'Enter your email to get started.'
                  : 'Create a secure password for your account.'}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {step === 1 ? renderStep1() : renderStep2()}
            </View>
          </View>

          {/* Bottom Indicator */}
          <View style={styles.bottomIndicator}>
            <View style={styles.indicator} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Creating account..." />
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
    lineHeight: 20,
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
