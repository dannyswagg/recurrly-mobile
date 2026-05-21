import { styled } from "nativewind";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ContentView = styled(View);

const subscriptions = () => {
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#fff9e3" }}
    >
      <ContentView className="p-5">
        <View>
          <Text>subscriptions</Text>
        </View>
      </ContentView>
    </SafeAreaView>
  );
};

export default subscriptions;
