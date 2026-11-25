import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DELAY_MS = 300;

type SearchInputProps = {
  value: string;
  /** Called shortly after the user stops typing. */
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
};

export default function SearchInput({ value, onChange, label, placeholder }: SearchInputProps) {
  const [text, setText] = useState(value);
  const [source, setSource] = useState(value);

  // Follow changes made elsewhere, such as the browser's back button.
  if (value !== source) {
    setSource(value);
    setText(value);
  }

  useEffect(() => {
    if (text === value) return;
    const timer = window.setTimeout(() => onChange(text), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [text, value, onChange]);

  return (
    <div className="relative min-w-0 flex-1">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        maxLength={120}
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="pr-11 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear search"
          className="absolute top-1/2 right-0.5 -translate-y-1/2 text-muted-foreground pointer-coarse:size-11 pointer-coarse:right-0 active:not-aria-[haspopup]:-translate-y-1/2"
          onClick={() => {
            setText("");
            onChange("");
          }}
        >
          <X aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
