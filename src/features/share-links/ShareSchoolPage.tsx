import { Container, Stack, Table, Text, Title } from '@mantine/core';
import { useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, shareLinkHeaders } from '../../api/client';
import { ptBR } from '../../i18n/pt-BR';

export function ShareSchoolPage() {
  const { token } = useSearch({ from: '/share/school' });
  const { data, isLoading, error } = useQuery({
    queryKey: ['shareSchool', token],
    enabled: !!token,
    queryFn: () =>
      apiFetch<{
        schoolId: string;
        trips: {
          trip: { id: string; title: string; schoolId: string };
          passengers: {
            id: string;
            fullName: string;
            paymentStatus: string;
            documentStatus: string;
            flagged: boolean;
          }[];
        }[];
      }>('/v1/share-links/access/school', {
        headers: shareLinkHeaders(token),
      }),
  });

  if (!token) {
    return (
      <Container py="xl">
        <Text>Token ausente na URL (use ?token=...)</Text>
      </Container>
    );
  }
  if (isLoading) {
    return (
      <Container py="xl">
        <Text>{ptBR.loading}</Text>
      </Container>
    );
  }
  if (error || !data) {
    return (
      <Container py="xl">
        <Text c="red">{ptBR.error}</Text>
      </Container>
    );
  }

  return (
    <Container py="xl" size="lg">
      <Stack gap="xl">
        <Title order={2}>Escola — viagens</Title>
        {data.trips.map((block) => (
          <Stack key={block.trip.id} gap="sm">
            <Title order={4}>{block.trip.title}</Title>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nome</Table.Th>
                  <Table.Th>Pagamento</Table.Th>
                  <Table.Th>Documento</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {block.passengers.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td>{p.fullName}</Table.Td>
                    <Table.Td>{p.paymentStatus}</Table.Td>
                    <Table.Td>{p.documentStatus}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        ))}
      </Stack>
    </Container>
  );
}
