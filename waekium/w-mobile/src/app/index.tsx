import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useFonts, Cinzel_400Regular } from "@expo-google-fonts/cinzel";
import { useState } from "react"; //hook para gerenciar estado (dados que mudam)
import { useRouter } from "expo-router"; //hook de navegação entre as tela
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Armazenamento local do app (tipo um "banco" no celular)

export default function Index() {
    
    const router = useRouter();
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");

    const API_URL = "http://192.168.0.49:5000"; // ou seu IP local (url da api do back end)

    //funcao que é chamada ao clicar em entrar
    const fazerLogin = async () => {
        try {
          const response = await fetch(`${API_URL}/login`, { //faz requisiçao pro backend
            method: "POST", // tipo da requisição
            headers: { "Content-Type": "application/json"  //define que é json
        },
            body: JSON.stringify({ cpf, senha }) //envia cpf e senha
        });
          const data = await response.json();

          if (data.success) {
          await AsyncStorage.setItem("user", JSON.stringify(data.user));

            router.push("/ponto");
          } else {
            alert("CPF ou senha inválidos");
          }

        } catch (error) {
            console.log("ERRO:", error);
            alert("Erro ao conectar com o servidor");
        }
      };

    const [fontsLoaded] = useFonts({
        Cinzel_400Regular,
    });

    if (!fontsLoaded) {
        return <Text>Carregando...</Text>;
    }

    return (
        <ScrollView contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
        }}>
            <View style = {style.container}>
                <Text style = {style.texter}> WAEKIUM </Text>
                <Text style = {style.title}> Entrar </Text>
                <Text style = {style.subtitle}> Acesse sua conta com seu CPF e senha. </Text>
                <View style = {style.form}>
                    <Input placeholder = "Digite o seu CPF" keyboardType = "numeric" value={cpf} onChangeText={setCpf} />
                    <Input placeholder = "Digite sua senha" secureTextEntry value={senha} onChangeText={setSenha} />
                    <Button label ="Entrar" onPress={fazerLogin} />
                </View>
            </View>
        </ScrollView>
    );
}

const style = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FDFDFD",
      padding: 50,
      justifyContent: "center",
      alignContent: "center"
    },
    texter: {
      fontSize: 70,
      textAlign: "center",
      fontFamily: "Cinzel_400Regular",
      marginBottom: 15,
    },
    title: {
      fontSize: 32,
      fontWeight: 900,
    },
    subtitle: {
      fontSize: 14,
    },
    form: {
      marginTop: 24,
      gap: 12,
    },
    input: {
      width: "100%",
      height: 48,
      borderWidth: 1,
      borderColor: "#c9c9c9",
      borderRadius: 35,
      fontSize: 14,
      paddingLeft: 12,
      color: "#000000",
  }
})
