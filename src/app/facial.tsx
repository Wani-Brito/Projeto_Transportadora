import { useEffect, useRef, useState } from "react"; 
import { View, Text, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function FaceRecognitionScreen() {

  // permissões câmera
  const [permission, requestPermission] =
    useCameraPermissions();

  // referência câmera
  const cameraRef = useRef(null);

  // loading reconhecimento
  const [scanning, setScanning] = useState(false);

  // pede permissão
  useEffect(() => {
    requestPermission();
  }, []);

  // enquanto carrega permissão
  if (!permission) {
    return null;
  }

  // permissão negada
  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#e0e0e0",
        }}
      >
        <Text style={{ color: "black" }}>
          Permissão da câmera negada
        </Text>
      </View>
    );
  }

  // função reconhecimento
  async function handleRecognition() {

    setScanning(true);

    try {

      // futuramente:
      // tirar foto
      // enviar backend python
      // receber resposta

      console.log("Reconhecendo rosto...");

      setTimeout(() => {
        console.log("Rosto reconhecido");
        setScanning(false);
      }, 2000);

    } catch (error) {

      console.log(error);
      setScanning(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>

      {/* câmera */}
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="front"
      >

        {/* overlay */}
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            padding: 30,
          }}
        >

          {/* topo */}
          <View style={{ marginTop: 60 }}>

            <Text
              style={{
                color: "white",
                fontSize: 28,
                fontWeight: "700",
              }}
            >
              Reconhecimento Facial
            </Text>

            <Text
              style={{
                color: "#b3b3b3",
                marginTop: 8,
              }}
            >
              Posicione seu rosto na câmera
            </Text>
          </View>

          {/* círculo rosto */}
          <View
            style={{
              alignSelf: "center",
              width: 260,
              height: 260,
              borderRadius: 999,
              borderWidth: 4,
              borderColor: "white",
            }}
          />

          {/* botão */}
          <TouchableOpacity
            onPress={handleRecognition}
            disabled={scanning}
            style={{
              marginBottom: 40,
              backgroundColor: "white",
              paddingVertical: 18,
              borderRadius: 18,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              {scanning
                ? "Reconhecendo..."
                : "Iniciar reconhecimento"}
            </Text>
          </TouchableOpacity>

        </View>
      </CameraView>
    </View>
  );
}