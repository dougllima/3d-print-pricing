import { zodResolver } from '@hookform/resolvers/zod'
import { Save, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useRepositories } from '@/app/useRepositories'
import type { GlobalSettings } from '@/shared/types'
import { defaultSettings } from '@/shared/types'

import {
  settingsFormSchema,
  type SettingsFormInputValues,
  type SettingsFormValues,
} from './settingsFormSchema'

const emptyFormValues: SettingsFormInputValues = {
  electricityCostPerKwh: 0,
  defaultProfitMarginPercent: 40,
  defaultFailureRatePercent: 5,
  defaultLaborHourlyRate: 0,
  defaultMinimumPrice: undefined,
}

function toFormValues(settings: GlobalSettings): SettingsFormInputValues {
  return {
    electricityCostPerKwh: settings.electricityCostPerKwh,
    defaultProfitMarginPercent: settings.defaultProfitMarginPercent,
    defaultFailureRatePercent: settings.defaultFailureRatePercent,
    defaultLaborHourlyRate: settings.defaultLaborHourlyRate,
    defaultMinimumPrice: settings.defaultMinimumPrice,
  }
}

export function SettingsPage() {
  const repositories = useRepositories()
  const [savedMessage, setSavedMessage] = useState<string | undefined>()
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<SettingsFormInputValues, unknown, SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: emptyFormValues,
  })

  useEffect(() => {
    let shouldUpdate = true

    repositories.settings
      .get()
      .then((settings) => {
        if (shouldUpdate) {
          reset(toFormValues(settings))
        }
      })
      .catch(() => {
        if (shouldUpdate) {
          reset(toFormValues(defaultSettings))
        }
      })

    return () => {
      shouldUpdate = false
    }
  }, [repositories.settings, reset])

  async function submit(values: SettingsFormValues) {
    await repositories.settings.save({
      currency: 'BRL',
      electricityCostPerKwh: values.electricityCostPerKwh,
      defaultProfitMarginPercent: values.defaultProfitMarginPercent,
      defaultFailureRatePercent: values.defaultFailureRatePercent,
      defaultLaborHourlyRate: values.defaultLaborHourlyRate,
      defaultMinimumPrice: values.defaultMinimumPrice,
    })
    setSavedMessage('Configurações salvas.')
  }

  async function resetSettings() {
    const settings = await repositories.settings.reset()

    reset(toFormValues(settings))
    setSavedMessage('Configurações restauradas.')
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-[#d8dee2] bg-white px-5 py-5 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1f7a78]">Configurações</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#17202a]">Parâmetros globais</h1>
          </div>
          {savedMessage && (
            <div className="rounded-md border border-[#d8dee2] bg-[#fbfcfd] px-3 py-2 text-sm text-[#52616b]">
              {savedMessage}
            </div>
          )}
        </div>
      </header>

      <form
        className="mx-5 max-w-3xl rounded-md border border-[#d8dee2] bg-white p-5 shadow-sm md:mx-8"
        onSubmit={handleSubmit(submit)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['electricityCostPerKwh', 'Energia por kWh'],
            ['defaultProfitMarginPercent', 'Margem padrão'],
            ['defaultFailureRatePercent', 'Taxa de falha padrão'],
            ['defaultLaborHourlyRate', 'Mão de obra por hora'],
            ['defaultMinimumPrice', 'Preço mínimo'],
          ].map(([fieldName, label]) => (
            <label className="space-y-1 text-sm font-medium text-[#34434d]" key={fieldName}>
              {label}
              <input
                className="mt-1 w-full rounded-md border border-[#cfd7dc] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f7a78]"
                min="0"
                step="0.01"
                type="number"
                {...register(fieldName as keyof SettingsFormInputValues, { valueAsNumber: true })}
              />
              {errors[fieldName as keyof SettingsFormValues] && (
                <span className="block text-xs text-[#b42318]">
                  {errors[fieldName as keyof SettingsFormValues]?.message}
                </span>
              )}
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-[#163b45] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Salvar configurações
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-[#cfd7dc] bg-white px-4 py-2 text-sm font-medium text-[#34434d]"
            onClick={() => void resetSettings()}
            type="button"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restaurar padrão
          </button>
        </div>
      </form>
    </div>
  )
}
