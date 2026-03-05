import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heading, Paragraph } from "@/components/ui/typography";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
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
            />

            <Button type="submit" className="w-full mt-2">
              Continuar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
