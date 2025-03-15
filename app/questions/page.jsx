"use client";

import { title } from "../../misc/primitives";
import { siteConfig } from "@/config.js";
import { useState, useEffect } from "react";
import { useRouter, redirect } from "next/navigation";

import { Select, SelectItem, Card, CardBody, Button } from "@heroui/react";

export default function QuestionsPage() {
  const [responses, setResponses] = useState([]);
  const [unselectedFields, setUnselectedFields] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!window.localStorage.getItem("token")) redirect("/auth");
  }, []);

  const handleSelectChange = (question, value) => {
    setUnselectedFields((prev) => {
      const updated = new Set(prev);
      value !== "" ? updated.delete(question) : updated.add(question);
      return updated;
    });

    setResponses((prev) => {
      const updated = [...prev];
      const index = updated.findIndex(
        (response) => response.question === question
      );
      if (index !== -1) {
        updated[index].answer = value;
      } else {
        updated.push({ question, answer: value });
      }
      return updated;
    });
  };

  // Removed the event parameter since it isn't used and may cause type issues.
  const handleSubmit = async () => {
    const unselected = checkUnselected();
    if (unselected.size > 0) return;

    try {
      setIsLoading(true);

      const payload = {
        query: responses,
      };

      const response = await fetch("/api/fetchData", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      localStorage.setItem("result", JSON.stringify(result));
      redirect("/results");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error submitting data:", error.message);
      } else {
        console.error("Error submitting data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkUnselected = () => {
    const unselected = new Set();

    siteConfig.questions.forEach((question) => {
      const answer = responses.find((q) => q.question === question)?.answer;
      if (!answer) {
        unselected.add(question);
      }
    });

    setUnselectedFields(unselected);
    return unselected;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <h1 className={title({ color: "blue" }) + " p-2"}>Rate yourself...</h1>
      <Card className="w-full">
        <CardBody className="flex gap-5 p-6">
          {siteConfig.questions.map((question, i) => (
            <div className="flex flex-col gap-3" key={i}>
              <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                <p className="md:max-w-48 text-wrap">{question}</p>
                <Select
                  items={siteConfig.answers}
                  isRequired
                  label="Choose one"
                  key={i}
                  errorMessage={
                    unselectedFields.has(question)
                      ? "Please select an option."
                      : ""
                  }
                  isInvalid={unselectedFields.has(question)}
                  classNames={{
                    trigger: unselectedFields.has(question)
                      ? "data-[hover=true]:bg-danger-100 !duration-300"
                      : "data-[hover=true]:bg-default-200 !duration-300",
                  }}
                  className="md:w-1/2"
                  onChange={(e) => handleSelectChange(question, e.target.value)}
                >
                  {(item) => (
                    <SelectItem key={item.value}>{item.label}</SelectItem>
                  )}
                </Select>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Button
        radius="full"
        className="w-1/2"
        variant="shadow"
        color="primary"
        isLoading={isLoading}
        onPress={handleSubmit}
      >
        {isLoading ? "Submitting" : "Submit"}
      </Button>
    </div>
  );
}
