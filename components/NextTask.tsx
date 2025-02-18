"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../utils/index";
import Image from "next/image";

interface Task {
  id: number;
  amount: number;
  title: string;
  option: {
    id: number;
    image_url: string;
    task_id: number;
  }[];
}

export const NextTask = () => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BACKEND_URL}/v1/worker/nextTask`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((response) => {
        setCurrentTask(response.data.task);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setCurrentTask(null);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-2xl">
          Please check back in some time, no tasks available right now.
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-2xl pt-20 flex justify-center">
        {currentTask.title} {currentTask.id} 
        {submitting && <div className="ml-2">Submitting...</div>}
      </div>
      <div className="flex justify-center pt-8">
        {currentTask.option.map((option) => (
          <Option
            key={option.id}
            imageUrl={option.image_url}
            onSelect={async () => {
              setSubmitting(true);
              try {
                const response = await axios.post(
                  `${BACKEND_URL}/v1/worker/submission`,
                  {
                    taskId: currentTask.id.toString(),
                    selection: option.id.toString(),
                  },
                  {
                    headers: {
                      Authorization: localStorage.getItem("token"),
                    },
                  }
                );
                const nextTask = response.data.nextTask;
                if (nextTask) {
                  setCurrentTask(nextTask);
                } else {
                  setCurrentTask(null);
                }
              } catch (e) {
                console.log(e);
              }
              setSubmitting(false);
            }}
          />
        ))}
      </div>
    </div>
  );
};

function Option({
  imageUrl,
  onSelect,
}: {
  imageUrl: string;
  onSelect: () => void;
}) {
  return (
    <div>
      <Image
        width={384}
        height={200}
        onClick={onSelect}
        className="p-2 rounded-md"
        src={imageUrl}
        alt="image.jpg"
      />
    </div>
  );
}
