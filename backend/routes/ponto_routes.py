from flask import Blueprint, request, jsonify
from backend.database import get_db_connection

ponto_bp = Blueprint("ponto", __name__)

# ==================================================
# FUNÇÃO INTERNA
# ==================================================

def registrar_ponto(id_user):

    conn = get_db_connection()
    cursor = conn.cursor()

    ponto = cursor.execute("""
        SELECT *
        FROM Ponto
        WHERE id_user = ?
        AND data_entr = date('now')
    """, (id_user,)).fetchone()

    # =========================
    # ENTRADA
    # =========================

    if not ponto:

        cursor.execute("""
            INSERT INTO Ponto (
                id_user,
                data_entr,
                hor_entr
            )
            VALUES (
                ?,
                date('now'),
                time('now', '-3 hours')
            )
        """, (id_user,))

        conn.commit()
        conn.close()

        return {
            "status": "entrada registrada"
        }

    # =========================
    # SAÍDA ALMOÇO
    # =========================

    elif not ponto["hor_saida_almoco"]:

        cursor.execute("""
            UPDATE Ponto
            SET hor_saida_almoco = time('now', '-3 hours')
            WHERE id_ponto = ?
        """, (ponto["id_ponto"],))

        conn.commit()
        conn.close()

        return {
            "status": "saida almoço registrada"
        }

    # =========================
    # VOLTA ALMOÇO
    # =========================

    elif not ponto["hor_volta_almoco"]:

        cursor.execute("""
            UPDATE Ponto
            SET hor_volta_almoco = time('now', '-3 hours')
            WHERE id_ponto = ?
        """, (ponto["id_ponto"],))

        conn.commit()
        conn.close()

        return {
            "status": "volta almoço registrada"
        }

    # =========================
    # SAÍDA FINAL
    # =========================

    elif not ponto["hor_saida"]:

        cursor.execute("""
            UPDATE Ponto
            SET data_saida = date('now'),
                hor_saida = time('now', '-3 hours')
            WHERE id_ponto = ?
        """, (ponto["id_ponto"],))

        conn.commit()
        conn.close()

        return {
            "status": "saida final registrada"
        }

    # =========================
    # FINALIZADO
    # =========================

    conn.close()

    return {
        "status": "erro",
        "mensagem": "Ponto já finalizado."
    }


# ==================================================
# ROTA (AGORA SIMPLIFICADA)
# ==================================================

@ponto_bp.route("/ponto", methods=["POST"])
def bater_ponto():

    dados = request.get_json()

    id_user = dados.get("id_user")

    if not id_user:
        return jsonify({
            "status": "erro",
            "mensagem": "ID do usuário obrigatório."
        }), 400

    resultado = registrar_ponto(id_user)

    return jsonify(resultado), 200