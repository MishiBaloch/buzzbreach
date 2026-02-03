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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, spacing, borderRadius } from '../../theme/colors';
import { LoadingOverlay } from '../../components/common/Loading';
import BuzzBreachLogo from '../../components/common/BuzzBreachLogo';
import { forgotPassword } from '../../api/services/authService';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [emailSent, setEmailSent] = useState(false);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field blur
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setEmailSent(true);
        // In dev mode, show the token in console
        if (result.devToken) {
          console.log('[DEV] Reset token:', result.devToken);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
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

  const isFormValid = email && isValidEmail(email);

  // Email sent success screen
  if (emailSent) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' }}
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
              <Ionicons name="mail-open" size={70} color={colors.primary} />
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.successContent}>
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

          <View style={styles.spacer} />

          <View style={styles.mainCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successSubtitle}>
              We've sent a password reset link to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <Text style={styles.successNote}>
              Didn't receive the email? Check your spam folder or try again.
            </Text>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                setEmailSent(false);
                handleResetPassword();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.resendText}>Resend Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image Area */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' }}
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
            <Ionicons name="lock-closed" size={70} color={colors.primary} />
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
              <Text style={styles.title}>Forgot</Text>
              <Text style={styles.titleHighlight}>Password?</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you{'\n'}a link to reset your password.
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

              {/* Reset Password Button */}
              <TouchableOpacity
                style={[styles.resetButton, !isFormValid && styles.buttonDisabled]}
                onPress={handleResetPassword}
                activeOpacity={0.8}
                disabled={!isFormValid || isLoading}
              >
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              </TouchableOpacity>

              {/* Back to Login Link */}
              <View style={styles.backToLoginContainer}>
                <Text style={styles.rememberText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Login</Text>
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

      <LoadingOverlay visible={isLoading} message="Sending reset link..." />
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
  successContent: {
    flex: 1,
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
    marginBottom: spacing.lg,
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
    marginBottom: spacing.md,
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
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingVertical: isSmallDevice ? spacing.sm + 2 : spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    fontSize: isSmallDevice ? fontSize.md : fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  rememberText: {
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
  // Success Screen Styles
  successIcon: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  emailHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  successNote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backToLoginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 4,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backToLoginText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  resendButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  resendText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
