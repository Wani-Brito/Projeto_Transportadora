import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useFonts, Cinzel_400Regular } from "@expo-google-fonts/cinzel";
import { useRouter } from "expo-router";

export default function Financeiro() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
  });

  const pagamentos = [
    { id: 1, mes: "Janeiro", valor: "R$5.500,00", data: "05/01/2026" },
    { id: 2, mes: "Fevereiro", valor: "R$5.200,00", data: "06/02/2026" },
    { id: 3, mes: "Março", valor: "R$5.600,00", data: "05/03/2026" },
  ];

  if (!fontsLoaded) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>WAEKIUM</Text>

      <View style={styles.divider} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Financeiro</Text>
      </View>
      <Text style={styles.subtitle}>Folha de Pagamento</Text>

      {pagamentos.map((item) => (
        <View key={item.id} style={styles.card}>
          <View>
            <Text style={styles.mes}>{item.mes}</Text>
            <Text style={styles.data}>{item.data}</Text>
          </View>

          <Text style={styles.valor}>{item.valor}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 15,
  },

  logo: {
    fontSize: 40,
    textAlign: "center",
    fontFamily: "Cinzel_400Regular",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  divider: {
    height: 1,
    backgroundColor: "#ddd",
    width: "90%",
    alignSelf: "center",
  },

  backButton: {
    width: 45,
    height: 45,
    backgroundColor: "#efefef",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    fontSize: 26,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 14,
    color: "#555",
  },
 //aqui fica a lista
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    padding: 50,
  },

  mes: {
    fontWeight: "bold",
    fontSize: 20,
  },

  valor: {
    fontSize: 16,
    fontWeight: "bold",
  },

  data: {
    color: "#777",
    fontSize: 12,
  },
}); 