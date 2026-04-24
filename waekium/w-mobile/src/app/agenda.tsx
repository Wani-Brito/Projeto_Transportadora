import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useFonts, Cinzel_400Regular } from "@expo-google-fonts/cinzel";
import { useRouter } from "expo-router";

export default function Agenda() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
  });

  const agenda = [
    { id: 1, hora: "08:00", titulo: "Checklist Veículo" },
    { id: 2, hora: "10:15", titulo: "Reunião com Supervisor" },
    { id: 3, hora: "13:30", titulo: "Entrega de Carga" },
  ];

  if (!fontsLoaded) {
    return null;
  }

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

        <Text style={styles.title}>Minha Agenda</Text>
      </View>

      <View style={styles.timeline}>
        {agenda.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.timelineLeft}>
              <View style={styles.dot} />
              <View style={styles.line} />
            </View>

            <View style={styles.info}>
              <Text style={styles.hora}>{item.hora}</Text>
              <Text style={styles.titulo}>{item.titulo}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/rota")}
      >
        <Text style={styles.cardTitle}>Ver Minha Rota</Text>


        <View style={styles.cardContent}>
        <View style={styles.divider} />
          <Text style={styles.cardText}>Origem: São Paulo, SP</Text>
          <Text style={styles.cardText}>Destino: Campinas, SP</Text>
          <Text style={styles.cardText}>Carga: 500kg</Text>
        </View>

        <View style={styles.button}>
          <Text style={styles.buttonText}>Detalhes</Text>
        </View>
      </TouchableOpacity>
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
  timeline: {
    marginTop: 24,
    gap: 20,
  },
  item: {
    flexDirection: "row",
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 10,
  },
  dot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: "#999",
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: "#ccc",
    marginTop: 20,
  },
  info: {
    flexDirection: "row",
    gap: 10,
  },
  hora: {
    fontWeight: "bold",
  },
  titulo: {
    color: "#666",
  },
  card: {
    marginTop: 220,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 19,
    gap: 10,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  cardContent: {
    gap: 12,
    marginTop: -10,
  },
  cardText: {
    color: "#555",
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
  },
});