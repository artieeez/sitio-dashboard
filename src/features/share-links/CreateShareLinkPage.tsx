import {
  Button,
  Container,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';

export function CreateShareLinkPage() {
  const form = useForm({
    initialValues: {
      scopeType: 'TRIP' as 'TRIP' | 'SCHOOL',
      tripId: '',
      schoolId: '',
      expiresAt: '',
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const expiresAt = new Date(form.values.expiresAt).toISOString();
      return apiFetch<{
        id: string;
        url: string;
        token: string;
        expiresAt: string;
      }>('/v1/share-links', {
        method: 'POST',
        body: {
          scopeType: form.values.scopeType,
          tripId:
            form.values.scopeType === 'TRIP' ? form.values.tripId : undefined,
          schoolId:
            form.values.scopeType === 'SCHOOL' ? form.values.schoolId : undefined,
          expiresAt,
        },
      });
    },
  });

  return (
    <Container py="xl" size="sm">
      <Stack gap="md">
        <Title order={2}>Novo link compartilhável</Title>
        <Select
          label="Escopo"
          data={[
            { value: 'TRIP', label: 'Viagem' },
            { value: 'SCHOOL', label: 'Escola' },
          ]}
          {...form.getInputProps('scopeType')}
        />
        {form.values.scopeType === 'TRIP' && (
          <TextInput label="ID da viagem (UUID)" {...form.getInputProps('tripId')} />
        )}
        {form.values.scopeType === 'SCHOOL' && (
          <TextInput
            label="ID da escola (UUID)"
            {...form.getInputProps('schoolId')}
          />
        )}
        <TextInput
          type="datetime-local"
          label="Expira em"
          {...form.getInputProps('expiresAt')}
        />
        <Button
          loading={create.isPending}
          onClick={() => void create.mutateAsync()}
        >
          Criar
        </Button>
        {create.data && (
          <Stack gap="xs">
            <Text size="sm">Copie o token uma vez:</Text>
            <TextInput readOnly value={create.data.token} />
            <Text size="sm">URL relativa</Text>
            <TextInput readOnly value={create.data.url} />
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
