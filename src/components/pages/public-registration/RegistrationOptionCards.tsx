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
import type { RegistrationOption } from "@/lib/constants/public-registration";

export function RegistrationOptionCards({
  eventSlug,
  options,
}: {
  eventSlug: string;
  options: RegistrationOption[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {options.map((option) => (
        <Card key={option.key} className="h-full">
          <CardHeader>
            <CardTitle>{option.title}</CardTitle>
            <CardDescription>{option.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Complete this registration in under 2 minutes.
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/events/${eventSlug}/register/${option.key}`}>
                Continue
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
