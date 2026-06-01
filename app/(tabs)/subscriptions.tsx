import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { posthog } from "@/lib/posthog";
import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Subscriptions() {
  const { subscriptions } = useSubscriptions();
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.plan?.toLowerCase().includes(q),
    );
  }, [query, subscriptions]);

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#fff9e3" }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
        {/* Header */}
        <Text
          style={{
            fontSize: 24,
            fontFamily: "sans-bold",
            color: "#081126",
            marginBottom: 16,
          }}
        >
          Subscriptions
        </Text>

        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.1)",
            backgroundColor: "#fff8e7",
            paddingHorizontal: 14,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 16, color: "rgba(0,0,0,0.3)", marginRight: 8 }}>
            🔍
          </Text>
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 12,
              fontSize: 15,
              fontFamily: "sans-medium",
              color: "#081126",
            }}
            placeholder="Search by name or category…"
            placeholderTextColor="rgba(8,17,38,0.35)"
            value={query}
            onChangeText={(v) => {
              setQuery(v);
              setExpandedId(null);
              if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
              if (v.trim()) {
                searchDebounceRef.current = setTimeout(() => {
                  posthog.capture('subscription_searched', { query: v.trim() });
                }, 800);
              }
            }}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedId === item.id}
              onPress={() =>
                setExpandedId((cur) => (cur === item.id ? null : item.id))
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          extraData={expandedId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "sans-medium",
                  color: "rgba(0,0,0,0.4)",
                }}
              >
                {query.trim()
                  ? `No subscriptions match "${query.trim()}"`
                  : "You have no subscriptions yet."}
              </Text>
            </View>
          }
        />
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
