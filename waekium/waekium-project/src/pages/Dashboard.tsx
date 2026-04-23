import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import "../styles/dashboard.css";

export default function Dashboard() {
  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="content">
          <h2>Visão Geral</h2>

          <div className="grid">
            {/* TABELA */}
            <div className="card large">
              <h3>Status de Rotas e Entregas</h3>

              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Funcionário</th>
                    <th>Rota</th>
                    <th>Saída</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>#PED-00241</td>
                    <td>Distribuidora Central</td>
                    <td>Carlos Mendes</td>
                    <td>SP → Campinas</td>
                    <td>08:40</td>
                    <td><span className="status blue">Em trânsito</span></td>
                  </tr>

                  <tr>
                    <td>#PED-04231</td>
                    <td>---</td>
                    <td>Luís Antônio</td>
                    <td>---</td>
                    <td>--:--</td>
                    <td><span className="status green">Livre</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DIREITA */}
            <div className="side">
              <div className="card">
                <h4>Entregas em andamento</h4>
                <h1>2</h1>
                <p>Entrega em trânsito</p>
              </div>

              <div className="card">
                <h4>Agenda do dia</h4>

                <div className="agenda">
                  <div>
                    <span>08:00</span>
                    <p>Rota Campinas</p>
                  </div>

                  <div>
                    <span>10:30</span>
                    <p>Reunião</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FUNCIONÁRIOS */}
            <div className="card full">
              <h3>Funcionários</h3>

              <div className="users">
                <div className="user">
                  <div className="circle">C</div>
                  <p>Carlos Mendes</p>
                  <span className="status blue">Em trânsito</span>
                </div>

                <div className="user">
                  <div className="circle">L</div>
                  <p>Luís Antônio</p>
                  <span className="status green">Livre</span>
                </div>

                <div className="user">
                  <div className="circle">K</div>
                  <p>Karen Luz</p>
                  <span className="status yellow">Férias</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}