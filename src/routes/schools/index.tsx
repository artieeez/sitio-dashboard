import { createFileRoute } from "@tanstack/react-router";

import { SchoolsDirectoryIndexPlaceholder } from "@/components/schools/schools-directory-index-placeholder";

export const Route = createFileRoute("/schools/")({
  component: SchoolsIndexDetail,
});

/** Schools directory hub: detail stays empty; schools are listed in the left table only. */
function SchoolsIndexDetail() {
  return <SchoolsDirectoryIndexPlaceholder />;
}
