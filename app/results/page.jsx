"use client";

import React, { useState, useEffect } from "react";
import { title } from "../../misc/primitives";
import { Icon } from "@iconify/react";
import api from "../../misc/api";
import {
  Card,
  CardBody,
  Progress,
  Button,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  ModalBody,
  addToast,
  CardFooter,
  Avatar,
} from "@heroui/react";

const Star = ({ filled, ...props }) => (
  <Icon icon={filled ? "solar:star-bold" : "solar:star-outline"} {...props} />
);

const ArrowLeft = (props) => (
  <Icon icon="solar:arrow-left-line-duotone" {...props} />
);

function JobProgressList({ data }) {
  return (
    <>
      {data.map(([job, score], i) => (
        <Progress
          key={i}
          label={job}
          value={score}
          radius="sm"
          size="sm"
          showValueLabel={true}
          classNames={{
            base: "max-w-full",
            track: "drop-shadow-md h-2 border border-default",
            indicator: "bg-gradient-to-r from-[#5EA2EF] to-[#0072F5]",
            label: "tracking-wider font-medium text-default-600",
            value: "text-foreground/60",
          }}
        />
      ))}
    </>
  );
}

function ReviewCard({ review }) {
  return (
    <Card>
      <CardBody className="gap-3">
        <div className="flex gap-3">
          <Avatar
            isBordered
            radius="full"
            size="md"
            src="https://cdn-icons-png.flaticon.com/512/1144/1144760.png"
          />
          <div className="flex flex-col gap-1 items-start justify-center">
            <p className="text-medium font-semibold leading-none text-default-600">
              @{review.user.username}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: review.rating }, (_, i) => (
                <Star key={i} filled className="text-yellow-500" />
              ))}
            </div>
          </div>
        </div>
        <p>{review.comment}</p>
      </CardBody>
    </Card>
  );
}

function ReviewModal({
  isOpen,
  onOpenChange,
  rating,
  setRating,
  comment,
  setComment,
  isSubmitting,
  handleSubmit,
  hasReview,
}) {
  return (
    <Modal placement="center" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-md">
        {(close) => (
          <div>
            <ModalHeader className="flex flex-col">
              <p className="text-2xl font-bold text-center">
                {hasReview ? "Update Your" : "Leave a"} Review
              </p>
              <span className="text-sm font-medium text-default-400 text-center">
                Share your experience with our product or service.
              </span>
            </ModalHeader>

            <ModalBody>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Rating</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-colors rounded-md hover:bg-muted"
                    >
                      <Star
                        filled={star <= rating}
                        className="sm:size-8 size-6 text-yellow-500"
                      />
                      <span className="sr-only">{star} stars</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Comment (optional)</span>
                <Textarea
                  variant="faded"
                  placeholder="Tell us what you think..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </ModalBody>

            <ModalFooter className="flex flex-col-reverse sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="faded"
                onPress={close}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="shadow"
                color="primary"
                onPress={handleSubmit}
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting
                  ? hasReview
                    ? "Updating..."
                    : "Submitting..."
                  : hasReview
                    ? "Update"
                    : "Submit"}
              </Button>
            </ModalFooter>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}

export default function ResultsPage() {
  const [data, setData] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hasReview, setHasReview] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publicReviews, setPublicReviews] = useState([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  async function fetchReviews(own = true) {
    const response = await api(`/api/feedback/${own ? "get_feedback/" : ""}`);
    return response.data;
  }

  const handleGoBack = () => {
    router.push("/");
    localStorage.removeItem("result");
  };

  const handleEditReview = async () => {
    setModalMode("edit");
    onOpen();
    setRating(hasReview?.rating || 1);
    setComment(hasReview?.comment || "");
  };

  const handleSubmit = async () => {
    if (!rating) {
      addToast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        color: "danger",
        timeout: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const isModeCreate = modalMode === "create";

      const my_new_feedback = await api({
        url: `/api/feedback/${isModeCreate ? "" : "update_feedback/"}`,
        method: isModeCreate ? "POST" : "PATCH",
        data: { rating, comment },
      });

      addToast({
        title: `Review ${isModeCreate ? "submitted" : "edited"}`,
        description: "Thank you for your feedback!",
        color: "success",
        timeout: 3000,
      });

      setHasReview(my_new_feedback.data);
      setRating(my_new_feedback.data.rating);
      setComment(my_new_feedback.data.comment);
      onOpenChange();
      setModalMode("create");

      setPublicReviews(await fetchReviews(false));
    } catch (error) {
      addToast({
        title: "Something went wrong",
        description:
          error instanceof Error
            ? error.message
            : "Your review could not be submitted. Please try again.",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const savedValue = localStorage.getItem("result");
      if (savedValue) {
        try {
          const parsedMessage = JSON.parse(savedValue);
          const patchedMessage = JSON.parse(parsedMessage.message.slice(7, -4));
          const sortedMessage = Object.entries(patchedMessage).sort(
            (a, b) => b[1] - a[1]
          );
          setData(sortedMessage);

          await fetchReviews()
            .catch((error) => {})
            .then((data) => {
              setHasReview(data);
            });

          const public_feedbacks = await fetchReviews(false);
          setPublicReviews(public_feedbacks);
        } catch (error) {
          addToast({
            title: "Something went wrong",
            description: "Failed to load saved data. Please try again.",
            color: "danger",
            timeout: 3000,
          });
        }
      }
    };

    fetchData();
  }, []);

  return (
    <main className="w-full flex flex-col gap-12">
      <section className="flex items-center justify-center flex-col gap-8">
        <h1 className={`${title({ color: "blue" })} p-2`}>
          Here are top jobs that matched your skills...
        </h1>
        <Card className="w-full">
          <CardBody className="flex p-6 gap-5">
            <JobProgressList data={data} />
          </CardBody>
          <CardFooter className="gap-2 sm:flex-row flex-col justify-end">
            {hasReview ? (
              <Button
                variant="shadow"
                className="sm:w-max w-full"
                color="primary"
                onPress={handleEditReview}
              >
                <Star size={32} className="text-white" filled />
                Edit Review
              </Button>
            ) : (
              <Button
                variant="shadow"
                className="sm:w-max w-full"
                color="primary"
                onPress={onOpen}
              >
                <span>Leave a Review</span>
              </Button>
            )}
            <Button
              variant="shadow"
              className="sm:w-max w-full"
              color="default"
              onPress={handleGoBack}
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="flex gap-4 flex-col">
        <h1 className={`${title({ color: "violet" })} p-2`}>User Reviews</h1>
        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
          {publicReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>

      <ReviewModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        isSubmitting={isSubmitting}
        handleSubmit={handleSubmit}
        hasReview={hasReview}
      />
    </main>
  );
}
