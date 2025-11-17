"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = "Buscar..." }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSearch = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  const handleClear = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
        <Input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10 bg-white border-primary/30 text-foreground"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-foreground/50 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
