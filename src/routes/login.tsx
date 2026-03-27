import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Heading, Paragraph } from "@/components/typography";
import { postAuthLogin } from "@/lib/api";
import z from "zod";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: z.object({
    next: z.string().optional(),
  }),
});

function LoginPage() {
  const [phone, setPhone] = useState("");
  const router = useRouter();
  const { next: redirectTo } = Route.useSearch();

  const handleLogin = () => {
    postAuthLogin(
      {
        identity: phone,
        method: {
          type: "test",
        },
      },
      {
        credentials: "include",
      },
    ).then(() => {
      if (redirectTo)
        router.navigate({
          href: redirectTo,
        });
    });
  };

  return (
    <div className="min-h-screen texture-bg flex justify-center px-4 py-12 mt-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Heading className="text-2xl">Bienvenido</Heading>
          <Paragraph className="mt-2">
            Continue para iniciar en tu cuenta.
          </Paragraph>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)] border border-pink-powder p-8">
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => e.preventDefault()}
          >
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

            <Button
              type="submit"
              className="w-full mt-2"
              onClick={() => {
                handleLogin();
              }}
            >
              Continuar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
