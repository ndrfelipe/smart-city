import { Field as ChakraField } from "@chakra-ui/react"
import * as React from "react"

export interface FieldProps extends ChakraField.RootProps {
  label?: React.ReactNode
  errorText?: React.ReactNode
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  function Field(props, ref) {
    const { label, children, errorText, ...rest } = props
    return (
      <ChakraField.Root ref={ref} {...rest}>
        {label && <ChakraField.Label>{label}</ChakraField.Label>}
        {children}
        {errorText && <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>}
      </ChakraField.Root>
    )
  }
)