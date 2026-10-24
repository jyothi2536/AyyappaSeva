import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Icon, Page } from "../components/UI";
import { RegistrationTrail } from "../components/RegistrationTrail";
import { BASE_FEE, IRUMUDI_FEE, ITEMS, type ItemId } from "./MaladharanaScreen";
import type { RootStackParamList } from "../types";
import { colors } from "../theme";

// UI only — payment is not connected yet.

const BRAND = "#7A1426";
type IconName = React.ComponentProps<typeof Icon>["name"];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function MaladharanaReviewScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "MaladharanaReview">) {
  const { kind, contact, devotees, needItems, qty, total } = route.params;
  const isIrumudi = kind === "irumudi";
  const pay = (method: string) =>
    Alert.alert(
      "Payment coming soon",
      `${method} payment is not connected yet. Nothing has been charged or saved.`,
    );
  const address = [contact.address, contact.city, [contact.state, contact.zip].filter(Boolean).join(" ")]
    .filter((part) => part.trim())
    .join(", ");
  const chosenItems = ITEMS.filter((item) => (qty[item.id as ItemId] ?? 0) > 0);

  return (
    <Page>
      <RegistrationTrail kind={kind} step="review" navigation={navigation} />
      <Text style={s.intro}>Please check your details before paying.</Text>

      {/* Contact */}
      <Card icon="person-outline" title="Contact Details">
        <Row label="Name" value={contact.name} />
        <Row label="Phone" value={contact.phone} />
        <Row label="Email" value={contact.email} />
        <Row label="Address" value={address} last />
      </Card>

      {/* Devotees */}
      <Card
        mci={isIrumudi ? "bag-personal-outline" : "necklace"}
        title="Devotees"
        badge={`${devotees.length}`}
      >
        {devotees.map((d, i) => (
          <View key={i} style={[s.devotee, i < devotees.length - 1 && s.rowBorder]}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{d.name.charAt(0).toUpperCase() || "?"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.devoteeName}>{d.name}</Text>
              <View style={s.devoteeMeta}>
                <View style={s.chip}>
                  <Text style={s.chipText}>{d.type}</Text>
                </View>
                <Icon name="calendar-outline" size={14} color={colors.muted} />
                <Text style={s.metaText}>{formatDate(d.date)}</Text>
              </View>
            </View>
          </View>
        ))}
      </Card>

      {/* Order summary */}
      <Card icon="receipt-outline" title="Summary">
        {isIrumudi ? (
          <View style={[s.line, s.rowBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={s.lineTitle}>Irumudi sponsorship</Text>
              <Text style={s.lineSub}>
                {devotees.length} × ${IRUMUDI_FEE}
              </Text>
            </View>
            <Text style={s.lineAmount}>${IRUMUDI_FEE * devotees.length}</Text>
          </View>
        ) : needItems ? (
          chosenItems.length ? (
            chosenItems.map((item) => {
              const count = qty[item.id as ItemId] ?? 0;
              return (
                <View key={item.id} style={[s.line, s.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.lineTitle}>{item.label}</Text>
                    <Text style={s.lineSub}>
                      {count} × ${item.price}
                      {"note" in item ? `  ·  ${item.note}` : ""}
                    </Text>
                  </View>
                  <Text style={s.lineAmount}>${count * item.price}</Text>
                </View>
              );
            })
          ) : (
            <Text style={[s.lineSub, s.rowBorder, { paddingVertical: 10 }]}>
              No Mala items selected.
            </Text>
          )
        ) : (
          <View style={[s.line, s.rowBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={s.lineTitle}>Maladharana (no items)</Text>
              <Text style={s.lineSub}>
                {devotees.length} × ${BASE_FEE}
              </Text>
            </View>
            <Text style={s.lineAmount}>${BASE_FEE * devotees.length}</Text>
          </View>
        )}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>${total}</Text>
        </View>
      </Card>

      {/* Payment */}
      <Text style={s.payTitle}>Choose a payment method</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Pay with PayPal"
        onPress={() => pay("PayPal")}
        style={({ pressed }) => [s.payBtn, s.paypal, pressed && s.pressed]}
      >
        <Text style={s.paypalWord}>
          <Text style={{ color: "#003087" }}>Pay</Text>
          <Text style={{ color: "#009CDE" }}>Pal</Text>
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Pay with PayPal Credit"
        onPress={() => pay("PayPal Credit")}
        style={({ pressed }) => [s.payBtn, s.credit, pressed && s.pressed]}
      >
        <Text style={s.creditWord}>PayPal CREDIT</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Pay with debit or credit card"
        onPress={() => pay("Card")}
        style={({ pressed }) => [s.payBtn, s.card, pressed && s.pressed]}
      >
        <Icon name="card-outline" size={20} color="#fff" />
        <Text style={s.cardWord}>Debit or Credit Card</Text>
      </Pressable>
      <View style={s.secure}>
        <Icon name="lock-closed" size={12} color={colors.muted} />
        <Text style={s.powered}>
          Secure checkout · Powered by <Text style={s.poweredBrand}>PayPal</Text>
        </Text>
      </View>
    </Page>
  );
}

function Card({
  icon,
  mci,
  title,
  badge,
  children,
}: {
  icon?: IconName;
  mci?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.cardBox}>
      <View style={s.cardHead}>
        <View style={s.cardIcon}>
          {mci ? (
            <MaterialCommunityIcons name={mci} size={18} color={BRAND} />
          ) : (
            <Icon name={icon!} size={18} color={BRAND} />
          )}
        </View>
        <Text style={s.cardTitle}>{title}</Text>
        {badge ? (
          <View style={s.badge}>
            <Text style={s.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[s.row, !last && s.rowBorder]}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value.trim() || "—"}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  intro: { color: colors.muted, fontSize: 13, marginTop: -6, marginBottom: 14 },
  cardBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    marginBottom: 14,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.maroonSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { flex: 1, color: colors.text, fontSize: 16, fontWeight: "700" },
  badge: {
    minWidth: 24,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.maroonSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: BRAND, fontWeight: "800", fontSize: 12 },
  row: { flexDirection: "row", paddingVertical: 11, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowLabel: { width: 74, color: colors.muted, fontSize: 13 },
  rowValue: { flex: 1, color: colors.text, fontSize: 14, fontWeight: "600", textAlign: "right" },
  devotee: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  devoteeName: { color: colors.text, fontSize: 15, fontWeight: "700" },
  devoteeMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.raised,
    marginRight: 4,
  },
  chipText: { color: colors.text, fontSize: 11, fontWeight: "700" },
  metaText: { color: colors.muted, fontSize: 12 },
  line: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11 },
  lineTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
  lineSub: { color: colors.muted, fontSize: 12, marginTop: 3 },
  lineAmount: { color: colors.text, fontSize: 14, fontWeight: "700" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  totalLabel: { color: colors.text, fontSize: 16, fontWeight: "800" },
  totalValue: { color: BRAND, fontSize: 24, fontWeight: "900" },
  payTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 12,
  },
  payBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  pressed: { opacity: 0.8 },
  paypal: { backgroundColor: "#FFC439" },
  paypalWord: { fontSize: 20, fontWeight: "900", fontStyle: "italic" },
  credit: { backgroundColor: "#003087" },
  creditWord: { color: "#fff", fontSize: 18, fontWeight: "900", fontStyle: "italic" },
  card: { backgroundColor: "#2C2E2F" },
  cardWord: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secure: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  powered: { color: colors.muted, fontSize: 11 },
  poweredBrand: { color: "#003087", fontWeight: "900", fontStyle: "italic" },
});
