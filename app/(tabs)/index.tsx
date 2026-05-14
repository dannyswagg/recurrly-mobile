import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ContentView = styled(View);

export default function App() {
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#fff9e3" }}
    >
      <ContentView className="flex-1 p-5">
        <Text className="text-xl font-bold text-success">
          Welcome to Nativewind! This is my not my first app
        </Text>
        <Text>Yoooo!!!!</Text>
        <Text className="text-5xl">Yoooo!!!!</Text>
        <Link
          href="/onboarding"
          className="mt-4 rounded bg-primary text-white p-4"
        >
          Get On Board
        </Link>

        <Link
          href="/(auth)/sign-in"
          className="mt-4 rounded-md bg-primary text-white p-4"
        >
          Login Here
        </Link>
        <Link
          href="/(auth)/sign-up"
          className="mt-4 rounded-md bg-primary text-white p-4"
        >
          Sign Up Here
        </Link>
        <Link
          className="mt-4 rounded-md bg-primary text-white p-4"
          href="/subscriptions/spotify"
        >
          Spotify Subscription
        </Link>
        <Link
          className="mt-4 rounded-md bg-primary text-white p-4"
          href={{
            pathname: "/subscriptions/[id]",
            params: { id: "claude" },
          }}
        >
          Claude Max Subscription
        </Link>
      </ContentView>
    </SafeAreaView>
  );
}
