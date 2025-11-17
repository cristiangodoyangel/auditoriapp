import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.ico";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (
          data.user.rol === "admin" &&
          data.user.comunidad &&
          data.user.comunidad.id
        ) {
          try {
            const periodoRes = await fetch(
              "http://localhost:8000/api/auth/inicio-admin-comunidad/",
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${data.access}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const periodoData = await periodoRes.json();
            if (periodoData.redirect === "dashboard") {
              window.location.href = "/dashboard";
            } else if (periodoData.redirect === "crear_periodo") {
              window.location.href = "/crear-periodo";
            } else if (periodoData.error) {
              setError(periodoData.error);
            }
          } catch (err) {
            setError("Error verificando periodo activo");
          }
        } else {
          onLogin();
        }
      } else {
        setError(data.error || "Credenciales incorrectas");
      }
    } catch (err) {
      setError("Error de conexión");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-4">
          <img src={logo} alt="Logo" className="w-24 h-24" />
          <span className="mt-4 text-base-content text-xl font-semibold">
            Gestión Comunidades
          </span>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h2 className="card-title justify-center text-2xl mb-6 text-neutral">
                Iniciar Sesión
              </h2>

              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Usuario</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text">Contraseña</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="alert alert-error shadow-sm my-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className="btn btn-neutral w-full"
                  disabled={loading}
                >
                  {loading && <span className="loading loading-spinner"></span>}
                  {loading ? "Ingresando..." : "Entrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
