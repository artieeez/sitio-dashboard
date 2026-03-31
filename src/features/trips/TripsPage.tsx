import { Anchor, Container, List, Stack, Text, Title } from '@mantine/core';
import { Link, useParams } from '@tanstack/react-router';
import { useTrips } from '../../api/hooks';
import { ptBR } from '../../i18n/pt-BR';
import { useUiStore } from '../../stores/ui';

export function TripsPage() {
  const { schoolId } = useParams({ from: '/staff/schools/$schoolId/trips' });
  const { data, isLoading, error } = useTrips(schoolId);
  const setTrip = useUiStore((s) => s.setSelectedTrip);

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
        <Title order={2}>{ptBR.trips}</Title>
        <List spacing="xs">
          {data?.items.map((t) => (
            <List.Item key={t.id}>
              <Anchor
                component={Link}
                to="/staff/trips/$tripId"
                params={{ tripId: t.id } as any}
                onClick={() => setTrip(t.id)}
              >
                {t.title}
              </Anchor>
            </List.Item>
          ))}
        </List>
      </Stack>
    </Container>
  );
}
