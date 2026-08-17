// Core
import { Formik } from "formik";
import { useState } from "react";
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
import Icon from "react-native-vector-icons/FontAwesome6";
// Schemas
import { SignInSchema } from "@/lib/utils/schema";
// Hook
import useLogin from "@/lib/hooks/useLogin";
// Interface
import { useApptheme } from "@/lib/context/theme.context";
import { ILoginInitialValues } from "@/lib/utils/interfaces";
import { useTranslation } from "react-i18next";
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

const initialValues: ILoginInitialValues = {
  username: "",
  password: "",
};

const LoginScreen = () => {
  // States
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Hooks
  const { appTheme } = useApptheme();
  const { t } = useTranslation();
  const { onLogin } = useLogin();

  // Handlers
  const onLoginHandler = async (creds: ILoginInitialValues) => {
    try {
      await onLogin(creds.username, creds.password);
    } catch (err: unknown) {
      console.log(err);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center h-full w-full"
      style={{ backgroundColor: appTheme.themeBackground }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView
        style={{
          backgroundColor: appTheme.themeBackground,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          // contentContainerStyle={{ height: height * 1 }}
        >
          <Formik
            initialValues={initialValues}
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
                    style={{ color: "#6B6B6B" }}
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
                      <Icon
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
