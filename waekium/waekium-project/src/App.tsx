import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [logado, setLogado] = useState(false);

  return logado ? (
    <Dashboard />
  ) : (
    <Login onLogin={() => setLogado(true)} />
  );
}