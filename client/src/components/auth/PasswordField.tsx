import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

import TextField, { type TextFieldProps } from "@/components/auth/TextField";
import { Button } from "@/components/ui/button";

export default function PasswordField(props: Omit<TextFieldProps, "type" | "icon" | "trailing">) {
  const [visible, setVisible] = useState(false);
  const action = `${visible ? "Hide" : "Show"} ${props.label.toLowerCase()}`;

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      icon={LockKeyhole}
      trailing={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground active:not-aria-[haspopup]:-translate-y-1/2"
          onClick={() => setVisible((value) => !value)}
          aria-label={action}
          title={action}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      }
    />
  );
}
