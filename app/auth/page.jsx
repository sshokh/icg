"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import api from "../../misc/api";
import { useRouter } from "next/navigation";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Form,
  Alert,
} from "@heroui/react";
import axios from "axios";

function AuthForm({
  submitLabel,
  errors,
  isSubmitting,
  onSubmit,
  showPassword,
  togglePasswordVisibility,
  setErrors,
}) {
  return (
    <Form className="gap-4" validationErrors={errors} onSubmit={onSubmit}>
      <Input
        name="username"
        label="Username"
        placeholder="john.doe"
        type="text"
        variant="faded"
        errorMessage={errors.username}
        isInvalid={!!errors.username}
        onChange={() =>
          setErrors((prev) => ({ ...prev, username: "" }))
        }
        startContent={
          <Icon
            icon="solar:user-id-line-duotone"
            className="size-6 text-muted-foreground"
          />
        }
        labelPlacement="outside"
        required
        autoComplete="true"
      />
      <Input
        name="password"
        label="Password"
        labelPlacement="outside"
        errorMessage={errors.password}
        isInvalid={!!errors.password}
        onChange={() =>
          setErrors((prev) => ({ ...prev, password: "" }))
        }
        placeholder="•••••••••"
        startContent={
          <Icon
            icon="solar:lock-keyhole-bold-duotone"
            className="size-6 text-muted-foreground"
          />
        }
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <Icon
                icon="solar:eye-closed-line-duotone"
                className="size-6"
              />
            ) : (
              <Icon
                icon="solar:eye-line-duotone"
                className="size-6"
              />
            )}
          </button>
        }
        type={showPassword ? "text" : "password"}
        variant="faded"
        required
        autoComplete="true"
      />
      <Button
        type="submit"
        variant="shadow"
        color="primary"
        className="w-full"
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
      >
        {submitLabel}
      </Button>
    </Form>
  );
}

export default function AuthCard() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selected, setSelected] = useState("login");
  const [errors, setErrors] = useState({
    general: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setIsSubmitting(false);
    setSelected(String(e));
    setErrors({ general: "", username: "", password: "" });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const login = async (data) => {
    return await api("/auth/token/login/", {
      method: "POST",
      headers: {
        Authorization: "",
      },
      data: data,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const endpoint =
        selected === "login" ? "/auth/token/login/" : "/auth/users/";
      const response = await api(endpoint, {
        method: "POST",
        headers: {
          Authorization: "",
        },
        data: data,
      });

      if (selected === "login") {
        localStorage.setItem("token", response.data.auth_token);
        router.push("/questions");
      } else {
        localStorage.setItem("user", JSON.stringify(response.data));
        const retrieveToken = await login(data);
        localStorage.setItem("token", retrieveToken.data.auth_token);
        router.push("/questions");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      if (axios.isAxiosError(error) && error.response) {
        const response = error.response.data;
        setErrors({
          general: response.non_field_errors || error.message,
          username: response.username ? response.username[0] : "",
          password: response.password ? response.password[0] : "",
        });
      } else if (error instanceof Error) {
        setErrors({
          general: error.message,
          username: "",
          password: "",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-dvh p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col">
          <p className="text-2xl font-bold text-center">Welcome</p>
          <span className="text-default-400">
            Sign in to your account or create a new one
          </span>
          {errors.general && (
            <Alert
              variant="faded"
              isVisible={!!errors.general}
              color="danger"
              title={errors.general}
            />
          )}
        </CardHeader>
        <CardBody>
          <Tabs
            selectedKey={selected}
            onSelectionChange={handleChange}
            defaultSelectedKey="login"
            variant="bordered"
            className="flex justify-center"
          >
            <Tab key="login" title="Login">
              <AuthForm
                submitLabel="Login"
                errors={errors}
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
                showPassword={showPassword}
                togglePasswordVisibility={togglePasswordVisibility}
                setErrors={setErrors}
              />
            </Tab>
            <Tab key="signup" title="Sign Up">
              <AuthForm
                submitLabel="Create Account"
                errors={errors}
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
                showPassword={showPassword}
                togglePasswordVisibility={togglePasswordVisibility}
                setErrors={setErrors}
              />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
