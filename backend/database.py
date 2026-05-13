import os
import sqlite3 # Importa a biblioteca para trabalhar com SQLite
from werkzeug.security import generate_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(): # Função para inicializar o banco de dados, criando as tabelas necessárias
    conn = get_db_connection() 
    print(os.path.abspath(DB_PATH))
    # Criando a tabela de usuários
    conn.execute("PRAGMA foreign_keys = ON;")
     # Habilita o suporte a chaves estrangeiras no SQLite
    conn.executescript('''
    CREATE TABLE IF NOT EXISTS Estado (
        id_est INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(20) NOT NULL,
        sigla VARCHAR(2) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS Cidade (
        id_cid INTEGER PRIMARY KEY AUTOINCREMENT,
        cidade VARCHAR(30) NOT NULL,
        id_est INTEGER,
        FOREIGN KEY (id_est) REFERENCES Estado(id_est)
    );
    CREATE TABLE IF NOT EXISTS Tipo_User (
        id_tipo INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_tipo TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS funcoes (
        id_funcao INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE  ,
        nome_funcao TEXT NOT NULL UNIQUE,
        salario REAL NOT NULL,
        carga_horaria_semanal INTEGER DEFAULT 44,
        ativo INTEGER DEFAULT 1
    );  
    CREATE TABLE IF NOT EXISTS Funcionario (
        id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        cpf VARCHAR(11) UNIQUE NOT NULL,
        telefone VARCHAR(15),
        email VARCHAR(100) UNIQUE NOT NULL,
        endereco VARCHAR(150),
        cep VARCHAR(9),
        id_cid INTEGER,
        id_est INTEGER,
        id_funcao INTEGER NOT NULL,
        banco_horas_ativo INTEGER DEFAULT 0,
        ativo INTEGER DEFAULT 1,
        FOREIGN KEY (id_cid) REFERENCES Cidade(id_cid),   
        FOREIGN KEY (id_est) REFERENCES Estado(id_est),
        FOREIGN KEY (id_funcao) REFERENCES funcoes(id_funcao)
    );
                 
   CREATE TABLE IF NOT EXISTS Login (
        id_user INTEGER PRIMARY KEY,
        tipo_user INTEGER NOT NULL,
        ultimo_login TEXT,
        ativo INTEGER DEFAULT 1,
        senha TEXT NOT NULL,
        FOREIGN KEY (id_user) REFERENCES Funcionario(id_funcionario),
        FOREIGN KEY (tipo_user) REFERENCES Tipo_User(id_tipo)
    );
    CREATE TABLE IF NOT EXISTS Jornada (
        id_forn INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(50),
        id_cid INTEGER,
        id_est INTEGER,
        FOREIGN KEY (id_cid) REFERENCES Cidade(id_cid),
        FOREIGN KEY (id_est) REFERENCES Estado(id_est)
    );

    CREATE TABLE IF NOT EXISTS Ponto (
        id_ponto INTEGER PRIMARY KEY AUTOINCREMENT,
        id_user INTEGER,
        data_entr DATE,
        data_saida DATE,
        hor_entr TIME,
        hor_saida_almoco TIME,
        hor_volta_almoco TIME,
        hor_saida TIME,
        FOREIGN KEY (id_user) REFERENCES Login(id_user)
    );
    CREATE TABLE IF NOT EXISTS RH (
        id_rh INTEGER PRIMARY KEY AUTOINCREMENT,
        id_func INTEGER,
        horas DECIMAL(10,2),
        valor_hora DECIMAL(10,2),
        FOREIGN KEY (id_func) REFERENCES Funcionario(id_funcionario)
    );
    CREATE TABLE IF NOT EXISTS Atividade (
        id_atividade INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS Agenda (
        id_agenda INTEGER PRIMARY KEY AUTOINCREMENT,
        id_funcionario INTEGER,
        id_atividade INTEGER,
        data_inicio DATE,
        data_final DATE,
        id_cid INTEGER,
        id_est INTEGER,
        endereco VARCHAR(150),
        FOREIGN KEY (id_funcionario) REFERENCES Funcionario(id_funcionario),
        FOREIGN KEY (id_atividade) REFERENCES Atividade(id_atividade),
        FOREIGN KEY (id_cid) REFERENCES Cidade(id_cid),
        FOREIGN KEY (id_est) REFERENCES Estado(id_est)
    );
INSERT OR IGNORE INTO Tipo_User (id_tipo, nome_tipo)
VALUES (1, 'Administrador');

INSERT OR IGNORE INTO Tipo_User (id_tipo, nome_tipo)
VALUES (2, 'Funcionario');

INSERT OR IGNORE INTO Tipo_User (id_tipo, nome_tipo)
VALUES (3, 'AdministradorFuncionario');


INSERT OR IGNORE INTO Estado (id_est, nome, sigla)
VALUES (1, 'São Paulo', 'SP');


INSERT OR IGNORE INTO Cidade (id_cid, cidade, id_est)
VALUES (1, 'Campinas', 1);


INSERT OR IGNORE INTO funcoes
(
    id_funcao,
    nome_funcao,
    salario,
    carga_horaria_semanal
)
VALUES
(
    1,
    'Motorista',
    3500,
    44
);


INSERT OR IGNORE INTO funcoes
(
    id_funcao,
    nome_funcao,
    salario,
    carga_horaria_semanal
)
VALUES
(
    2,
    'Assistente Administrativo',
    2500,
    44
);


INSERT OR IGNORE INTO funcoes
(
    id_funcao,
    nome_funcao,
    salario,
    carga_horaria_semanal
)
VALUES
(
    3,
    'Gerente',
    6000,
    44
);
    ''')
    
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db() # Chama a função para inicializar o banco de dados quando o script for executado diretamente