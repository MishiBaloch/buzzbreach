import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, spacing, borderRadius } from '../../theme/colors';
import { markOnboardingComplete } from '../../utils/storage';
import { completeOnboarding as completeOnboardingAPI } from '../../api/services/authService';
import { setUser } from '../../store/slices/authSlice';
import BuzzBreachLogo from '../../components/common/BuzzBreachLogo';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

// Onboarding Questions Data with professional themed background images
const ONBOARDING_STEPS = [
  {
    id: 1,
    question: 'What Is Your Current Education Level?',
    subtitle: 'BuzzBreach will connect people that can\nhelp you in your journey.',
    options: [
      { id: 'high_school', label: 'High School' },
      { id: 'undergraduate', label: 'Undergraduate/College' },
      { id: 'graduate', label: 'Universities' },
      { id: 'other', label: 'Other' },
    ],
  },
  {
    id: 2,
    question: 'Which Field Are You Currently Studying Or Interested In?',
    subtitle: 'BuzzBreach will connect people that can\nhelp you in your journey.',
    options: [
      { id: 'engineering', label: 'Engineering' },
      { id: 'stem', label: 'IT/AI' },
      { id: 'medical', label: 'Medical' },
      { id: 'other', label: 'Other' },
    ],
  },
  {
    id: 3,
    question: 'How Do You Prefer Guidance?',
    subtitle: 'BuzzBreach will connect people that can\nhelp you in your journey.',
    options: [
      { id: 'articles', label: 'Articles' },
      { id: 'quizzes', label: 'Quizzes' },
      { id: 'mentorship', label: 'Mentorship' },
      { id: 'videos', label: 'Videos' },
    ],
  },
  {
    id: 4,
    question: 'Which Skills Do You Feel Strongest In?',
    subtitle: 'BuzzBreach will connect people that can\nhelp you in your journey.',
    options: [
      { id: 'public_speaking', label: 'Creativity' },
      { id: 'problem_solving', label: 'Problem Solving' },
      { id: 'research', label: 'Communication' },
      { id: 'others', label: 'Tech' },
    ],
  },
];

const OnboardingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  const currentQuestion = ONBOARDING_STEPS[currentStep];
  const totalSteps = ONBOARDING_STEPS.length;

  // Handle option selection
  const handleSelectOption = (optionId) => {
    setSelectedOption(optionId);
  };

  // Complete onboarding and navigate to main app
  const completeOnboarding = async (finalAnswers) => {
    try {
      // Save onboarding data to backend
      const result = await completeOnboardingAPI(finalAnswers);
      
      if (result.success) {
        // Mark onboarding as complete in local storage (for offline support)
        await markOnboardingComplete();
        
        // Update Redux store with the updated user object that has isOnboarded: true
        if (result.user) {
          dispatch(setUser(result.user));
        }
        
        console.log('Onboarding completed successfully:', {
          answers: finalAnswers,
          user: result.user,
          userOnboarded: result.user?.isOnboarded,
        });
        
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        // If backend save fails, still mark locally and navigate
        // This ensures user can continue even if there's a network issue
        console.warn('Backend onboarding save failed, but continuing:', result.error);
        await markOnboardingComplete();
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Even if there's an error, mark locally and allow user to continue
      // The backend can sync later if needed
      await markOnboardingComplete();
      
      Alert.alert(
        'Onboarding Complete', 
        'Your onboarding data has been saved. You can update it later in your profile.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            },
          },
        ]
      );
    }
  };

  // Handle continue
  const handleContinue = () => {
    if (!selectedOption) return;

    // Save answer
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: selectedOption,
    };
    setAnswers(newAnswers);

    if (currentStep < totalSteps - 1) {
      // Move to next step
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
    } else {
      // Onboarding complete
      completeOnboarding(newAnswers);
    }
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Restore previous answer if exists
      const prevQuestion = ONBOARDING_STEPS[currentStep - 1];
      setSelectedOption(answers[prevQuestion.id] || null);
    }
    // Don't allow going back on first step - onboarding is mandatory
  };


  // Get background image source - using direct require() calls
  const getImageSource = () => {
    if (currentQuestion.id === 1) return require('../../../assets/education.jpeg');
    if (currentQuestion.id === 2) return require('../../../assets/field.jpeg');
    if (currentQuestion.id === 3) return require('../../../assets/guidance.jpeg');
    if (currentQuestion.id === 4) return require('../../../assets/skills.jpeg');
    return require('../../../assets/education.jpeg');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image */}
      <ImageBackground
        source={getImageSource()}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
      >
        {/* Dark Overlay */}
        <LinearGradient
          colors={['rgba(13, 11, 30, 0.1)', 'rgba(13, 11, 30, 0.5)', 'rgba(13, 11, 30, 0.85)']}
          locations={[0, 0.62, 0.92]}
          style={styles.overlay}
        >
          {/* Header */}
          <View style={styles.header}>
            {currentStep > 0 ? (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
            <View style={styles.logoContainer}>
              <BuzzBreachLogo size={22} />
              <Text style={styles.logoText}>BUZZBREACH</Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          {/* Progress Dots */}
          <View style={styles.progressContainer}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>

          {/* Question Content */}
          <View style={styles.contentContainer}>
            <View style={styles.questionCard}>
              {/* Question Title */}
              <Text style={styles.question}>{currentQuestion.question}</Text>
              
              {/* Subtitle */}
              <Text style={styles.subtitle}>{currentQuestion.subtitle}</Text>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      selectedOption === option.id && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleSelectOption(option.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedOption === option.id && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !selectedOption && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={!selectedOption}
              >
                <Text style={styles.continueButtonText}>
                  {currentStep === totalSteps - 1 ? 'Finish' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Indicator */}
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
  // Match the mock: keep the photo visible at the top and gently biased upward.
  backgroundImageStyle: {
    transform: [{ scale: 1.1 }, { translateY: 14 }],
  },
  overlay: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: isSmallDevice ? spacing.sm : spacing.md,
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isSmallDevice ? spacing.md : spacing.lg,
    gap: spacing.xs,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  progressDotCompleted: {
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    width: '100%',
  },
  questionCard: {
    backgroundColor: 'rgba(26, 23, 52, 0.95)',
    borderRadius: borderRadius.xxl,
    padding: isSmallDevice ? spacing.md : spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
    width: '100%',
  },
  question: {
    fontSize: isSmallDevice ? fontSize.lg : fontSize.xl,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
    lineHeight: isSmallDevice ? 24 : 28,
  },
  subtitle: {
    fontSize: isSmallDevice ? fontSize.sm : fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  optionButton: {
    paddingVertical: isSmallDevice ? spacing.sm : spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: isSmallDevice ? fontSize.sm : fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: isSmallDevice ? spacing.sm + 2 : spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    width: '100%',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: isSmallDevice ? fontSize.md : fontSize.lg,
    fontWeight: '600',
    color: colors.white,
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

export default OnboardingScreen;
