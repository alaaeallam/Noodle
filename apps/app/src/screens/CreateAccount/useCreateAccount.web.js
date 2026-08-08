// useCreateAccount.web.js

import { useEffect, useState, useContext } from 'react';
import { StatusBar } from 'react-native';
import useEnvVars from '../../../environment'; // Adjust path if necessary
import gql from 'graphql-tag';
import { login } from '../../apollo/mutations'; // Adjust path if necessary
import ThemeContext from '../../ui/ThemeContext/ThemeContext'; // Adjust path if necessary
import { theme } from '../../utils/themeColors'; // Adjust path if necessary
import { useMutation } from '@apollo/client';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'; // Adjust path if necessary
import analytics from '../../utils/analytics'; // Adjust path if necessary
import AuthContext from '../../context/Auth'; // Adjust path if necessary
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google'; // has a web-compatible build, same provider used on iOS
WebBrowser.maybeCompleteAuthSession();

const LOGIN = gql`
  ${login}
`;

// Web build for browser-based testing only. expo-apple-authentication and
// @react-native-google-signin/google-signin have no web target (native-only
// modules), and expo-notifications' push-token flow has no web target either
// — so Apple sign-in is always disabled here and no push token is ever
// requested, mirroring what the native files already do when unsupported.
export const useCreateAccount = () => {
  const Analytics = analytics();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [mutate] = useMutation(LOGIN, { onCompleted, onError });
  const [enableApple] = useState(false);
  const [loginButton, loginButtonSetter] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setTokenAsync } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);
  const [googleUser, setGoogleUser] = useState(null);
  const currentTheme = { isRTL: i18n.dir() === 'rtl', ...theme[themeContext.ThemeValue] };

  const {
    IOS_CLIENT_ID_GOOGLE,
    ANDROID_CLIENT_ID_GOOGLE,
    EXPO_CLIENT_ID,
    TERMS_AND_CONDITIONS,
    PRIVACY_POLICY
  } = useEnvVars();

  // Google Auth Request (web uses the same expo-auth-session provider as iOS)
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '650001300965-9ochl634tuvv6iguei6dl57jkmfto6r9.apps.googleusercontent.com', // Web client ID for Expo
    androidClientId: '650001300965-ii3nafver2uiu4qat9gbde9rkmhmvj0j.apps.googleusercontent.com',
    iosClientId: '650001300965-dkji7jutv8gc5m4n7cdg3nft87sauhn7.apps.googleusercontent.com',
    scopes: ['profile', 'email', 'openid'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetchUserInfo(authentication.accessToken);
    } else if (response?.type === 'error') {
      console.error('Authentication error:', response.error);
      FlashMessage({ message: `Google sign-in failed: ${response.error?.message || 'Unknown error'}` });
      setLoading(false);
      loginButtonSetter(null);
    } else if (response?.type === 'cancel') {
      FlashMessage({ message: 'Google sign-in cancelled.' });
      setLoading(false);
      loginButtonSetter(null);
    }
  }, [response]);

  const fetchUserInfo = async (accessToken) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = await res.json();

      const userData = {
        phone: '',
        email: user.email,
        password: '',
        name: user.name,
        picture: user.picture || '',
        type: 'google'
      };

      setGoogleUser(userData.name);
      await mutateLogin(userData);
    } catch (error) {
      console.error('❌ Google fetch user info error:', error);
      FlashMessage({ message: 'Failed to retrieve Google user info.' });
      setLoading(false);
      loginButtonSetter(null);
    }
  };

  const signIn = async () => {
    try {
      loginButtonSetter('Google');
      setLoading(true);

      if (!request) {
        console.error('Google authentication request is not ready.');
        FlashMessage({ message: 'Google sign-in is not ready. Please try again.' });
        setLoading(false);
        loginButtonSetter(null);
        return;
      }

      await promptAsync();
    } catch (e) {
      console.error('Error during sign-in prompt: ' + e.message, e);
      FlashMessage({ message: 'Google sign-in failed unexpectedly.' });
      setLoading(false);
      loginButtonSetter(null);
    }
  };

  // --- Common Navigation Functions ---
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToPhone = () => {
    navigation.navigate('PhoneNumber', {
      name: googleUser,
      phone: ''
    });
  };

  const navigateToMain = () => {
    navigation.navigate({
      name: 'Main',
      merge: true
    });
  };

  // --- Common Login Mutation Function (no push-token flow on web) ---
  async function mutateLogin(user) {
    try {
      mutate({
        variables: {
          ...user,
          notificationToken: null
        }
      });
    } catch (error) {
      console.error('🔐 [Login Debug] ❌ Error in mutateLogin:', error);
      setLoading(false);
      loginButtonSetter(null);
    }
  }

  // --- Common Login Success Handler ---
  async function onCompleted(data) {
    if (data.login.isActive === false) {
      FlashMessage({ message: t('accountDeactivated') });
      setLoading(false);
      loginButtonSetter(null);
      return;
    }

    try {
      setTokenAsync(data.login.token);
      FlashMessage({ message: 'Successfully logged in' });

      if (data?.login?.phone === '') {
        navigateToPhone();
      } else {
        navigateToMain();
      }
    } catch (error) {
      console.error('❌ [Login Debug] Error in onCompleted:', error);
    } finally {
      setLoading(false);
      loginButtonSetter(null);
    }
  }

  // --- Common Login Error Handler ---
  function onError(error) {
    console.error('❌ [Login Debug] Login mutation error occurred');
    console.error('❌ [Login Debug] Error message:', error.message);
    console.error('❌ [Login Debug] Full error object:', error);
    console.error('❌ [Login Debug] GraphQL errors:', error.graphQLErrors);
    console.error('❌ [Login Debug] Network error:', error.networkError);

    FlashMessage({
      message: error.message || 'Login failed. Please try again.'
    });

    setLoading(false);
    loginButtonSetter(null);
  }

  // --- Common Focus Effect for Status Bar ---
  useFocusEffect(() => {
    StatusBar.setBarStyle(
      themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content'
    );
  });

  // --- Common Link Handlers ---
  const openTerms = () => {
    Linking.openURL(TERMS_AND_CONDITIONS);
  };

  const openPrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY);
  };

  return {
    enableApple,
    loginButton,
    loginButtonSetter,
    loading,
    setLoading,
    themeContext,
    mutateLogin,
    currentTheme,
    navigateToLogin,
    navigateToRegister,
    openTerms,
    openPrivacyPolicy,
    navigateToMain,
    navigation,
    signIn,
  };
};
