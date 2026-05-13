from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.security import check_password_hash
from backend.database import get_db_connection
import jwt
from datetime import datetime, timedelta

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def rota_login():

    dados = request.get_json()

    email = dados.get("email")
    senha = dados.get("senha")

    conn = get_db_connection()

    user = conn.execute("""
        SELECT 
            f.id_funcionario,
            f.nome,
            l.senha,
            l.tipo_user
        FROM Funcionario f
        JOIN Login l
            ON f.id_funcionario = l.id_user
        WHERE f.email = ?
    """, (email,)).fetchone()

    conn.close()
    print("EMAIL:", email)
    print("SENHA:", senha)
    print("USER:", user)

    if user:
        print("HASH:", user["senha"])
        print("CHECK:", check_password_hash(user["senha"], senha))
        # =========================
        # LOGIN CORRETO
        # =========================

    if user and check_password_hash(user["senha"], senha):

        session["user_id"] = user["id_funcionario"]
        session["nome"] = user["nome"]
        session["tipo_user"] = user["tipo_user"]

        if user["tipo_user"] == 1:
            roles = ["admin"]

        elif user["tipo_user"] == 2:
            roles = ["funcionario"]

        else:
            roles = ["admin", "funcionario"]

        session["roles"] = roles

        # =========================
        # JWT
        # =========================

        token = jwt.encode(
            {
                "id": user["id_funcionario"],
                "nome": user["nome"],
                "tipo_user": user["tipo_user"],
                "exp": datetime.utcnow() + timedelta(hours=8)
            },
            current_app.config["SECRET_KEY"],
            algorithm="HS256"
        )

        return jsonify({
            "status": "logado",
            "token": token,
            "id": user["id_funcionario"],
            "nome": user["nome"],
            "roles": roles
        }), 200

    # =========================
    # LOGIN INCORRETO
    # =========================

    return jsonify({
        "status": "erro",
        "mensagem": "Email ou senha incorretos."
    }), 401