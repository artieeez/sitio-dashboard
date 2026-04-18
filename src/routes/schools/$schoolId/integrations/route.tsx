import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/schools/$schoolId/integrations")({
  component: IntegrationsLayout,
});

function IntegrationsLayout() {
  return <Outlet />;
}
