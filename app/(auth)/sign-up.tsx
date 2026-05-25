import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
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

type Step = "register" | "verify";

type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
};

type VerifyErrors = {
  code?: string;
  general?: string;
};

function clerkMessage(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const errors = (err as { errors: Array<{ message: string }> }).errors;
    if (errors?.[0]?.message) return errors[0].message;
  }
  return "Something went wrong. Please try again.";
}

function passwordStrength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length < 8) return pw.length > 0 ? 1 : 0;
  let score = 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score as 0 | 1 | 2 | 3;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Strong"];
const STRENGTH_COLORS = ["", "#dc2626", "#f59e0b", "#16a34a"];

// ── Shared atoms ──────────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <View
      style={{
        borderRadius: 14,
        backgroundColor: "rgba(220,38,38,0.08)",
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Text style={{ fontSize: 13, fontFamily: "sans-medium", color: "#dc2626" }}>
        {message}
      </Text>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SignUp() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<Step>("register");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({});
  const [registerLoading, setRegisterLoading] = useState(false);

  const [code, setCode] = useState("");
  const [verifyErrors, setVerifyErrors] = useState<VerifyErrors>({});
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const strength = passwordStrength(password);

  // ── Register ─────────────────────────────────────────────────────────────

  function validateRegister(): RegisterErrors {
    const errs: RegisterErrors = {};
    if (!name.trim() || name.trim().length < 2) errs.name = "Enter your full name";
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = "Enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    return errs;
  }

  async function handleRegister() {
    if (!isLoaded || registerLoading) return;
    const errs = validateRegister();
    if (Object.keys(errs).length > 0) { setRegisterErrors(errs); return; }
    setRegisterErrors({});
    setRegisterLoading(true);
    try {
      const parts = name.trim().split(" ");
      await signUp!.create({
        firstName: parts[0],
        lastName: parts.slice(1).join(" ") || undefined,
        emailAddress: email.trim().toLowerCase(),
        password,
      });
      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      setRegisterErrors({ general: clerkMessage(err) });
    } finally {
      setRegisterLoading(false);
    }
  }

  // ── Verify ───────────────────────────────────────────────────────────────

  async function handleVerify() {
    if (!isLoaded || verifyLoading) return;
    const trimmedCode = code.trim();
    if (!trimmedCode || trimmedCode.length !== 6) {
      setVerifyErrors({ code: "Enter the 6-digit code from your email" });
      return;
    }
    setVerifyErrors({});
    setVerifyLoading(true);
    try {
      const result = await signUp!.attemptEmailAddressVerification({ code: trimmedCode });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err) {
      setVerifyErrors({ general: clerkMessage(err) });
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleResend() {
    if (!isLoaded || resendLoading || resendCooldown > 0) return;
    setResendLoading(true);
    try {
      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
      setCode("");
      setVerifyErrors({});
      let remaining = 30;
      setResendCooldown(remaining);
      const interval = setInterval(() => {
        remaining -= 1;
        setResendCooldown(remaining);
        if (remaining <= 0) clearInterval(interval);
      }, 1000);
    } catch (err) {
      setVerifyErrors({ general: clerkMessage(err) });
    } finally {
      setResendLoading(false);
    }
  }

  const canRegister =
    !registerLoading && name.trim().length >= 2 && email.trim().length > 0 && password.length >= 8;
  const canVerify = !verifyLoading && code.trim().length === 6;

  // ── Render ───────────────────────────────────────────────────────────────

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

            {/* Brand */}
            <View style={{ alignItems: "center", marginBottom: 28 }}>
              <LogoMark />
            </View>

            {step === "register" ? (
              <>
                {/* Heading */}
                <View style={{ alignItems: "center", marginBottom: 4 }}>
                  <Text
                    style={{
                      fontSize: 30,
                      fontFamily: "sans-bold",
                      color: "#081126",
                      textAlign: "center",
                    }}
                  >
                    Create your account
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
                    Track all your subscriptions in one place
                  </Text>
                </View>

                {/* Card */}
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
                  {registerErrors.general ? (
                    <ErrorBanner message={registerErrors.general} />
                  ) : null}

                  {/* Full name */}
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 13, fontFamily: "sans-semibold", color: "#081126" }}>
                      Full Name
                    </Text>
                    <TextInput
                      style={{
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: registerErrors.name ? "#dc2626" : "rgba(0,0,0,0.1)",
                        backgroundColor: "#fff9e3",
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        fontSize: 15,
                        fontFamily: "sans-medium",
                        color: "#081126",
                      }}
                      placeholder="Enter your full name"
                      placeholderTextColor="rgba(8,17,38,0.35)"
                      autoCapitalize="words"
                      autoCorrect={false}
                      autoComplete="name"
                      textContentType="name"
                      returnKeyType="next"
                      value={name}
                      onChangeText={(v) => {
                        setName(v);
                        if (registerErrors.name)
                          setRegisterErrors((e) => ({ ...e, name: undefined }));
                      }}
                      onSubmitEditing={() => emailRef.current?.focus()}
                    />
                    {registerErrors.name ? (
                      <Text style={{ fontSize: 11, fontFamily: "sans-medium", color: "#dc2626" }}>
                        {registerErrors.name}
                      </Text>
                    ) : null}
                  </View>

                  {/* Email */}
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 13, fontFamily: "sans-semibold", color: "#081126" }}>
                      Email
                    </Text>
                    <TextInput
                      ref={emailRef}
                      style={{
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: registerErrors.email ? "#dc2626" : "rgba(0,0,0,0.1)",
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
                        if (registerErrors.email)
                          setRegisterErrors((e) => ({ ...e, email: undefined }));
                      }}
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                    {registerErrors.email ? (
                      <Text style={{ fontSize: 11, fontFamily: "sans-medium", color: "#dc2626" }}>
                        {registerErrors.email}
                      </Text>
                    ) : null}
                  </View>

                  {/* Password */}
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 13, fontFamily: "sans-semibold", color: "#081126" }}>
                      Password
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: registerErrors.password ? "#dc2626" : "rgba(0,0,0,0.1)",
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
                        placeholder="Min. 8 characters"
                        placeholderTextColor="rgba(8,17,38,0.35)"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="new-password"
                        textContentType="newPassword"
                        returnKeyType="done"
                        value={password}
                        onChangeText={(v) => {
                          setPassword(v);
                          if (registerErrors.password)
                            setRegisterErrors((e) => ({ ...e, password: undefined }));
                        }}
                        onSubmitEditing={handleRegister}
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

                    {/* Strength meter */}
                    {password.length > 0 && (
                      <View style={{ gap: 4, marginTop: 2 }}>
                        <View style={{ flexDirection: "row", gap: 4 }}>
                          {[1, 2, 3].map((bar) => (
                            <View
                              key={bar}
                              style={{
                                flex: 1,
                                height: 3,
                                borderRadius: 99,
                                backgroundColor:
                                  strength >= bar
                                    ? STRENGTH_COLORS[strength]
                                    : "rgba(0,0,0,0.1)",
                              }}
                            />
                          ))}
                        </View>
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: "sans-medium",
                            color: STRENGTH_COLORS[strength],
                          }}
                        >
                          {STRENGTH_LABELS[strength]} password
                        </Text>
                      </View>
                    )}

                    {registerErrors.password ? (
                      <Text style={{ fontSize: 11, fontFamily: "sans-medium", color: "#dc2626" }}>
                        {registerErrors.password}
                      </Text>
                    ) : null}
                  </View>

                  {/* Create account button */}
                  <Pressable
                    onPress={handleRegister}
                    disabled={!canRegister}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 16,
                      backgroundColor: canRegister ? "#ea7a53" : "rgba(234,122,83,0.45)",
                      paddingVertical: 16,
                      marginTop: 4,
                    }}
                  >
                    {registerLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={{ fontSize: 16, fontFamily: "sans-bold", color: "#fff" }}>
                        Create account
                      </Text>
                    )}
                  </Pressable>

                  {/* Sign in link */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      marginTop: 4,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontFamily: "sans-medium", color: "rgba(0,0,0,0.5)" }}>
                      Already have an account?
                    </Text>
                    <Link href="/(auth)/sign-in" asChild>
                      <Pressable hitSlop={4}>
                        <Text style={{ fontSize: 13, fontFamily: "sans-bold", color: "#ea7a53" }}>
                          Sign in
                        </Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Heading */}
                <View style={{ alignItems: "center", marginBottom: 4 }}>
                  <Text
                    style={{
                      fontSize: 30,
                      fontFamily: "sans-bold",
                      color: "#081126",
                      textAlign: "center",
                    }}
                  >
                    Check your inbox
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
                    We sent a 6-digit code to{" "}
                    <Text style={{ fontFamily: "sans-bold", color: "#081126" }}>
                      {email.trim().toLowerCase()}
                    </Text>
                  </Text>
                </View>

                {/* Card */}
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
                  {verifyErrors.general ? (
                    <ErrorBanner message={verifyErrors.general} />
                  ) : null}

                  {/* Code input */}
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 13, fontFamily: "sans-semibold", color: "#081126" }}>
                      Verification Code
                    </Text>
                    <TextInput
                      style={{
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: verifyErrors.code ? "#dc2626" : "rgba(0,0,0,0.1)",
                        backgroundColor: "#fff9e3",
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        fontSize: 24,
                        fontFamily: "sans-bold",
                        color: "#081126",
                        textAlign: "center",
                        letterSpacing: 8,
                      }}
                      placeholder="000000"
                      placeholderTextColor="rgba(8,17,38,0.25)"
                      keyboardType="number-pad"
                      maxLength={6}
                      returnKeyType="done"
                      value={code}
                      onChangeText={(v) => {
                        setCode(v.replace(/\D/g, ""));
                        if (verifyErrors.code)
                          setVerifyErrors((e) => ({ ...e, code: undefined }));
                      }}
                      onSubmitEditing={handleVerify}
                    />
                    {verifyErrors.code ? (
                      <Text style={{ fontSize: 11, fontFamily: "sans-medium", color: "#dc2626" }}>
                        {verifyErrors.code}
                      </Text>
                    ) : null}
                  </View>

                  {/* Verify button */}
                  <Pressable
                    onPress={handleVerify}
                    disabled={!canVerify}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 16,
                      backgroundColor: canVerify ? "#ea7a53" : "rgba(234,122,83,0.45)",
                      paddingVertical: 16,
                      marginTop: 4,
                    }}
                  >
                    {verifyLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={{ fontSize: 16, fontFamily: "sans-bold", color: "#fff" }}>
                        Verify email
                      </Text>
                    )}
                  </Pressable>

                  {/* Resend */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      marginTop: 4,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontFamily: "sans-medium", color: "rgba(0,0,0,0.5)" }}>
                      Didn't receive it?
                    </Text>
                    <Pressable
                      onPress={handleResend}
                      disabled={resendLoading || resendCooldown > 0}
                      hitSlop={4}
                    >
                      {resendCooldown > 0 ? (
                        <Text style={{ fontSize: 13, fontFamily: "sans-medium", color: "rgba(0,0,0,0.4)" }}>
                          Resend in {resendCooldown}s
                        </Text>
                      ) : resendLoading ? (
                        <ActivityIndicator color="#ea7a53" size="small" style={{ marginLeft: 4 }} />
                      ) : (
                        <Text style={{ fontSize: 13, fontFamily: "sans-bold", color: "#ea7a53" }}>
                          Resend code
                        </Text>
                      )}
                    </Pressable>
                  </View>

                  {/* Back */}
                  <Pressable
                    onPress={() => { setStep("register"); setCode(""); setVerifyErrors({}); }}
                    style={{
                      alignItems: "center",
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: "rgba(234,122,83,0.3)",
                      backgroundColor: "rgba(234,122,83,0.08)",
                      paddingVertical: 12,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontFamily: "sans-semibold", color: "#ea7a53" }}>
                      Back to sign up
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
