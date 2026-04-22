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
  Image,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { useDemandStore } from '@/store/demandStore';
import { CreateDemandDTO, DemandCategory } from '@/types';

const CATEGORIAS: { value: DemandCategory; label: string }[] = [
  { value: 'PUBLIC_LIGHTING', label: 'Iluminação Pública' },
  { value: 'ROAD_MAINTENANCE', label: 'Manutenção de Rua' },
  { value: 'GARBAGE_COLLECTION', label: 'Coleta de Lixo' },
  { value: 'SANITATION', label: 'Saneamento' },
  { value: 'INSPECTION', label: 'Fiscalização' },
  { value: 'OTHER', label: 'Outros' },
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CreateDemandDTO>({
    title: '',
    description: '',
    category: '' as DemandCategory,
    location: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateDemandDTO, string>>>({});
  const [preview, setPreview] = useState<string | null>(null);

  function validate() {
    const newErrors: Partial<Record<keyof CreateDemandDTO, string>> = {};
    if (!form.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!form.category) newErrors.category = 'Selecione uma categoria';
    if (!form.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!form.location) newErrors.location = 'Selecione uma localização';
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

  function handleChange(field: keyof CreateDemandDTO, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        handleChange('imageUrl', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box py={8} px={6} maxW="900px" w="full" mx="auto">
      <Heading size="lg" mb={6} color="blue.600">
        Nova Demanda
      </Heading>

      <Box bg="white" borderRadius="lg" p={8} shadow="sm" borderWidth="1px" borderColor="gray.200">
        <Stack gap={5}>
          <Field.Root invalid={!!errors.title}>
            <Field.Label>Título</Field.Label>
            <Input
              placeholder="Ex: Poste apagado na Rua X"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
            <Field.ErrorText>{errors.title}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.category}>
            <Field.Label>Categoria</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value as DemandCategory)}
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
            <Field.ErrorText>{errors.category}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.description}>
            <Field.Label>Descrição</Field.Label>
            <Textarea
              placeholder="Descreva o problema com detalhes..."
              rows={4}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            <Field.ErrorText>{errors.description}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.location}>
            <Field.Label>Localização</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
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
            <Field.ErrorText>{errors.location}</Field.ErrorText>
          </Field.Root>

          <Field.Root>
            <Field.Label>Imagem (Opcional)</Field.Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              display="none"
              ref={fileInputRef}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              w="full"
              mb={2}
            >
              {preview ? 'Alterar Imagem' : 'Selecionar Imagem'}
            </Button>
            {preview && (
              <Box mt={2} position="relative" borderRadius="md" overflow="hidden" borderWidth="1px">
                <Image src={preview} alt="Preview" maxH="300px" w="full" objectFit="cover" />
                <Button
                  size="xs"
                  colorPalette="red"
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={() => {
                    setPreview(null);
                    handleChange('imageUrl', '');
                  }}
                >
                  Remover
                </Button>
              </Box>
            )}
          </Field.Root>

          <Flex gap={3} justify="flex-end" mt={4}>
            <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              colorPalette="blue"
              onClick={handleSubmit}
              loading={isLoading}
              loadingText="Enviando..."
            >
              Cadastrar Demanda
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}