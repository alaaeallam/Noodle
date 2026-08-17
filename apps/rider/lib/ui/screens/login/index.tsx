// Core
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

// React Native
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Components

// Icon
import { FontAwesome6 } from '@expo/vector-icons';


// Schemas
import { SignInSchema } from "@/lib/utils/schema";
import { useTranslation } from "react-i18next";

// Hooks
import useLogin from "@/lib/hooks/useLogin";

// Interface
import setupApollo from "@/lib/apollo";
import { useApptheme } from "@/lib/context/global/theme.context";
import { ILoginInitialValues } from "@/lib/utils/interfaces";
import { CustomContinueButton } from "../../useable-components";

// BTB brand mark reused from the drawer header — black square, Anton "BTB".
function BrandMark({ appTheme }: { appTheme: { black: string; white: string } }) {
  return (
    <View
      className="w-[64px] h-[64px] items-center justify-center"
      style={{ backgroundColor: appTheme.black }}
    >
      <Text style={{ color: appTheme.white, fontFamily: "Anton", fontSize: 22 }}>
        BTB
      </Text>
    </View>
  );
}

const initial: ILoginInitialValues = {
  username: "",
  password: "",
};

const LoginScreen = () => {
  // States
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [initialValues, setInitialValues] = useState(initial);

  // Hooks
  const { appTheme } = useApptheme();
  const client = setupApollo();
  const { t } = useTranslation();
  const { onLogin, creds, isLogging } = useLogin();
  const [loading, setLoading] = useState(false);

  // Handlers
  const onLoginHandler = async (creds: ILoginInitialValues) => {
    // TODO: Implement login logic
    try {
      setLoading(true);
      await onLogin(creds.username.toLowerCase(), creds.password);
    } catch (err: unknown) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onInit = () => {
    try {
      client
        ?.clearStore()
        .catch((err) => console.log("Apollo clearStore error:", err));

      if (!creds?.username) return;
      setInitialValues(creds);
    } catch (err) {
      console.log("error login", err);
    }
  };

  // Use Effect
  useEffect(() => {
    onInit();
  }, [creds]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{t("Loading...")}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ backgroundColor: appTheme.themeBackground }}
    >
      <SafeAreaView>
        <ScrollView
          showsVerticalScrollIndicator={false}
        // contentContainerStyle={{ height: height * 1 }}
        >
          <Formik
            initialValues={initialValues}
            enableReinitialize={true}
            validationSchema={SignInSchema}
            onSubmit={onLoginHandler}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors }) => {
              return (
                <View className="mt-24 px-6 items-center gap-y-3">
                  <BrandMark appTheme={appTheme} />

                  {/* Title */}
                  <Text
                    style={{
                      color: appTheme.fontMainColor,
                      fontFamily: "Anton",
                      fontSize: 26,
                      textTransform: "uppercase",
                      textAlign: "center",
                      lineHeight: 28,
                      marginTop: 8,
                    }}
                  >
                    {t("Enter Your Credentials to login")}
                  </Text>
                  <Text
                    className="text-center text-sm mb-4"
                    style={{ color: appTheme.fontSecondColor }}
                  >
                    {t("We'll check if you have an account")}
                  </Text>

                  {/* Email Input */}

                  <View
                    className="flex-row items-center w-full px-3.5"
                    style={{
                      backgroundColor: appTheme.white,
                      borderWidth: 2,
                      borderColor: appTheme.horizontalLine,
                    }}
                  >
                    <TextInput
                      className="flex-1 h-[52px]"
                      style={{ color: appTheme.fontMainColor, fontSize: 15 }}
                      placeholder={t("Email") ?? ""}
                      placeholderTextColor="#A6A6A6"
                      keyboardType="email-address"
                      inputMode="email"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                    />
                  </View>
                  {errors.username && (
                    <Text
                      style={{
                        color: appTheme.textErrorColor,
                        marginBottom: 8,
                        fontSize: 14,
                        alignSelf: "flex-start",
                      }}
                    >
                      {errors?.username}
                    </Text>
                  )}

                  {/* Password Input */}
                  <View
                    className="flex-row items-center w-full px-3.5"
                    style={{
                      backgroundColor: appTheme.white,
                      borderWidth: 2,
                      borderColor: appTheme.horizontalLine,
                    }}
                  >
                    <TextInput
                      className="flex-1 h-[52px]"
                      style={{ color: appTheme.fontMainColor, fontSize: 15 }}
                      placeholder={t("Password") ?? ""}
                      placeholderTextColor="#A6A6A6"
                      secureTextEntry={!passwordVisible}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                    />
                    <TouchableOpacity
                      onPress={() => setPasswordVisible(!passwordVisible)}
                      className="ml-2"
                    >
                      <FontAwesome6
                        name={passwordVisible ? "eye-slash" : "eye"}
                        size={14}
                        color={appTheme.fontMainColor}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text
                      style={{
                        color: appTheme.textErrorColor,
                        marginBottom: 8,
                        fontSize: 14,
                        alignSelf: "flex-start",
                      }}
                    >
                      {errors?.password}
                    </Text>
                  )}

                  {/* Login Button */}
                  <View className="w-full">
                    <CustomContinueButton
                      title={t("Login")}
                      onPress={() => handleSubmit()}
                    />
                  </View>
                </View>
              );
            }}
          </Formik>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
