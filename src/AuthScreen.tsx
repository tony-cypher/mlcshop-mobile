import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';
import { PasswordInput } from './components/PasswordInput';
import { useAppTheme } from './ThemeContext';
import { theme } from './theme';

interface AuthScreenProps {
  onSuccess: () => void;
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onClose }) => {
  const { colors, isDark } = useAppTheme();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters.');
        return;
      }
      if (password !== passwordConfirmation) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {onClose && (
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={24} color={colors.text2} />
            </TouchableOpacity>
          )}

          {/* Brand Header */}
          <View style={styles.header}>
            <View style={[styles.logoPill, { backgroundColor: colors.accent }]}>
              <Ionicons name="cart" size={22} color="#fff" />
            </View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>MLC Shop</Text>
            <Text style={[styles.subtitle, { color: colors.text2 }]}>
              {mode === 'signin'
                ? 'Sign in to access synchronized carts, orders & wishlist'
                : 'Create an account to sync your cart seamlessly across devices'}
            </Text>
          </View>

          {/* Tab Switcher */}
          <View style={[styles.tabContainer, { backgroundColor: isDark ? '#1a1d27' : '#f1f5f9' }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                mode === 'signin' && [styles.tabActive, { backgroundColor: colors.surface }],
              ]}
              onPress={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.text2 },
                  mode === 'signin' && { color: colors.accent, fontWeight: '700' },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                mode === 'register' && [styles.tabActive, { backgroundColor: colors.surface }],
              ]}
              onPress={() => {
                setMode('register');
                setErrorMessage(null);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.text2 },
                  mode === 'register' && { color: colors.accent, fontWeight: '700' },
                ]}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: isDark ? '#2a1517' : '#fef2f2', borderColor: isDark ? '#4d2327' : '#fecaca' },
              ]}
            >
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={[styles.errorBannerText, { color: colors.danger }]}>{errorMessage}</Text>
            </View>
          )}

          {/* Form Fields */}
          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="John Doe"
                placeholderTextColor={colors.text3}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="you@example.com"
              placeholderTextColor={colors.text3}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          {/* Password with Eye Icon */}
          <PasswordInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
          />

          {mode === 'register' && (
            <PasswordInput
              label="Confirm Password"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              placeholder="Re-type password"
            />
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: colors.accent },
              loading && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === 'signin' ? 'Sign In to Account' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Bottom Switch Note */}
          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => {
              setMode(mode === 'signin' ? 'register' : 'signin');
              setErrorMessage(null);
            }}
          >
            <Text style={[styles.switchPrompt, { color: colors.text2 }]}>
              {mode === 'signin'
                ? "Don't have an account yet?"
                : 'Already have an MLC account?'}
            </Text>
            <Text style={[styles.switchHighlight, { color: colors.accent }]}>
              {mode === 'signin' ? ' Register' : ' Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    padding: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 6,
  },
  logoPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: theme.radius.pill,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radius.pill,
  },
  tabActive: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorBannerText: {
    fontSize: 13,
    flex: 1,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  submitBtn: {
    borderRadius: theme.radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 4,
  },
  switchPrompt: {
    fontSize: 13,
  },
  switchHighlight: {
    fontSize: 13,
    fontWeight: '700',
  },
});
