import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { posthog } from "@/lib/posthog";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FieldErrors = {
  email?: string;
  password?: string;
  general?: string;
};

function clerkMessage(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const errors = (err as { errors: Array<{ message: string }> }).errors;
    if (errors?.[0]?.message) return errors[0].message;
  }
  return "Something went wrong. Please try again.";
}

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const passwordRef = useRef<TextInput>(null);

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = "Enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    }
    return errs;
  }

  async function handleSignIn() {
    if (!isLoaded || loading) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email.trim().toLowerCase(),
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        posthog.identify(email.trim().toLowerCase(), {
          $set: { email: email.trim().toLowerCase() },
        });
        posthog.capture('user_signed_in', { method: 'email' });
        router.replace("/(tabs)");
      }
    } catch (err) {
      setErrors({ general: clerkMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !loading && email.trim().length > 0 && password.length > 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff9e3" }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 }}>

            {/* ── Brand ─────────────────────────────────────── */}
            <View style={{ alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 28 }}>
                {/* Logo mark — notched top-right corner */}
                <View
                  style={{
                    width: 56,
                    height: 56,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#ea7a53",
                    borderTopLeftRadius: 16,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    borderTopRightRadius: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontFamily: "sans-extrabold",
                      color: "#fff9e3",
                      lineHeight: 28,
                    }}
                  >
                    R
                  </Text>
                </View>

                {/* Wordmark */}
                <View>
                  <Text
                    style={{
                      fontSize: 28,
                      fontFamily: "sans-extrabold",
                      color: "#081126",
                      lineHeight: 32,
                    }}
                  >
                    Recurly
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "sans-semibold",
                      color: "rgba(0,0,0,0.45)",
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      marginTop: -2,
                    }}
                  >
                    Smart Billing
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Heading ───────────────────────────────────── */}
            <View style={{ alignItems: "center", marginTop: 16, marginBottom: 4 }}>
              <Text
                style={{
                  fontSize: 30,
                  fontFamily: "sans-bold",
                  color: "#081126",
                  textAlign: "center",
                }}
              >
                Welcome back
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "sans-medium",
                  color: "rgba(0,0,0,0.5)",
                  textAlign: "center",
                  marginTop: 8,
                  maxWidth: 300,
                  lineHeight: 22,
                }}
              >
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            {/* ── Card ──────────────────────────────────────── */}
            <View
              style={{
                marginTop: 32,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.08)",
                backgroundColor: "#fff8e7",
                padding: 20,
                gap: 16,
              }}
            >
              {/* Global error */}
              {errors.general ? (
                <View
                  style={{
                    borderRadius: 14,
                    backgroundColor: "rgba(220,38,38,0.08)",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "sans-medium",
                      color: "#dc2626",
                    }}
                  >
                    {errors.general}
                  </Text>
                </View>
              ) : null}

              {/* Email */}
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "sans-semibold",
                    color: "#081126",
                  }}
                >
                  Email
                </Text>
                <TextInput
                  style={{
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: errors.email ? "#dc2626" : "rgba(0,0,0,0.1)",
                    backgroundColor: "#fff9e3",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 15,
                    fontFamily: "sans-medium",
                    color: "#081126",
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(8,17,38,0.35)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                  }}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
                {errors.email ? (
                  <Text style={{ fontSize: 11, fontFamily: "sans-medium", color: "#dc2626" }}>
                    {errors.email}
                  </Text>
                ) : null}
              </View>

              {/* Password */}
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "sans-semibold",
                    color: "#081126",
                  }}
                >
                  Password
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: errors.password ? "#dc2626" : "rgba(0,0,0,0.1)",
                    backgroundColor: "#fff9e3",
                    paddingHorizontal: 16,
                  }}
                >
                  <TextInput
                    ref={passwordRef}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      fontSize: 15,
                      fontFamily: "sans-medium",
                      color: "#081126",
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(8,17,38,0.35)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="done"
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      if (errors.password)
                        setErrors((e) => ({ ...e, password: undefined }));
                    }}
                    onSubmitEditing={handleSignIn}
                  />
                  <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "sans-semibold",
                        color: "rgba(0,0,0,0.4)",
                        marginLeft: 8,
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
                {errors.password ? (
                  <Text style={{ fontSize: 11, fontFamily: "sans-medium", color: "#dc2626" }}>
                    {errors.password}
                  </Text>
                ) : null}
              </View>

              {/* Forgot password — non-interactive until reset flow is implemented */}
              <Text
                style={{
                  alignSelf: "flex-end",
                  fontSize: 13,
                  fontFamily: "sans-semibold",
                  color: "#ea7a53",
                }}
              >
                Forgot password?
              </Text>

              {/* Sign In button */}
              <Pressable
                onPress={handleSignIn}
                disabled={!canSubmit}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 16,
                  backgroundColor: canSubmit ? "#ea7a53" : "rgba(234,122,83,0.45)",
                  paddingVertical: 16,
                  marginTop: 4,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "sans-bold",
                      color: "#fff",
                    }}
                  >
                    Sign in
                  </Text>
                )}
              </Pressable>

              {/* Sign up link */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "sans-medium",
                    color: "rgba(0,0,0,0.5)",
                  }}
                >
                  New to Recurly?
                </Text>
                <Link href="/(auth)/sign-up" asChild>
                  <Pressable hitSlop={4}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "sans-bold",
                        color: "#ea7a53",
                      }}
                    >
                      Create an account
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
