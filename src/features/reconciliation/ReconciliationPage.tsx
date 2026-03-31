import { Container, Stack, Table, Text, Title } from '@mantine/core';
import { useReconciliationPayments } from '../../api/hooks';

export function ReconciliationPage() {
  const { data, isLoading, error } = useReconciliationPayments();

  if (isLoading) {
    return (
      <Container py="xl">
        <Text>Carregando…</Text>
      </Container>
    );
  }
  if (error) {
    return (
      <Container py="xl">
        <Text c="red">Erro ao carregar fila</Text>
      </Container>
    );
  }

  return (
    <Container py="xl" size="lg">
      <Stack gap="md">
        <Title order={2}>Reconciliação</Title>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Fonte</Table.Th>
              <Table.Th>Externo</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Duplicado?</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.items.map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td>{p.id.slice(0, 8)}…</Table.Td>
                <Table.Td>{p.integrationSource}</Table.Td>
                <Table.Td>{p.externalPaymentId}</Table.Td>
                <Table.Td>{p.status}</Table.Td>
                <Table.Td>{p.suspectedDuplicate ? 'Sim' : 'Não'}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Container>
  );
}
