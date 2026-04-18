'use client';

import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  NativeSelect,
  Stack,
  Textarea,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDemandStore } from '@/store/demandStore';
import { CriarDemandaDTO } from '@/services/api';

const CATEGORIAS = [
  { value: 'Iluminação', label: 'Iluminação Pública' },
  { value: 'Obras', label: 'Manutenção de Vias' },
  { value: 'Lixo', label: 'Coleta de Lixo' },
  { value: 'Saneamento', label: 'Saneamento' },
  { value: 'Fiscalização', label: 'Fiscalização' },
  { value: 'Outros', label: 'Outros' },
];

const LOCALIZACOES_MOCK = [
  'Rua das Flores, Centro',
  'Av. Central, Boa Viagem',
  'Praça da Matriz, Santo Antônio',
  'Rua do Sol, Derby',
  'Av. Agamenon Magalhães, Graças',
  'Rua Imperial, São José',
];

export default function NovaDemanda() {
  const router = useRouter();
  const { addDemanda, isLoading } = useDemandStore();

  const [form, setForm] = useState<CriarDemandaDTO>({
    titulo: '',
    descricao: '',
    categoria: '',
    local: '',
  });

  const [errors, setErrors] = useState<Partial<CriarDemandaDTO>>({});

  function validate() {
    const newErrors: Partial<CriarDemandaDTO> = {};
    if (!form.titulo.trim()) newErrors.titulo = 'Título é obrigatório';
    if (!form.categoria) newErrors.categoria = 'Selecione uma categoria';
    if (!form.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';
    if (!form.local) newErrors.local = 'Selecione uma localização';
    return newErrors;
  }

  async function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    await addDemanda(form);
    router.push('/demandas');
  }

  function handleChange(field: keyof CriarDemandaDTO, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <Box py={8} px={6} maxW="900px" w="full" mx="auto">
        <Heading size="lg" mb={6} color="blue.600">
            Nova Demanda
        </Heading>

  <Box bg="white" borderRadius="lg" p={8} shadow="sm" borderWidth="1px" borderColor="gray.200">
        <Stack gap={5}>

          <Field.Root invalid={!!errors.titulo}>
            <Field.Label>Título</Field.Label>
            <Input
              placeholder="Ex: Poste apagado na Rua X"
              value={form.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
            />
            <Field.ErrorText>{errors.titulo}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.categoria}>
            <Field.Label>Categoria</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={form.categoria}
                onChange={(e) => handleChange('categoria', e.target.value)}
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Field.ErrorText>{errors.categoria}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.descricao}>
            <Field.Label>Descrição</Field.Label>
            <Textarea
              placeholder="Descreva o problema com detalhes..."
              rows={4}
              value={form.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
            />
            <Field.ErrorText>{errors.descricao}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.local}>
            <Field.Label>Localização</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={form.local}
                onChange={(e) => handleChange('local', e.target.value)}
              >
                <option value="">Selecione uma localização</option>
                {LOCALIZACOES_MOCK.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Field.ErrorText>{errors.local}</Field.ErrorText>
          </Field.Root>

          <Flex gap={3} justify="flex-end">
            <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button colorPalette="blue" onClick={handleSubmit} loading={isLoading} loadingText="Enviando...">
              Cadastrar Demanda
            </Button>
          </Flex>

        </Stack>
      </Box>
    </Box>
  );
}