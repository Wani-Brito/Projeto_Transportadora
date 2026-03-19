import sqlite3
from flask import Flask, request, jsonify
from database import get_db_connection, init_db 
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Habilita CORS para permitir requisições de outras origens (útil para front-end)
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

        # 2. INSERIR FUNCIONÁRIO
        cursor.execute('''
            INSERT INTO Funcionario (nome, cpf, telefone, email, endereco, cep, id_cid, id_est)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (dados['nome'], dados['cpf'], dados['telefone'], dados['email'], 
              dados['endereco'], dados['cep'], id_cid, id_est))
        
        id_funcionario = cursor.lastrowid

        # 3. CRIAR LOGIN (Ligado ao funcionário)
        cursor.execute('''
            INSERT INTO Login (id_user, tipo_user, data_admin, senha)
            VALUES (?, 2, date('now'), ?)
        ''', (id_funcionario, dados['senha']))

        conn.commit()
        return {"status": "sucesso", "id": id_funcionario}

    except sqlite3.IntegrityError:
        conn.rollback()
        return {"status": "erro", "mensagem": "CPF já cadastrado."}
    except Exception as e:
        conn.rollback()
        return {"status": "erro", "mensagem": str(e)}
    finally:
        conn.close()

@app.route("/cadastrar", methods=['POST'])
def rota_cadastrar():
    dados = request.get_json()
    if not dados:
        return jsonify({"erro": "Dados não enviados"}), 400
    
    resultado = salvar_no_banco(dados)
    
    if resultado['status'] == "sucesso":
        return jsonify(resultado), 201
    return jsonify(resultado), 400

@app.route("/login", methods=['POST'])
def rota_login():
    dados = request.get_json()
    cpf = dados.get('cpf')
    senha = dados.get('senha')

    conn = get_db_connection()
    # Busca o usuário pelo CPF e verifica a senha na tabela Login
    user = conn.execute('''
        SELECT f.id_funcionario, f.nome, l.senha 
        FROM Funcionario f
        JOIN Login l ON f.id_funcionario = l.id_user
        WHERE f.cpf = ?
    ''', (cpf,)).fetchone()
    conn.close()

    if user and user['senha'] == senha:
        return jsonify({
            "status": "logado",
            "id": user['id_funcionario'],
            "nome": user['nome']
        }), 200
    
    return jsonify({"status": "erro", "mensagem": "CPF ou senha incorretos"}), 401

if __name__ == "__main__":
    app.run(debug=True)