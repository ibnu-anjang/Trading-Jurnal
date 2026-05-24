'use client'

import { useState, KeyboardEvent } from 'react'
import { X, Tag as TagIcon } from 'lucide-react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
}

const COMMON_TAGS = ['A+ setup', 'FOMO', 'Revenge trade', 'News', 'Breakout', 'Reversal', 'Trend follow', 'Scalp', 'Swing']

export default function TagsInput({ tags, onChange, suggestions = COMMON_TAGS, placeholder = 'Ketik tag + Enter...' }: Props) {
  const [input, setInput] = useState('')

  function addTag(raw: string) {
    const t = raw.trim()
    if (!t) return
    if (tags.includes(t)) { setInput(''); return }
    onChange([...tags, t])
    setInput('')
  }

  function removeTag(t: string) {
    onChange(tags.filter(x => x !== t))
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const remainingSuggestions = suggestions.filter(s => !tags.includes(s))

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5 min-h-9 rounded-md border border-zinc-700 bg-zinc-800 focus-within:border-zinc-600">
        <TagIcon className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-1" />
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs">
            {t}
            <button type="button" onClick={() => removeTag(t)} className="text-violet-400/70 hover:text-violet-200">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => addTag(input)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
        />
      </div>
      {remainingSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {remainingSuggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
