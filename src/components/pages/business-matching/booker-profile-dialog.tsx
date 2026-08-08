import { Mail, Phone } from "lucide-react";
import type React from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BookerProfileDialogProps {
	name: string;
	email?: string;
	phone?: string;
	description?: string;
	sourcingIntent?: string;
	capabilities?: string;
}

const BookerProfileDialog: React.FC<BookerProfileDialogProps> = ({
	name,
	email,
	phone,
	description,
	sourcingIntent,
	capabilities,
}) => {
	const sections = [
		{ value: "description", label: "Description / Bio", content: description },
		{
			value: "sourcing-intent",
			label: "Sourcing Intent",
			content: sourcingIntent,
		},
		{ value: "capabilities", label: "Capabilities", content: capabilities },
	];
	const availableSections = sections.filter((s) => s.content);

	return (
		<div className="-mt-3 space-y-3">
			<div className="grid gap-0.5">
				<Label className="text-muted-foreground text-xs">Name</Label>
				<div className="font-medium text-sm">{name}</div>
			</div>
			{(email || phone) && (
				<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
					{email && (
						<div className="flex items-center gap-1 text-muted-foreground">
							<Mail className="h-3 w-3 shrink-0" />
							<span className="break-all text-foreground">{email}</span>
						</div>
					)}
					{phone && (
						<div className="flex items-center gap-1 text-muted-foreground">
							<Phone className="h-3 w-3 shrink-0" />
							<span className="text-foreground">{phone}</span>
						</div>
					)}
				</div>
			)}

			{availableSections.length > 0 ? (
				<Tabs
					defaultValue={availableSections[0].value}
					className="border-t pt-2"
				>
					<TabsList
						className="grid w-full"
						style={{
							gridTemplateColumns: `repeat(${availableSections.length}, minmax(0, 1fr))`,
						}}
					>
						{availableSections.map((s) => (
							<TabsTrigger key={s.value} value={s.value}>
								{s.label}
							</TabsTrigger>
						))}
					</TabsList>
					{availableSections.map((s) => (
						<TabsContent key={s.value} value={s.value} className="mt-3">
							<div className="max-h-[300px] overflow-y-auto whitespace-pre-wrap text-foreground text-sm leading-relaxed">
								{s.content}
							</div>
						</TabsContent>
					))}
				</Tabs>
			) : (
				<p className="border-t pt-3 text-muted-foreground text-sm">
					This booker didn't provide any additional profile details.
				</p>
			)}
		</div>
	);
};

export default BookerProfileDialog;
