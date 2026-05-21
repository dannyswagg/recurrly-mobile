import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ContentView = styled(View);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#fff9e3" }}
    >
      <ContentView className="p-5">
        <FlatList
          ListHeaderComponent={() => (
            <>
              <View className="mb-2.5 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Image
                    source={images.avatar}
                    className="size-12 rounded-full"
                    style={{ width: 48, height: 48 }}
                  />
                  <Text className="ml-4 text-2xl font-sans-bold text-primary">
                    {HOME_USER.name}
                  </Text>
                </View>
                <Image
                  source={icons.add}
                  className="w-12"
                  style={{ width: 40, height: 40 }}
                />
              </View>
              <View className="my-2.5 min-h-50 justify-between gap-5 rounded-bl-4xl rounded-tr-4xl bg-accent p-6">
                <Text className="text-xl font-sans-semibold text-white/80">
                  Balance
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-4xl font-sans-extrabold text-white">
                    {formatCurrency(HOME_BALANCE.amount)}
                  </Text>
                  <Text className="text-xl font-sans-medium text-white">
                    {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                  </Text>
                </View>
              </View>
              <View className="mb-5">
                <ListHeading title="Upcoming" />
                <FlatList
                  horizontal
                  data={UPCOMING_SUBSCRIPTIONS}
                  renderItem={({ item }) => (
                    <UpcomingSubscriptionCard {...item} />
                  )}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text className="py-4 text-sm font-sans-medium text-black/60">
                      No upcoming renewals yet.
                    </Text>
                  }
                />
              </View>
              <ListHeading title="All Subscriptions" />
            </>
          )}
          data={HOME_SUBSCRIPTIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() =>
                setExpandedSubscriptionId((currentId) =>
                  currentId === item.id ? "null" : item.id,
                )
              }
            />
          )}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="py-4 text-sm font-sans-medium text-black/60">
              No subscriptions yet.
            </Text>
          }
          contentContainerClassName="pb-30"
        />
      </ContentView>
    </SafeAreaView>
  );
}
