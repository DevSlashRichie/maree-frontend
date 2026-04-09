import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Heading, Paragraph } from "@/components/typography";
import { useAuthStore } from "@/hooks/use-auth-store";
import { getV1UsersMe, postAuthLogin } from "@/lib/api";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ search }) => {
    const { isAuthenticated, checkSession } = useAuthStore.getState();
    if (isAuthenticated && checkSession()) {
      throw redirect({
        to: search.next || "/",
      });
    }
  },
  component: LoginPage,
  validateSearch: z.object({
    next: z.string().optional(),
  }),
});

function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { next: redirectTo } = Route.useSearch();
  const { setAuth } = useAuthStore();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const r = await postAuthLogin(
        {
          identity: phone,
          method:
            step === "phone"
              ? {
                  type: "test",
                }
              : {
                  type: "code",
                  value: code,
                },
        },
        {
          credentials: "include",
        },
      );

      console.debug("Login response:", r);

      if (r.status === 200) {
        const result = r.data;

        if (result.type === "token") {
          console.info("Sucessfull Login.");
          const expiresAt = result.expiresAt;

          // Fetch user data to populate store after successful token login
          const { data: user, status } = await getV1UsersMe();
          if (user && status === 200) {
            setAuth(user, expiresAt);
          }

          // Tell TanStack Router to re-evaluate route guards after successful login
          await router.invalidate();

          // Navigate to the next route or fallback to home
          router.navigate({
            to: redirectTo || "/",
          });
          return;
        }

        if (
          result.type === "required_action" &&
          result.required_action === "login_with_sent_code"
        ) {
          setStep("code");
          return;
        }

        // If we reach here, status is 200 but data.type is unexpected
        setError(`Respuesta inesperada: ${result.type || "sin tipo"}`);
        return;
      }

      // Handle expected backend errors
      if (r.status === 400 || r.status === 403) {
        setError(r.data.message || "Error al iniciar sesión");
      } else {
        setError("Ocurrió un error inesperado");
      }
    } catch (error) {
      console.error("Login failed", error);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen texture-bg flex justify-center px-4 py-12 mt-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Heading className="text-2xl">Bienvenido</Heading>
          <Paragraph className="mt-2">
            {step === "phone"
              ? "Introduce tu número de teléfono para continuar."
              : `Hemos enviado un código a ${phone}.`}
          </Paragraph>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)] border border-pink-powder p-8">
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {step === "phone" ? (
              <Input
                label="Teléfono"
                type="text"
                placeholder="+52 442 753 62 11"
                name="phone"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                }}
              />
            ) : (
              <Input
                label="Código de verificación"
                type="text"
                placeholder="123456"
                name="code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                }}
              />
            )}

            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading
                  ? "Cargando..."
                  : step === "phone"
                    ? "Continuar"
                    : "Verificar código"}
              </Button>

              {step === "code" && (
                <button
                  type="button"
                  className="text-sm text-text-main/60 hover:text-text-main transition-colors py-2"
                  onClick={() => {
                    setStep("phone");
                    setError(null);
                    setCode("");
                  }}
                >
                  Cambiar número de teléfono
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
