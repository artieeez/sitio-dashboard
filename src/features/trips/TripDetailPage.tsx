import {
  Button,
  Container,
  FileInput,
  Group,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useParams } from '@tanstack/react-router';
import { useState } from 'react';
import {
  useManualPassenger,
  usePassengerStatus,
} from '../../api/hooks';
import { ptBR } from '../../i18n/pt-BR';

export function TripDetailPage() {
  const { tripId } = useParams({ from: '/staff/trips/$tripId' });
  const { data, isLoading, error, refetch } = usePassengerStatus(tripId);
  const manual = useManualPassenger(tripId);
  const [file, setFile] = useState<File | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const form = useForm({
    initialValues: { fullName: '', studentDocument: '' },
  });

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
      <Stack gap="md">
        <Title order={2}>{data.trip.title}</Title>
        <Text size="sm" c="dimmed">
          {ptBR.passengers}
        </Text>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nome</Table.Th>
              <Table.Th>{ptBR.payment}</Table.Th>
              <Table.Th>{ptBR.document}</Table.Th>
              <Table.Th>{ptBR.flagged}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.passengers.map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td>{p.fullName}</Table.Td>
                <Table.Td>{p.paymentStatus}</Table.Td>
                <Table.Td>{p.documentStatus}</Table.Td>
                <Table.Td>{p.flagged ? 'Sim' : 'Não'}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Title order={4}>{ptBR.manualAdd}</Title>
        <form
          onSubmit={form.onSubmit(async (values) => {
            await manual.mutateAsync({
              fullName: values.fullName,
              studentDocument: values.studentDocument || undefined,
            });
            form.reset();
          })}
        >
          <Group align="flex-end">
            <TextInput
              label="Nome completo"
              required
              {...form.getInputProps('fullName')}
            />
            <TextInput
              label="Documento (opcional)"
              {...form.getInputProps('studentDocument')}
            />
            <Button type="submit" loading={manual.isPending}>
              {ptBR.manualAdd}
            </Button>
          </Group>
        </form>

        <Title order={4}>{ptBR.import}</Title>
        <Text size="sm">
          Colunas: <code>fullName</code> (obrigatório),{' '}
          <code>studentDocument</code> (opcional). Importação em bloco único:
          qualquer linha inválida bloqueia tudo.
        </Text>
        <Group>
          <FileInput
            label="CSV ou Excel"
            accept=".csv,.xlsx,.xls"
            value={file}
            onChange={setFile}
          />
          <Button
            variant="light"
            disabled={!file}
            onClick={async () => {
              if (!file) return;
              const fd = new FormData();
              fd.append('file', file);
              const base = import.meta.env.VITE_API_BASE_URL ?? '';
              const userId = import.meta.env.VITE_DEV_USER_ID ?? '';
              const res = await fetch(
                `${base.replace(/\/$/, '')}/v1/trips/${tripId}/passengers/import?mode=preview`,
                {
                  method: 'POST',
                  body: fd,
                  headers: userId ? { 'x-auth-user-id': userId } : undefined,
                },
              );
              const json = await res.json();
              setImportMsg(JSON.stringify(json, null, 2));
            }}
          >
            Pré-visualizar
          </Button>
          <Button
            disabled={!file}
            onClick={async () => {
              if (!file) return;
              const fd = new FormData();
              fd.append('file', file);
              const base = import.meta.env.VITE_API_BASE_URL ?? '';
              const userId = import.meta.env.VITE_DEV_USER_ID ?? '';
              await fetch(
                `${base.replace(/\/$/, '')}/v1/trips/${tripId}/passengers/import?mode=commit`,
                {
                  method: 'POST',
                  body: fd,
                  headers: userId ? { 'x-auth-user-id': userId } : undefined,
                },
              );
              setFile(null);
              setImportMsg(null);
              void refetch();
            }}
          >
            Importar
          </Button>
        </Group>
        {importMsg && (
          <Text component="pre" size="xs" style={{ whiteSpace: 'pre-wrap' }}>
            {importMsg}
          </Text>
        )}
      </Stack>
    </Container>
  );
}
