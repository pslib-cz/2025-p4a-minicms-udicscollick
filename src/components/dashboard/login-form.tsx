"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { loginSchema } from "@/lib/validators";

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!result || result.error) {
      setErrorMessage("Přihlášení se nezdařilo. Zkontrolujte e-mail a heslo.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  });

  return (
    <Paper className="auth-card">
      <Stack gap="lg">
        <div>
          <Text className="eyebrow">Redakce</Text>
          <Title order={1}>Přihlášení</Title>
          <Text c="dimmed" mt="xs">
            Pokračujte do svého účtu a navazujte tam, kde jste skončili.
          </Text>
        </div>

        {errorMessage ? (
          <Alert color="red" variant="light">
            {errorMessage}
          </Alert>
        ) : null}

        <form onSubmit={onSubmit}>
          <Stack gap="md">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextInput
                  {...field}
                  type="email"
                  label="E-mail"
                  placeholder="vas@email.cz"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <PasswordInput
                  {...field}
                  label="Heslo"
                  placeholder="Zadejte heslo"
                  error={errors.password?.message}
                />
              )}
            />

            <Button type="submit" size="md" loading={isSubmitting}>
              Pokračovat
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
