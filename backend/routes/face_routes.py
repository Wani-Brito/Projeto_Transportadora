from flask import Blueprint, request, jsonify
import os
import tempfile

from backend.database import get_db_connection
from backend.routes.ponto_routes import registrar_ponto

# ==================================================
# BLUEPRINT (TEM QUE SER O PRIMEIRO A SER CRIADO)
# ==================================================

face_bp = Blueprint("face", __name__)

# ==================================================
# CONFIGURAÇÃO DE PASTA
# ==================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PASTA_FOTOS = os.path.join(
    BASE_DIR,
    "..",
    "reconhecimento",
    "fotos"
)

# ==================================================
# IMPORT DO DEEPFACE (EVITA QUEBRAR O ARQUIVO)
# ==================================================

try:
    from deepface import DeepFace
    DEEPFACE_OK = True
except Exception as e:
    print("⚠️ DeepFace não carregou:", e)
    DEEPFACE_OK = False


# ==================================================
# FUNÇÃO DE VALIDAÇÃO FACIAL
# ==================================================

def validar_face(imagem_path):
    """
    Compara a imagem enviada com as fotos cadastradas
    """
    if not DEEPFACE_OK:
        return False

    try:
        resultado = DeepFace.find(
            img_path=imagem_path,
            db_path=PASTA_FOTOS,
            enforce_detection=False
        )

        # Se encontrou alguma correspondência
        if len(resultado) > 0 and len(resultado[0]) > 0:
            return True

        return False

    except Exception as e:
        print("Erro no DeepFace:", e)
        return False


# ==================================================
# ROTA DE VALIDAÇÃO + PONTO
# ==================================================

@face_bp.route("/validar-face", methods=["POST"])
def validar_e_bater_ponto():

    if 'image' not in request.files:
        return jsonify({
            "status": "erro",
            "mensagem": "Imagem não enviada."
        }), 400

    file = request.files['image']
    id_user = request.form.get("id_user")

    if not id_user:
        return jsonify({
            "status": "erro",
            "mensagem": "ID do usuário não enviado."
        }), 400

    # Salva imagem temporária
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
        file.save(temp.name)
        temp_path = temp.name

    # Validação facial
    validado = validar_face(temp_path)

    # Remove arquivo temporário
    os.remove(temp_path)

    if not validado:
        return jsonify({
            "status": "erro",
            "mensagem": "Rosto não reconhecido."
        }), 401

    # Registra ponto
    resultado = registrar_ponto(id_user)

    return jsonify({
        "status": "ok",
        "face": "validada",
        "ponto": resultado
    }), 200