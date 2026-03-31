import { Anchor, Container, List, Stack, Text, Title } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { useSchools } from '../../api/hooks';
import { ptBR } from '../../i18n/pt-BR';
import { useUiStore } from '../../stores/ui';

export function SchoolsPage() {
  const { data, isLoading, error } = useSchools();
  const setSchool = useUiStore((s) => s.setSelectedSchool);

  if (isLoading) {
    return (
      <Container py="xl">
        <Text>{ptBR.loading}</Text>
      </Container>
    );
  }
  if (error) {
    return (
      <Container py="xl">
        <Text c="red">{ptBR.error}</Text>
      </Container>
    );
  }

  return (
    <Container py="xl" size="sm">
      <Stack gap="md">
        <Title order={2}>{ptBR.schools}</Title>
        <List spacing="xs">
          {data?.items.map((s) => (
            <List.Item key={s.id}>
              <Anchor
                component={Link}
                to="/staff/schools/$schoolId/trips"
                params={{ schoolId: s.id } as any}
                onClick={() => setSchool(s.id)}
              >
                {s.name}
              </Anchor>
            </List.Item>
          ))}
        </List>
      </Stack>
    </Container>
  );
}
