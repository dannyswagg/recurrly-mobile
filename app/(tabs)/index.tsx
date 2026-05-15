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
        <Text className="text-5xl font-sans-extrabold text-primary">Home</Text>
        <Text className="text-5xl font-bold text-primary">Home</Text>
        <Text>Yoooo!!!!</Text>
        <Text className="text-5xl">Yoooo!!!!</Text>
        <Link
          href="/onboarding"
          className="mt-4 font-sans-bold rounded bg-primary text-white p-4"
        >
          Get On Board
        </Link>

        <Link
          href="/(auth)/sign-in"
          className="mt-4 font-sans-bold rounded-md bg-primary text-white p-4"
        >
          Login Here
        </Link>
        <Link
          href="/(auth)/sign-up"
          className="mt-4 font-sans-bold rounded-md bg-primary text-white p-4"
        >
          Sign Up Here
        </Link>
      </ContentView>
    </SafeAreaView>
  );
}
