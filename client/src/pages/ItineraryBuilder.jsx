import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'

const sectionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  dateFrom: z.string().min(1, 'Start date is required'),
  dateTo: z.string().min(1, 'End date is required'),
  budget: z.string().min(1, 'Budget is required').refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be a valid amount'),
}).refine((d) => new Date(d.dateFrom) <= new Date(d.dateTo), {
  message: 'End date must be after start date',
  path: ['dateTo'],
})

const schema = z.object({
  sections: z.array(sectionSchema).min(1, 'At least one section is required'),
})

function FieldError({ message }) {
  return message ? <p className="text-xs text-red-400 mt-0.5">{message}</p> : null
}

export default function ItineraryBuilder() {
  const navigate = useNavigate()
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      sections: [
        { title: 'Section 1', description: '', dateFrom: '', dateTo: '', budget: '' },
        { title: 'Section 2', description: '', dateFrom: '', dateTo: '', budget: '' },
        { title: 'Section 3', description: '', dateFrom: '', dateTo: '', budget: '' },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'sections' })

  const onSubmit = () => navigate('/itinerary/view')

  const inputCls = (err) =>
    `text-xs text-primary bg-transparent focus:outline-none w-full transition-all ${err ? 'placeholder:text-red-300' : 'placeholder:text-zinc-400'}`

  return (
    <div className="flex flex-col gap-5 pb-10 max-w-2xl mx-auto">

      <div>
        <h1 className="text-xl font-bold text-primary">Build Itinerary</h1>
        <p className="text-sm text-secondary mt-0.5">Add sections for each part of your trip</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {fields.map((field, idx) => {
          const err = errors.sections?.[idx]
          return (
            <div key={field.id} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col gap-4">

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <input
                    {...register(`sections.${idx}.title`)}
                    className={`text-sm font-semibold text-primary bg-transparent focus:outline-none border-b transition-all w-40 ${err?.title ? 'border-red-400' : 'border-transparent focus:border-zinc-300'}`}
                  />
                  <FieldError message={err?.title?.message} />
                </div>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(idx)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                <textarea
                  rows={2}
                  {...register(`sections.${idx}.description`)}
                  placeholder="All the necessary information about this section. This can be anything like travel section, hotel or any other activity"
                  className={`w-full text-sm text-secondary bg-zinc-50 border rounded-lg px-3.5 py-2.5 resize-none placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${err?.description ? 'border-red-400 focus:ring-red-200' : 'border-zinc-100 focus:ring-blue-200'}`}
                />
                <FieldError message={err?.description?.message} />
              </div>

              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-0.5 flex-1">
                  <div className={`flex items-center gap-2 border rounded-lg px-3.5 py-2.5 bg-zinc-50 ${err?.dateFrom || err?.dateTo ? 'border-red-400' : 'border-zinc-200'}`}>
                    <span className="text-xs text-secondary whitespace-nowrap">Date Range:</span>
                    <input type="date" {...register(`sections.${idx}.dateFrom`)} className={inputCls(err?.dateFrom)} />
                    <span className="text-xs text-secondary">to</span>
                    <input type="date" {...register(`sections.${idx}.dateTo`)} className={inputCls(err?.dateTo)} />
                  </div>
                  <FieldError message={err?.dateFrom?.message || err?.dateTo?.message} />
                </div>

                <div className="flex flex-col gap-0.5 flex-1">
                  <div className={`flex items-center gap-2 border rounded-lg px-3.5 py-2.5 bg-zinc-50 ${err?.budget ? 'border-red-400' : 'border-zinc-200'}`}>
                    <span className="text-xs text-secondary whitespace-nowrap">Budget:</span>
                    <input type="number" placeholder="0.00" {...register(`sections.${idx}.budget`)} className={inputCls(err?.budget)} />
                    <span className="text-xs text-secondary">$</span>
                  </div>
                  <FieldError message={err?.budget?.message} />
                </div>
              </div>

            </div>
          )
        })}

        <button
          type="button"
          onClick={() => append({ title: `Section ${fields.length + 1}`, description: '', dateFrom: '', dateTo: '', budget: '' })}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-zinc-300 text-sm font-medium text-secondary hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
        >
          <Plus size={15} /> Add another Section
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all disabled:opacity-50"
          style={{ background: '#4285F4' }}
        >
          {isSubmitting ? 'Saving...' : 'Save Itinerary'}
        </button>
      </form>

    </div>
  )
}
