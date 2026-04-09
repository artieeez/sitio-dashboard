import { createFileRoute } from "@tanstack/react-router";

import { SchoolsListPane } from "@/components/schools/schools-list-pane";

export const Route = createFileRoute("/schools/")({
  component: SchoolsIndexDetail,
});

/** Schools directory listing: right pane beside blank directory “home” list pane. */
function SchoolsIndexDetail() {
  return <SchoolsListPane />;
}
