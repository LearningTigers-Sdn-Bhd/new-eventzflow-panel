import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONFERENCE_KIND_OPTIONS } from "@/lib/constants/public-registration";
import type { ConferenceRegistrationKind } from "@/lib/api/public-registration";

export function ConferenceModeSelector({
  value,
  onChange,
}: {
  value: ConferenceRegistrationKind;
  onChange: (value: ConferenceRegistrationKind) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {CONFERENCE_KIND_OPTIONS.map((option) => {
        const active = value === option.key;

        return (
          <Button
            key={option.key}
            type="button"
            variant={active ? "default" : "outline"}
            className={cn("h-auto flex-col items-start p-3 text-left")}
            onClick={() => onChange(option.key)}
          >
            <span className="font-medium text-sm">{option.title}</span>
            <span className="text-xs opacity-80">{option.description}</span>
          </Button>
        );
      })}
    </div>
  );
}
