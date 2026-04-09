import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy `/schools/$schoolId/home` → canonical school root. */
export const Route = createFileRoute("/schools/$schoolId/home")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/schools/$schoolId",
      params: { schoolId: params.schoolId },
    });
  },
});
