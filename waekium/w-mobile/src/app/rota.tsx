import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from "react-native";
import { useRouter } from "expo-router";
import { useFonts, Cinzel_400Regular } from "@expo-google-fonts/cinzel";

export default function Rota() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
  });

  const abrirMapa = () => {
    const origem = encodeURIComponent("Indaiatuba, SP");
    const destino = encodeURIComponent("Campinas, SP");
 // Monta a URL do Google Maps com rota
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}`;

    Linking.openURL(url);
  };

  if (!fontsLoaded) return null;

  const rota = { //dados ficticios
    titulo: "Rota Indaiatuba → Campinas",
    origem: "Indaiatuba, SP",
    destino: "Campinas, SP",
    carga: "500 kg de Frutos do Mar",
    imagem: "mapa.png",
  };

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

        <Text style={styles.title}>Minha Rota</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{rota.titulo}</Text>

        <Image source={require("../../assets/images/mapa.png")} style={styles.map} />

        <View style={styles.cardContent}>
          <Text style={styles.info}>Carga: {rota.carga}</Text>
          <Text style={styles.info}>Origem: {rota.origem}</Text>
          <Text style={styles.info}>Destino: {rota.destino}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={abrirMapa}>
          <Text style={styles.buttonText}>Abrir Rota</Text>
        </TouchableOpacity>
      </View>
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
  card: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    gap: 10,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  map: {
    width: "100%",
    height: 320,
    borderRadius: 10,
  },
  cardContent: {
    gap: 12,
  },
  info: {
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