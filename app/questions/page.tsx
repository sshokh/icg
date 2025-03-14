"use client";

import { title } from "../../misc/primitives";
import { siteConfig } from "@/config";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectItem,
  Card,
  CardBody,
  Button,
  CardFooter,
} from "@heroui/react";

export default function QuestionsPage() {
  const [responses, setResponses] = useState([]);
  const [unselectedFields, setUnselectedFields] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectChange = (question, value) => {
    setUnselectedFields((prev) => {
      const updated = new Set(prev);
      value !== "" ? updated.delete(question) : updated.add(question);

      return updated;
    });

    setResponses((prev) => {
      const updated = [...prev];
      const hasExistedIndex = updated.findIndex(
        (response) => response.question === question
      );
      hasExistedIndex !== -1
        ? (updated[hasExistedIndex].answer = value)
        : updated.push({ question, answer: value });

      return updated;
    });
  };

  const handleSubmit = async (e) => {
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
      router.push("/results", { shallow: true });
    } catch (error) {
      console.error("Error submitting data:", error.message);
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
    <div className="flex items-center justify-center flex-col gap-8">
      <h1 className={title({ color: "blue" }) + " p-2"}>Rate yourself...</h1>
      <Card className="w-full">
        <CardBody className="flex p-6 gap-5">
          {siteConfig.questions.map((question, i) => (
            <div className="flex flex-col gap-3" key={i}>
              <div className="md:flex-row flex-col flex md:items-center justify-between gap-1">
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
                      : "data-[hover=true]:bg-default-200" + " !duration-300",
                  }}
                  className="md:w-1/2"
                  onChange={(value) =>
                    handleSelectChange(question, value.target.value.toString())
                  }
                >
                  {(item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
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
