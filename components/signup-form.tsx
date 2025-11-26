"use client";

import { CSSProperties } from "react";
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
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client"; //import the auth client

const FORM_ID = "login-form";
const USERNAME_CHARACTER_MIN = 8;
const USERNAME_CHARACTER_MAX = 60;
const PASSWORD_CHARACTER_MIN = 8;
const PASSWORD_CHARACTER_MAX = 60;

const formSchema = z.object({
  email: z
    .email("Invalid email")
    .min(4, `Miniumum characters: ${USERNAME_CHARACTER_MIN}`)
    .max(32, `Maximum characters: ${USERNAME_CHARACTER_MAX}`),
  password: z
    .string()
    .min(8, `Minimum characters: ${PASSWORD_CHARACTER_MIN}`)
    .max(60, `Maximum characters: ${PASSWORD_CHARACTER_MAX}`),
  confirmPassword: z
    .string()
    .min(8, `Minimum characters: ${PASSWORD_CHARACTER_MIN}`)
    .max(60, `Maximum characters: ${PASSWORD_CHARACTER_MAX}`),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

const SignupForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    },
  });

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    const { email, password } = formData;

    try {
      const { data, error } = await authClient.signUp.email({
        name: "",
        email: email,
        password: password,
      });

      console.log(data);
    } 
    catch (error) {
      console.log(error);
    }
  };

  return (
    <Card className="w-full sm:max-w-md dark:bg-gray-800 dark:border-0">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="text-2xl">Let's get started</CardTitle>
        <CardDescription>
          Sign up for your account
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
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-description">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-description"
                    type="password"
                    placeholder="Confirm Password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button type="submit" form={FORM_ID}>
            Sign up
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
};

export default SignupForm;