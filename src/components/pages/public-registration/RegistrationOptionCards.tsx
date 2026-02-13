import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PublicRegistrationFormItem } from "@/lib/api/public-registration";

export function RegistrationOptionCards({
  eventSlug,
  forms,
}: {
  eventSlug: string;
  forms: PublicRegistrationFormItem[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {forms.map((form) => (
        <Card key={form.slug} className="h-full">
          <CardHeader>
            <CardTitle>{form.name}</CardTitle>
            {form.description ? (
              <CardDescription>{form.description}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Complete this registration in under 2 minutes.
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link
                href={`/events/${encodeURIComponent(eventSlug)}/register/${encodeURIComponent(form.slug)}`}
              >
                Continue
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
