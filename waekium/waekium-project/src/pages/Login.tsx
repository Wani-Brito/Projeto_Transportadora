import { useState } from "react";
import "../styles/login.css";

type Props = {
    onLogin: () => void;
};

export default function Login({ onLogin }: Props) {
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        console.log("Logar com usuário:", user);
        console.log("Senha:", password);
        onLogin();
    };

    return (
        <div className="container">
            <div className="card">
                <h1 className="logo">WAEKIUM</h1>
                <p className="subtitle">ERP LOGÍSTICO</p>
                <input
                    type="text"
                    placeholder="Digite o usuário"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Digite a senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={onLogin}>ENTRAR</button>
            </div>
        </div>
    );
}