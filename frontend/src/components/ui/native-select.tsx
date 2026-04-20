import { NativeSelect as ChakraNativeSelect } from "@chakra-ui/react"
import * as React from "react"

export const NativeSelectField = React.forwardRef<
  HTMLSelectElement,
  ChakraNativeSelect.FieldProps
>(function NativeSelectField(props, ref) {
  return (
    <ChakraNativeSelect.Root>
      <ChakraNativeSelect.Field ref={ref} {...props} />
      <ChakraNativeSelect.Indicator />
    </ChakraNativeSelect.Root>
  )
})