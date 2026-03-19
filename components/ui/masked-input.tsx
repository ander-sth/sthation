"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Funções de máscara
export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

export function maskCNPJ(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

export function maskCPFOrCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "")
  if (digits.length <= 11) {
    return maskCPF(value)
  }
  return maskCNPJ(value)
}

export function maskPhone(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1")
}

export function maskCEP(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1")
}

export function maskDate(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\/\d{4})\d+?$/, "$1")
}

export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, "")
  const number = parseInt(digits || "0", 10) / 100
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

// Função para extrair apenas dígitos
export function unmask(value: string): string {
  return value.replace(/\D/g, "")
}

type MaskType = "cpf" | "cnpj" | "cpf-cnpj" | "phone" | "cep" | "date" | "currency"

const maskFunctions: Record<MaskType, (value: string) => string> = {
  cpf: maskCPF,
  cnpj: maskCNPJ,
  "cpf-cnpj": maskCPFOrCNPJ,
  phone: maskPhone,
  cep: maskCEP,
  date: maskDate,
  currency: maskCurrency,
}

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  mask: MaskType
  onValueChange?: (value: string, rawValue: string) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, value, onValueChange, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")

    React.useEffect(() => {
      if (value !== undefined) {
        const maskFn = maskFunctions[mask]
        setDisplayValue(maskFn(String(value)))
      }
    }, [value, mask])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const maskFn = maskFunctions[mask]
      const masked = maskFn(inputValue)
      const raw = unmask(inputValue)

      setDisplayValue(masked)

      if (onValueChange) {
        onValueChange(masked, raw)
      }

      if (onChange) {
        // Criar evento sintético com valor mascarado
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: masked,
          },
        }
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>)
      }
    }

    return (
      <Input
        ref={ref}
        className={cn(className)}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

MaskedInput.displayName = "MaskedInput"
