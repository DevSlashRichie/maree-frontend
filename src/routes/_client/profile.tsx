import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/hooks/use-auth-store";
import { requireAuth } from "@/hooks/with-auth";
import { patchV1UsersMe, usePostAuthLogout } from "@/lib/api";

export const Route = createFileRoute("/_client/profile")({
  beforeLoad: async ({ location }) => {
    await requireAuth({ location, navigateTo: "/login" });
  },

  pendingComponent: () => (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-muted-foreground">Loading...</p>
    </div>
  ),
  component: ProfileComponent,
});

function ProfileComponent() {
  const { actor, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const { trigger: logout } = usePostAuthLogout();

  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    defaultValues: {
      firstName: actor?.firstName || "",
      lastName: actor?.lastName || "",
    },
    onSubmit: async ({ value }) => {
      try {
        const { data, status } = await patchV1UsersMe(value);
        if (status === 200) {
          setAuth(data);
          setIsEditing(false);
          toast.success("Perfil actualizado");
        } else {
          toast.error("Error al actualizar");
        }
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Error al conectar con el servidor");
      }
    },
  });

  const handleLogout = async () => {
    try {
      await logout({});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      navigate({ to: "/login" });
      toast.success("Sesión cerrada.");
    }
  };

  if (!actor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h2 className="text-2xl font-display text-gray-800 mb-4">
          No has iniciado sesión
        </h2>
        <button
          onClick={() => navigate({ to: "/login" })}
          className="px-6 py-2 bg-pink-soft text-white rounded-full shadow-lg"
          type="button"
        >
          Ir al Login
        </button>
      </div>
    );
  }

  return (
    <div className="texture-bg min-h-screen pb-20 pt-10 px-4">
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-pink-soft/10">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-3xl font-display lowercase italic tracking-tight text-gray-900">
            Mi Perfil
          </h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="space-y-6">
            <form.Field
              name="firstName"
              validators={{
                onChange: ({ value }) =>
                  !value ? "Campo requerido" : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="text-[10px] font-bold tracking-[0.2em] text-charcoal/60 uppercase pl-1"
                  >
                    Nombre(s)
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        id="firstName"
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-pink-soft/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-soft/20"
                      />
                      {field.state.meta.errors && (
                        <em className="text-xs text-red-500 pl-1">
                          {field.state.meta.errors.join(", ")}
                        </em>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-3 bg-pink-soft/5 rounded-2xl text-gray-800 font-medium">
                      {actor.firstName}
                    </div>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="lastName"
              validators={{
                onChange: ({ value }) =>
                  !value ? "Campo requerido" : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="text-[10px] font-bold tracking-[0.2em] text-charcoal/60 uppercase pl-1"
                  >
                    Apellidos
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        id="lastName"
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-pink-soft/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-soft/20"
                      />
                      {field.state.meta.errors && (
                        <em className="text-xs text-red-500 pl-1">
                          {field.state.meta.errors.join(", ")}
                        </em>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-3 bg-pink-soft/5 rounded-2xl text-gray-800 font-medium">
                      {actor.lastName}
                    </div>
                  )}
                </div>
              )}
            </form.Field>

            <div className="space-y-2">
              <span className="block text-[10px] font-bold tracking-[0.2em] text-charcoal/60 uppercase pl-1">
                Teléfono
              </span>
              <div className="px-4 py-3 bg-pink-soft/5 rounded-2xl text-gray-800 font-medium">
                {actor.phone}
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            {isEditing ? (
              <div className="flex gap-4">
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <button
                      disabled={!canSubmit || isSubmitting}
                      className="flex-1 py-3 bg-pink-soft text-white rounded-2xl font-bold shadow-lg hover:bg-pink-soft/90 transition-colors disabled:opacity-50"
                      type="submit"
                    >
                      {isSubmitting ? "Guardando..." : "Guardar"}
                    </button>
                  )}
                </form.Subscribe>
                <button
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                  }}
                  className="flex-1 py-3 border border-pink-soft/20 text-charcoal rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-3 bg-charcoal text-white rounded-2xl font-bold shadow-lg hover:bg-charcoal/90 transition-colors"
                type="button"
              >
                Editar Detalles
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-3 border-2 border-red-100 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              Cerrar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
