from flask import Blueprint, request, jsonify
from backend.database import get_db_connection
from werkzeug.security import generate_password_hash
import os

user_bp = Blueprint("user", __name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PASTA_FOTOS = os.path.join(
    BASE_DIR,
    "..",
    "reconhecimento",
    "fotos"
)

@user_bp.route("/cadastrar", methods=["POST"])
def rota_cadastrar():

    dados = request.form

    foto = request.files.get("foto")

    if not foto:

        return jsonify({
            "status": "erro",
            "erro": "Foto não enviada."
        }), 400

    senha_hash = generate_password_hash(
        dados["senha"]
    )

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            INSERT INTO Funcionario
            (
                nome,
                cpf,
                email,
                id_funcao
            )
            VALUES (?, ?, ?, ?)
        """, (
            dados["nome"],
            dados["cpf"],
            dados["email"],
            dados["id_funcao"]
        ))

        id_funcionario = cursor.lastrowid

        cursor.execute("""
            INSERT INTO Login
            (
                id_user,
                tipo_user,
                senha
            )
            VALUES (?, ?, ?)
        """, (
            id_funcionario,
            2,
            senha_hash
        ))

        caminho_foto = os.path.join(
            PASTA_FOTOS,
            f"{id_funcionario}.jpg"
        )

        foto.save(caminho_foto)

        conn.commit()
        conn.close()

        return jsonify({
            "status": "sucesso",
            "id_funcionario": id_funcionario
        }), 201

    except Exception as e:

        return jsonify({
            "status": "erro",
            "erro": str(e)
        }), 400