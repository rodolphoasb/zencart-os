import { useState } from 'react'
import { Input } from './input'

export function MoneyInput({
  defaultValue,
  id,
  name,
  placeholder,
}: {
  defaultValue?: string
  id: string
  name: string
  placeholder: string
}) {
  const [value, setValue] = useState(defaultValue ?? '')

  // Function to format input as Brazilian Real currency
  function formatCurrency(value: string) {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '')
    // Convert to number and format as currency
    const formattedValue = (Number(numericValue) / 100).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      },
    )
    return formattedValue
  }

  // Handle changes in the input
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    const onlyDigits = value.replace(/\D/g, '')
    if (onlyDigits.length <= 10) {
      // Preventing overflow
      const formattedValue = formatCurrency(value)
      setValue(formattedValue)
    }
  }

  return (
    <Input
      id={id}
      name={name}
      placeholder={placeholder}
      value={formatCurrency(value)}
      onChange={handleChange}
    />
  )
}
