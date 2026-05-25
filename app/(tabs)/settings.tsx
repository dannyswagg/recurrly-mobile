import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";

const ContentView = styled(View);

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const displayName = user?.firstName ?? user?.fullName ?? "there";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#fff9e3" }}
    >
      <ContentView className="flex-1 p-5">
        {/* Header */}
        <Text className="mb-6 text-2xl font-sans-bold text-primary">Settings</Text>

        {/* Profile card */}
        <View
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.08)",
            backgroundColor: "#fff8e7",
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
            style={{ width: 56, height: 56, borderRadius: 28 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 16, fontFamily: "sans-bold", color: "#081126" }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text
              style={{ fontSize: 13, fontFamily: "sans-medium", color: "rgba(0,0,0,0.45)", marginTop: 2 }}
              numberOfLines={1}
            >
              {email}
            </Text>
          </View>
        </View>

        {/* Sign out button */}
        <Pressable
          onPress={handleSignOut}
          disabled={loading}
          style={({ pressed }) => ({
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            paddingVertical: 16,
            backgroundColor: pressed || loading ? "rgba(234,122,83,0.45)" : "#ea7a53",
          })}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={{ fontSize: 16, fontFamily: "sans-bold", color: "#fff" }}>
              Sign out
            </Text>
          )}
        </Pressable>
      </ContentView>
    </SafeAreaView>
  );
}
