import { SchoolsDirectorySchoolsTablePane } from "@/components/schools/schools-directory-schools-table-pane";

/**
 * Left pane for schools directory (`/schools`, `/schools/`, `/schools/new`): schools
 * table (same structure as the trip list) beside index or create detail.
 */
export function SchoolsDirectoryHomePane() {
  return <SchoolsDirectorySchoolsTablePane />;
}
