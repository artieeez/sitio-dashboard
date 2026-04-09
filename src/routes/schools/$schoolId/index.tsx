import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/schools/$schoolId/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/schools/$schoolId/home",
      params: { schoolId: params.schoolId },
    });
  },
});
