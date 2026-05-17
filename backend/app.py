import sqlite3
from flask import Flask, request, jsonify
from backend.database import get_db_connection, init_db
from flask_cors import CORS
from flask import Blueprint
from backend.routes.auth_routes import auth_bp
from backend.routes.user_routes import user_bp
from backend.routes.ponto_routes import ponto_bp
from werkzeug.security import generate_password_hash
from backend.routes.face_routes import face_bp


app = Flask(__name__)
CORS(app) # Habilita CORS para permitir requisições de outras origens (útil para front-end)

app.config["SECRET_KEY"] = "senha"

app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(face_bp)
app.register_blueprint(ponto_bp)
init_db()


@app.route("/")
def home():
    return jsonify({"mensagem": "API da Transportadora rodando!"}), 200

# --- LÓGICA DE NEGÓCIO: CADASTRO ---
def salvar_no_banco(dados):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id_est FROM Estado WHERE sigla = ?", (dados['sigla_estado'],))
        estado = cursor.fetchone()
        id_est = estado['id_est'] if estado else None
        
        if not id_est:
            cursor.execute("INSERT INTO Estado (nome, sigla) VALUES (?, ?)", 
                           (dados.get('nome_estado', 'Estado'), dados['sigla_estado']))
            id_est = cursor.lastrowid

        cursor.execute("SELECT id_cid FROM Cidade WHERE cidade = ? AND id_est = ?", 
                       (dados['cidade'], id_est))
        cidade = cursor.fetchone()
        id_cid = cidade['id_cid'] if cidade else None
        
        if not id_cid:
            cursor.execute("INSERT INTO Cidade (cidade, id_est) VALUES (?, ?)", 
                           (dados['cidade'], id_est))
            id_cid = cursor.lastrowid
        cursor.execute('''
            INSERT INTO Funcionario (nome, cpf, telefone, email, endereco, cep, id_cid, id_est, id_funcao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (dados['nome'], dados['cpf'], dados['telefone'], dados['email'], 
              dados['endereco'], dados['cep'], id_cid, id_est, dados['id_funcao']))
        
        id_funcionario = cursor.lastrowid

        # 3. CRIAR LOGIN (Ligado ao funcionário)
        cursor.execute('''
            INSERT INTO Login (id_user, tipo_user, senha)
            VALUES (?, ?, ?)
        ''',   (id_funcionario, 2, generate_password_hash(dados['senha'])))

        conn.commit()
        return {"status": "sucesso", "id": id_funcionario}

    except sqlite3.IntegrityError:
        conn.rollback()
        return {"status": "erro", "mensagem": str(e)}
    except Exception as e:
        conn.rollback()
        return {"status": "erro", "mensagem": str(e)}
    finally:
        conn.close()



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)