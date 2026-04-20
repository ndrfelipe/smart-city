import { Input } from "@chakra-ui/react"
import { Field } from "../ui/field"

interface InputFieldProps {
  label: string;
  error?: string;
  placeholder?: string;
  type?: string;
}

export const InputField = ({ label, error, ...rest }: InputFieldProps) => {
  return (
    /* Componente de campo com suporte a acessibilidade e erros */
    <Field label={label} invalid={!!error} errorText={error} mb="4">
      <Input {...rest} variant="outline" />
    </Field>
  )
}