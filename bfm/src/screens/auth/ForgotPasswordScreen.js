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
import { forgotPassword, verifyPasswordResetOtp, resetPasswordWithOtp } from '../../api/services/authService';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 6 characters, must contain letters and numbers)
const isValidPassword = (password) => {
  if (password.length < 6) {
    return false;
  }
  // Check if password contains at least one letter
  const hasLetter = /[a-zA-Z]/.test(password);
  // Check if password contains at least one number
  const hasNumber = /[0-9]/.test(password);
  // Must have both letters and numbers
  return hasLetter && hasNumber;
};

const ForgotPasswordScreen = ({ navigation }) => {
  // Step management: 1 = Email, 2 = OTP, 3 = New Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // Validate email step
  const validateEmail = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate OTP step
  const validateOtp = () => {
    const newErrors = {};
    if (!otp) {
      newErrors.otp = 'OTP is required';
    } else if (otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password step
  const validatePassword = () => {
    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (!isValidPassword(newPassword)) {
      newErrors.newPassword = 'Password must contain both letters and numbers';
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
    if (step === 1) validateEmail();
    else if (step === 2) validateOtp();
    else if (step === 3) validatePassword();
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async () => {
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setOtpSent(true);
        setStep(2);
        Alert.alert(
          'OTP Sent',
          `A 6-digit OTP has been sent to:\n\n${email}\n\nPlease check your inbox and enter the code below.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!validateOtp()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyPasswordResetOtp(email, otp);
      
      if (result.success) {
        setOtpVerified(true);
        setStep(3);
        Alert.alert('OTP Verified', 'You can now set your new password.', [{ text: 'OK' }]);
      } else {
        Alert.alert('Invalid OTP', result.error || 'The OTP you entered is incorrect. Please try again.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPasswordWithOtp(email, otp, newPassword);
      
      if (result.success) {
        // Clear loading first
        setIsLoading(false);
        
        // Show success state
        setPasswordResetSuccess(true);
        
        // Auto-navigate to login after 4 seconds (gives time to see success message)
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }, 4000);
      } else {
        Alert.alert('Error', result.error || 'Failed to reset password. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        Alert.alert('OTP Resent', 'A new OTP has been sent to your email.');
        setOtp(''); // Clear current OTP
      } else {
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
      <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
      <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
      <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
      <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
    </View>
  );

  const renderStepContent = () => {
    // Step 1: Enter Email
    if (step === 1) {
      return (
        <>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Forgot</Text>
            <Text style={styles.titleHighlight}>Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you{'\n'}a verification code to reset your password.
            </Text>
          </View>

          <View style={styles.formContainer}>
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

            <TouchableOpacity
              style={[styles.primaryButton, (!email || !isValidEmail(email)) && styles.buttonDisabled]}
              onPress={handleSendOtp}
              activeOpacity={0.8}
              disabled={!email || !isValidEmail(email) || isLoading}
            >
              <Text style={styles.primaryButtonText}>Send Verification Code</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    // Step 2: Enter OTP
    if (step === 2) {
      return (
        <>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Enter</Text>
            <Text style={styles.titleHighlight}>Verification Code</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
              {'\n\n'}Please enter it below.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <View style={[
                styles.inputWrapper,
                touched.otp && errors.otp && styles.inputError
              ]}>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="000000"
                  placeholderTextColor={colors.textMuted}
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  onBlur={() => handleBlur('otp')}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>
              {touched.otp && errors.otp && (
                <Text style={styles.errorText}>{errors.otp}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, (!otp || otp.length !== 6) && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              activeOpacity={0.8}
              disabled={!otp || otp.length !== 6 || isLoading}
            >
              <Text style={styles.primaryButtonText}>Verify Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOtp}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    // Step 3: Set New Password
    if (step === 3) {
      return (
        <>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Set New</Text>
            <Text style={styles.titleHighlight}>Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below.{'\n'}Must be at least 6 characters with both letters and numbers.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={[
                styles.inputWrapper,
                touched.newPassword && errors.newPassword && styles.inputError
              ]}>
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

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[
                styles.inputWrapper,
                touched.confirmPassword && errors.confirmPassword && styles.inputError
              ]}>
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

            <TouchableOpacity
              style={[styles.primaryButton, (
                !newPassword ||
                !confirmPassword ||
                !isValidPassword(newPassword) ||
                newPassword !== confirmPassword
              ) && styles.buttonDisabled]}
              onPress={handleResetPassword}
              activeOpacity={0.8}
              disabled={!newPassword || !confirmPassword || !isValidPassword(newPassword) || newPassword !== confirmPassword || isLoading}
            >
              <Text style={styles.primaryButtonText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }
  };

  // Success screen after password reset
  if (passwordResetSuccess) {
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
            <Text style={styles.successTitle}>Password Reset Successful! ✅</Text>
            <Text style={styles.successSubtitle}>
              Your password has been reset successfully.{'\n\n'}You can now login with your new password.
              {'\n\n'}Redirecting to login screen...
            </Text>
          </View>
        </View>
      </View>
    );
  }

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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  navigation.goBack();
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <BuzzBreachLogo size={22} />
              <Text style={styles.logoText}>BUZZBREACH</Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.spacer} />

          <View style={styles.mainCard}>
            {renderStepIndicator()}
            {renderStepContent()}

            <View style={styles.backToLoginContainer}>
              <Text style={styles.rememberText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomIndicator}>
            <View style={styles.indicator} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message={
        step === 1 ? "Sending verification code..." :
        step === 2 ? "Verifying code..." :
        "Resetting password..."
      } />
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
    marginBottom: spacing.xl,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
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
  emailHighlight: {
    color: colors.primary,
    fontWeight: '600',
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
  otpInput: {
    textAlign: 'center',
    fontSize: fontSize.xl,
    letterSpacing: 8,
    fontWeight: '600',
  },
  eyeButton: {
    padding: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  primaryButton: {
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
  primaryButtonText: {
    fontSize: isSmallDevice ? fontSize.md : fontSize.lg,
    fontWeight: '600',
    color: colors.white,
  },
  resendButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resendText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
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
  successContent: {
    flex: 1,
    width: '100%',
  },
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
});

export default ForgotPasswordScreen;
