import sqlite3 # Importa a biblioteca para trabalhar com SQLite

def get_db_connection():# Função para conectar ao banco de dados
    conn = sqlite3.connect('database.db') # Conecta ao arquivo do banco de dados (será criado se não existir)
    conn.row_factory = sqlite3.Row # Configura para acessar colunas pelo nome, facilitando a leitura dos dados
    return conn # Retorna a conexão para ser usada em outras partes do código

def init_db(): # Função para inicializar o banco de dados, criando as tabelas necessárias
    conn = get_db_connection() 
    # Criando a tabela de usuários
    conn.execute("PRAGMA foreign_keys = ON;") # Habilita o suporte a chaves estrangeiras no SQLite
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
        descricao VARCHAR(50)
    );
    CREATE TABLE IF NOT EXISTS Funcionario (
        id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        cpf VARCHAR(11) UNIQUE,
        telefone VARCHAR(15),
        email VARCHAR(100),
        endereco VARCHAR(150),
        cep VARCHAR(9),
        id_cid INTEGER,
        id_est INTEGER,
        FOREIGN KEY (id_cid) REFERENCES Cidade(id_cid),
        FOREIGN KEY (id_est) REFERENCES Estado(id_est)
    );
    CREATE TABLE IF NOT EXISTS Login (
        id_user INTEGER PRIMARY KEY,
        tipo_user INTEGER,
        data_admin DATE,
        senha VARCHAR(10),
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
    );''')
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db() # Chama a função para inicializar o banco de dados quando o script for executado diretamente