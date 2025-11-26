"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FORM_ID = "login-form";
const USERNAME_CHARACTER_MIN = 2;
const USERNAME_CHARACTER_MAX = 60;
const PASSWORD_CHARACTER_MIN = 2;
const PASSWORD_CHARACTER_MAX = 60;

const formSchema = z.object({
  email: z
    .email("Invalid email")
    .min(4, `Miniumum characters: ${USERNAME_CHARACTER_MIN}`)
    .max(32, `Maximum characters: ${USERNAME_CHARACTER_MAX}`),
  password: z
    .string()
    .min(2, `Minimum characters: ${PASSWORD_CHARACTER_MIN}`)
    .max(60, `Maximum characters: ${PASSWORD_CHARACTER_MAX}`),
});

const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    const { email, password } = formData;

    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || "Invalid email or password");
      }

      toast("Login success!");
      router.push("/success");
    }
    catch (error) {
      console.error(error);
      toast("Failed to login");
    }
    finally {
      setLoading(false);
    }
  };


  return (
    <Card className="w-full sm:max-w-md dark:bg-gray-800 dark:border-0">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign into your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="form-rhf-demo-title">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="email@example.com"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-description">
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-description"
                    type="password"
                    placeholder="Password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                <Checkbox id="rememberLogin" />
                <Label htmlFor="rememberLogin">
                  Remember me
                </Label>
              </div>
              <Label className="underline hover:cursor-pointer">
                Forgot password?
              </Label>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button type="submit" form={FORM_ID}>
            Sign in
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;