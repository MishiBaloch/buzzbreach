import React, { useState, useEffect } from 'react';
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
import { resetPassword } from '../../api/services/authService';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

// Password validation (min 6 characters)
const isValidPassword = (password) => {
  return password.length >= 6;
};

const ResetPasswordScreen = ({ navigation, route }) => {
  // Get token and email from route params (from deep link or navigation)
  const tokenFromRoute = route?.params?.token;
  const emailFromRoute = route?.params?.email;

  const [email, setEmail] = useState(emailFromRoute || '');
  const [token, setToken] = useState(tokenFromRoute || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordReset, setPasswordReset] = useState(false);

  // Check if we have required params
  useEffect(() => {
    if (!token || !email) {
      Alert.alert(
        'Invalid Link',
        'This password reset link is invalid or has expired. Please request a new password reset.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ForgotPassword'),
          },
        ]
      );
    }
  }, [token, email, navigation]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (!isValidPassword(newPassword)) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    if (!token || !email) {
      Alert.alert('Error', 'Invalid reset link. Please request a new password reset.');
      navigation.navigate('ForgotPassword');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(email, token, newPassword);

      if (result.success) {
        setPasswordReset(true);
        Alert.alert(
          'Password Reset Successful',
          'Your password has been reset successfully. You can now login with your new password.',
          [
            {
              text: 'Go to Login',
              onPress: () => {
                // Navigate to login and clear navigation stack
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Reset Failed',
          result.error || 'Failed to reset password. The link may have expired. Please request a new password reset.',
          [
            {
              text: 'Request New Link',
              onPress: () => navigation.navigate('ForgotPassword'),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (err) {
      console.error('Reset password exception:', err);
      Alert.alert(
        'Error',
        'Something went wrong. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    newPassword &&
    confirmPassword &&
    isValidPassword(newPassword) &&
    newPassword === confirmPassword;

  // Success screen
  if (passwordReset) {
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
              <Ionicons name="checkmark-circle" size={70} color={colors.success} />
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.successContent}>
          <View style={styles.header}>
            <View style={styles.placeholder} />
            <View style={styles.logoContainer}>
              <BuzzBreachLogo size={22} />
              <Text style={styles.logoText}>BUZZBREACH</Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.spacer} />

          <View style={styles.mainCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Password Reset Successful!</Text>
            <Text style={styles.successSubtitle}>
              Your password has been reset successfully.{'\n\n'}You can now login with your new password.
            </Text>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Go to Login</Text>
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
              <BuzzBreachLogo size={22} />
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
              <Text style={styles.title}>Reset</Text>
              <Text style={styles.titleHighlight}>Password</Text>
              <Text style={styles.subtitle}>
                Enter your new password below.{'\n'}Make sure it's at least 6 characters long.
              </Text>
            </View>

            {/* Email Display (Read-only) */}
            {email && (
              <View style={styles.emailDisplayContainer}>
                <Text style={styles.emailDisplayLabel}>Email</Text>
                <View style={styles.emailDisplay}>
                  <Text style={styles.emailDisplayText}>{email}</Text>
                </View>
              </View>
            )}

            {/* Form */}
            <View style={styles.formContainer}>
              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    touched.newPassword && errors.newPassword && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    onBlur={() => handleBlur('newPassword')}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
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
                {touched.newPassword && errors.newPassword && (
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    touched.confirmPassword && errors.confirmPassword && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onBlur={() => handleBlur('confirmPassword')}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
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

              {/* Reset Password Button */}
              <TouchableOpacity
                style={[styles.resetButton, !isFormValid && styles.buttonDisabled]}
                onPress={handleResetPassword}
                activeOpacity={0.8}
                disabled={!isFormValid || isLoading}
              >
                <Text style={styles.resetButtonText}>Reset Password</Text>
              </TouchableOpacity>

              {/* Back to Login Link */}
              <View style={styles.backToLoginContainer}>
                <Text style={styles.rememberText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Login</Text>
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

      <LoadingOverlay visible={isLoading} message="Resetting password..." />
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
  emailDisplayContainer: {
    marginBottom: spacing.md,
  },
  emailDisplayLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emailDisplay: {
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailDisplayText: {
    fontSize: fontSize.md,
    color: colors.white,
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
  eyeButton: {
    padding: spacing.sm,
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
    marginTop: spacing.md,
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
    marginBottom: spacing.xl,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 4,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ResetPasswordScreen;
