import { icons } from "@/constants/icons";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#fcd5b8",
  Cloud: "#c8e6f8",
  Music: "#f8c8d4",
  Other: "#e0e0e0",
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (subscription: Subscription) => void;
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onAdd,
}: Props) {
  const { bottom } = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState<Category | null>(null);
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");

  function reset() {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory(null);
    setNameError("");
    setPriceError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function validate(): boolean {
    let valid = true;
    if (!name.trim()) {
      setNameError("Name is required");
      valid = false;
    } else {
      setNameError("");
    }
    const parsed = parseFloat(price);
    if (!price.trim() || isNaN(parsed) || parsed <= 0) {
      setPriceError("Enter a valid price greater than 0");
      valid = false;
    } else {
      setPriceError("");
    }
    return valid;
  }

  function handleSubmit() {
    if (!validate()) return;
    const now = dayjs();
    const selectedCategory = category ?? "Other";
    const renewal =
      frequency === "Monthly" ? now.add(1, "month") : now.add(1, "year");

    const subscription: Subscription = {
      id: `custom-${Date.now()}`,
      icon: icons.wallet,
      name: name.trim(),
      price: parseFloat(price),
      currency: "USD",
      billing: frequency,
      category: selectedCategory,
      status: "active",
      startDate: now.toISOString(),
      renewalDate: renewal.toISOString(),
      color: CATEGORY_COLORS[selectedCategory],
    };

    onAdd(subscription);
    reset();
    onClose();
  }

  const canSubmit =
    name.trim().length > 0 &&
    parseFloat(price) > 0 &&
    !isNaN(parseFloat(price));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1 }}>
        {/* Tappable dark backdrop — fills space above the sheet */}
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={handleClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Sheet — no maxHeight so it anchors flush to the screen bottom */}
          <View
            style={{
              backgroundColor: "#fff9e3",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(0,0,0,0.08)",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "sans-bold",
                  color: "#081126",
                }}
              >
                New Subscription
              </Text>
              <Pressable
                onPress={handleClose}
                hitSlop={8}
                style={{
                  width: 32,
                  height: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 16,
                  backgroundColor: "#f0e9cc",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "sans-bold",
                    color: "#081126",
                  }}
                >
                  ✕
                </Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: screenHeight * 0.65 }}
            >
              <View style={{ padding: 20, gap: 20 }}>
                {/* Name */}
                <View style={{ gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "sans-semibold",
                      color: "#081126",
                    }}
                  >
                    Name
                  </Text>
                  <TextInput
                    style={{
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: nameError ? "#dc2626" : "rgba(0,0,0,0.1)",
                      backgroundColor: "#fff8e7",
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 15,
                      fontFamily: "sans-medium",
                      color: "#081126",
                    }}
                    placeholder="e.g. Netflix"
                    placeholderTextColor="rgba(8,17,38,0.35)"
                    value={name}
                    onChangeText={(v) => {
                      setName(v);
                      if (nameError) setNameError("");
                    }}
                    returnKeyType="next"
                    autoCorrect={false}
                  />
                  {nameError ? (
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "sans-medium",
                        color: "#dc2626",
                      }}
                    >
                      {nameError}
                    </Text>
                  ) : null}
                </View>

                {/* Price */}
                <View style={{ gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "sans-semibold",
                      color: "#081126",
                    }}
                  >
                    Price (USD)
                  </Text>
                  <TextInput
                    style={{
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: priceError ? "#dc2626" : "rgba(0,0,0,0.1)",
                      backgroundColor: "#fff8e7",
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 15,
                      fontFamily: "sans-medium",
                      color: "#081126",
                    }}
                    placeholder="0.00"
                    placeholderTextColor="rgba(8,17,38,0.35)"
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={(v) => {
                      setPrice(v);
                      if (priceError) setPriceError("");
                    }}
                    returnKeyType="done"
                  />
                  {priceError ? (
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "sans-medium",
                        color: "#dc2626",
                      }}
                    >
                      {priceError}
                    </Text>
                  ) : null}
                </View>

                {/* Frequency */}
                <View style={{ gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "sans-semibold",
                      color: "#081126",
                    }}
                  >
                    Billing Frequency
                  </Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {(["Monthly", "Yearly"] as const).map((opt) => {
                      const active = frequency === opt;
                      return (
                        <Pressable
                          key={opt}
                          onPress={() => setFrequency(opt)}
                          style={{
                            flex: 1,
                            alignItems: "center",
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: active ? "#ea7a53" : "rgba(0,0,0,0.1)",
                            backgroundColor: active
                              ? "rgba(234,122,83,0.1)"
                              : "#fff8e7",
                            paddingVertical: 12,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: "sans-semibold",
                              color: active ? "#ea7a53" : "rgba(0,0,0,0.5)",
                            }}
                          >
                            {opt}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Category */}
                <View style={{ gap: 6 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "sans-semibold",
                      color: "#081126",
                    }}
                  >
                    Category
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {CATEGORIES.map((cat) => {
                      const active = category === cat;
                      return (
                        <Pressable
                          key={cat}
                          onPress={() => setCategory(cat)}
                          style={{
                            borderRadius: 100,
                            borderWidth: 1,
                            borderColor: active ? "#ea7a53" : "rgba(0,0,0,0.1)",
                            backgroundColor: active
                              ? "rgba(234,122,83,0.1)"
                              : "#fff8e7",
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: "sans-semibold",
                              color: active ? "#ea7a53" : "rgba(0,0,0,0.5)",
                            }}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Submit */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 16,
                    paddingVertical: 16,
                    marginTop: 4,
                    backgroundColor: canSubmit
                      ? "#ea7a53"
                      : "rgba(234,122,83,0.45)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "sans-bold",
                      color: "#fff",
                    }}
                  >
                    Add Subscription
                  </Text>
                </Pressable>

                <View style={{ height: 8 }} />
              </View>
            </ScrollView>

            {/* Fills safe-area / home-indicator zone with sheet background */}
            <View style={{ height: bottom }} />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
