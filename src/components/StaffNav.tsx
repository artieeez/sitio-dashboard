import { Anchor, Group } from '@mantine/core';
import { Link } from '@tanstack/react-router';

export function StaffNav() {
  return (
    <Group gap="md" p="sm" bg="gray.0" justify="flex-start">
      <Anchor component={Link} to="/staff/schools" size="sm">
        Escolas
      </Anchor>
      <Anchor component={Link} to="/staff/reconciliation" size="sm">
        Reconciliação
      </Anchor>
      <Anchor component={Link} to="/staff/share-links/new" size="sm">
        Novo link
      </Anchor>
    </Group>
  );
}
