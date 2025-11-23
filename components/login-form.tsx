"use client";

import { CSSProperties } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Mail, KeyRound } from "lucide-react";
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    toast("You submitted the following values:", {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as CSSProperties,
    })
  };

  return (
    <Card className="w-full sm:max-w-md">
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