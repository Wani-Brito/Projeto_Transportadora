from flask import Blueprint, request, jsonify, session
from backend.database import get_db_connection

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def rota_login():
    dados = request.get_json()
    cpf = dados.get("cpf")
    senha = dados.get("senha")

    conn = get_db_connection()

    user = conn.execute("""
        SELECT 
            f.id_funcionario,
            f.nome,
            l.senha,
            l.tipo_user
        FROM Funcionario f
        JOIN Login l ON f.id_funcionario = l.id_user
        WHERE f.cpf = ?
    """, (cpf,)).fetchone()

    conn.close()

    if user and user["senha"] == senha:

        session["user_id"] = user["id_funcionario"]
        session["nome"] = user["nome"]
        session["tipo_user"] = user["tipo_user"]

        if user["tipo_user"] == 1:
            session["roles"] = ["admin"]

        elif user["tipo_user"] == 2:
            session["roles"] = ["funcionario"]

        elif user["tipo_user"] == 3:
            session["roles"] = ["admin", "funcionario"]

        return jsonify({
            "status": "logado",
            "id": user["id_funcionario"],
            "nome": user["nome"],
            "roles": session["roles"]
        }), 200

    return jsonify({
        "status": "erro",
        "mensagem": "CPF ou senha incorretos."
    }), 401