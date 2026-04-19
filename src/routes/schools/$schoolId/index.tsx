import { createFileRoute } from "@tanstack/react-router";

/**
 * School root (`/schools/$schoolId`): intentionally minimal until a hub is designed.
 */
function SchoolHomePlaceholder() {
  return <div className="min-h-0 min-w-0 flex-1" />;
}

export const Route = createFileRoute("/schools/$schoolId/")({
  component: SchoolHomePlaceholder,
});
