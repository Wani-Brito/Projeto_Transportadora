
// =========================
// TIPOS
// =========================

import { apiClient } from "@/services/api/client";

import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
} from "@/types/auth";

// =========================
// CHAVE DA SESSÃO
// =========================

const SESSION_KEY =
  "waekium.auth.session.v1";

// =========================
// URL DO BACKEND
// =========================

// localhost = web no mesmo pc
// porta 5000 = flask

const API_URL =
  "http://localhost:5000";

// =========================
// AUTH SERVICE
// =========================

export const authService = {

  // =========================
  // LOGIN
  // =========================

  async login(
    payload: LoginPayload
  ): Promise<LoginResponse> {

    // faz request pro backend
    const response = await fetch(
      `${API_URL}/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        // backend espera:
        // email + senha

        body: JSON.stringify({
          email: payload.identifier,
          senha: payload.password,
        }),
      }
    );

    // se der erro
    if (!response.ok) {

      let message =
        "Email ou senha inválidos";

      try {

        const error =
          await response.json();

        if (error?.mensagem) {
          message = error.mensagem;
        }

      } catch {
        // ignora
      }

      throw new Error(message);
    }

    // resposta backend
    const data =
      await response.json();

    // converte resposta backend
    // pro formato do frontend

    const loginResponse: LoginResponse = {
      token: data.token,

      user: {
        id: String(data.id),

        username: data.nome,

        cpf: "",

        name: data.nome,

        // pega role
        role:
          data.roles?.includes("admin")
            ? "admin"
            : "funcionario",
      },
    };

    // salva token centralizado
    apiClient.setToken(
      loginResponse.token
    );

    // salva sessão
    this.persist(loginResponse);

    return loginResponse;
  },

  // =========================
  // USUÁRIO ATUAL
  // =========================

  async me(): Promise<AuthUser | null> {

    const session =
      this.read();

    return session?.user || null;
  },

  // =========================
  // LOGOUT
  // =========================

  async logout() {

    // remove token
    apiClient.setToken(null);

    // remove sessão
    localStorage.removeItem(
      SESSION_KEY
    );
  },

  // =========================
  // SALVAR SESSÃO
  // =========================

  persist(
    data: LoginResponse
  ) {

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(data)
    );
  },

  // =========================
  // LER SESSÃO
  // =========================

  read(): LoginResponse | null {

    try {

      const raw =
        localStorage.getItem(
          SESSION_KEY
        );

      if (!raw) {
        return null;
      }

      return JSON.parse(raw);

    } catch {

      return null;
    }
  },

  // =========================
  // TOKEN
  // =========================

  getToken(): string | null {

    return apiClient.getToken();
  },
};

