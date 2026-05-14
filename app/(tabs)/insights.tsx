import { styled } from "nativewind";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ContentView = styled(View);

const insights = () => {
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#fff9e3" }}
    >
      <ContentView className="flex-1 p-5">
        <Text>insights</Text>
      </ContentView>
    </SafeAreaView>
  );
};

export default insights;
