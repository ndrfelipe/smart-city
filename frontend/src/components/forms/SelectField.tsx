import { Field } from "../ui/field"
import { NativeSelectField } from "../ui/native-select"

interface SelectFieldProps {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const SelectField = ({ label, options, error, ...rest }: SelectFieldProps) => {
  return (
    /* Componente de seleção com suporte a acessibilidade e erros */
    <Field label={label} invalid={!!error} errorText={error} mb="4">
      <NativeSelectField {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </NativeSelectField>
    </Field>
  )
}