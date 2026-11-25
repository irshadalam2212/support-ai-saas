import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type TermsCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
};

export default function TermsCheckbox({ checked, onCheckedChange, error }: TermsCheckboxProps) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="mt-0.5"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "terms-error" : undefined}
        />
        <Label htmlFor="terms" className="cursor-pointer text-sm leading-5 font-normal text-muted-foreground">
          I agree to the Terms of Service and Privacy Policy.
        </Label>
      </div>
      {error && <p id="terms-error" className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
