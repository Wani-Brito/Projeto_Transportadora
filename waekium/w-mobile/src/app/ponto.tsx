import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import * as Location from "expo-location"; // Importa funções de localização (GPS)
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useFonts, Cinzel_400Regular } from "@expo-google-fonts/cinzel";
import { Button } from "@/components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: number;
  nome: string;
};

export default function RegistrarPonto() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
  });

  const [user, setUser] = useState<User | null>(null); // Estado para armazenar os dados do usuário
  const [endereco, setEndereco] = useState("Carregando"); // Estado para armazenar o endereço convertido do GPS
  const [agora, setAgora] = useState(new Date()); // Estado para armazenar a data e hora atual (relógio)

  const registrarPonto = async () => {
    if (!user) return; // Verifica se os dados do usuário estão carregados antes de tentar registrar o ponto

    try { //Envia dados para o backend
      const response = await fetch("http://192.168.0.49:5000/ponto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_user: user.id, // ID do usuário logado
          data_entr: agora.toISOString().split("T")[0], // pega a data de entrada 
          hora_entr: agora.toLocaleTimeString(), // pega a hora da entrada
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Ponto registrado com sucesso!");
      } else {
        alert("Erro ao registrar ponto: " + data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Erro ao conectar!");
    }
  };

  useEffect(() => {
    const carregarUsuario = async () => {
      const data = await AsyncStorage.getItem("user"); // Pega os dados do usuário armazenados localmente (se houver) para usar o ID no registro do ponto
      if (data) {
        setUser(JSON.parse(data)); // Converte os dados do usuário de volta para objeto e armazena no estado
      }
    };

    carregarUsuario(); // Chama a função para carregar os dados do usuário quando a tela for carregada
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync(); //Pega localização e transforma em endereço

      if (status !== "granted") {
        setEndereco("Permissão negada");
        return;
      }
// Pega coordenadas atuais
      let location = await Location.getCurrentPositionAsync({});
      console.log(location);
// Converte coordenadas em endereço
      let address = await Location.reverseGeocodeAsync(location.coords);

      if (address.length > 0) {
        const { city, street } = address[0];
        setEndereco(`${street}, ${city}`);
      }
    })();
  }, []);
// Atualiza o relógio a cada 1 segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setAgora(new Date());
    }, 1000);
// Limpa o intervalo quando sair da tela
    return () => clearInterval(interval);
  }, []);

  if (!fontsLoaded) {
    return <Text>Carregando..</Text>;
  }

    return (
    <ScrollView contentContainerStyle={style.container}>
        <Text style={style.texter}>WAEKIUM</Text>

        <View style={style.divider} />

        <Text style={style.text}>Olá, {user?.nome || "..."}!</Text>
        <Text style={style.textfunc}>Motorista</Text>

        <View style={style.buttonWrapper}>
        <Button label="Registrar ponto" onPress={registrarPonto} />
        </View>

        <View style={style.infoBox}>
        <Text style={style.infoText}>{agora.toLocaleTimeString()}</Text>
        <Text style={style.infoDate}>{agora.toLocaleDateString()}</Text>
        <Text style={style.infoAdd}>{endereco}</Text>
        </View>

        <View style={style.dividera} />

        <View style={style.grid}>
        <TouchableOpacity
            style={style.card}
            onPress={() => router.push("/agenda")}
        >
            <Text>Minha Agenda</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={style.card}
            onPress={() => router.push("/rota")}
        >
            <Text>Minha Rota</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={style.card}
            onPress={() => router.push("/financeiro")}
        >
            <Text>Financeiro</Text>
        </TouchableOpacity>
        </View>
    </ScrollView>
    );
}

const style = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    width: "90%",
    alignSelf: "center",
    marginVertical: 10,
  },
  dividera: {
    height: 1,
    backgroundColor: "#ccc",
    width: "90%",
    alignSelf: "center",
    marginVertical: 10,
    marginTop: 80,
  },
  texter: {
    fontSize: 40,
    textAlign: "center",
    fontFamily: "Cinzel_400Regular",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  container: {
    padding: 20,
    alignItems: "center",
    gap: 15,
    justifyContent: "center",
  },
  text: {
    fontSize: 26,
    alignSelf: "flex-start",
  },
  textfunc: {
    fontSize: 18,
    alignSelf: "flex-start",
    color: "#2b2b2b",
  },
  buttonWrapper: {
    width: "100%",
  },
  infoBox: {
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
    marginTop: 25,
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  card: {
    width: "32%",
    height: 120,
    backgroundColor: "#e5e5e5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 30,
    marginTop: 30,
  },
  infoText: {
    fontSize: 40,        // Tamanho da fonte
    fontWeight: "bold",  // Deixa em negrito
    color: "#000000",    // Cor do texto
    marginTop: 10,     // Espaço acima do horário
  },
  infoDate: {
    fontSize: 20,        
    fontWeight: "bold",  
    color: "#252525",    
    marginBottom: 2,     // Espaço entre uma linha e outra
    marginTop: -10,     // Ajusta a posição para ficar mais próxima do horário
  },
  infoAdd: {
    fontSize: 15,        
    color: "#252525",    
    marginBottom: 2,     // Espaço entre uma linha e outra
    marginTop: 10,     
  },
});