"use client";

import { Copy, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

interface BookerProfileSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	name: string;
	email?: string;
	phone?: string;
	description?: string;
	sourcingIntent?: string;
	capabilities?: string;
}

function ContactRow({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-center justify-between gap-2 border bg-muted/20 px-3 py-2">
			<span className="flex min-w-0 items-center gap-2 text-sm">
				<span className="shrink-0 text-muted-foreground">{icon}</span>
				<span className="break-all">{value}</span>
			</span>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="shrink-0 rounded-none text-muted-foreground"
				title={`Copy ${label}`}
				onClick={() => {
					navigator.clipboard.writeText(value);
					toast.success(`${label} copied to clipboard`);
				}}
			>
				<Copy className="size-3.5" />
			</Button>
		</div>
	);
}

export default function BookerProfileSheet({
	open,
	onOpenChange,
	name,
	email,
	phone,
	description,
	sourcingIntent,
	capabilities,
}: BookerProfileSheetProps) {
	const initials = name
		.split(" ")
		.map((w) => w[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	const sections = [
		{ label: "About", content: description },
		{ label: "Sourcing intent", content: sourcingIntent },
		{ label: "Capabilities", content: capabilities },
	];

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full gap-0 p-0 sm:max-w-md">
				<SheetHeader className="shrink-0 border-b">
					<div className="flex items-center gap-3 pr-8">
						<Avatar className="h-12 w-12">
							<AvatarFallback className="bg-primary/10 font-semibold text-base text-primary">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<SheetTitle className="truncate text-lg">{name}</SheetTitle>
							<SheetDescription>Booker profile</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<div className="flex-1 space-y-6 overflow-y-auto p-4">
					{(email || phone) && (
						<div className="space-y-2">
							<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
								Contact
							</h4>
							{email && (
								<ContactRow
									icon={<Mail className="size-4" />}
									label="Email"
									value={email}
								/>
							)}
							{phone && (
								<ContactRow
									icon={<Phone className="size-4" />}
									label="Phone"
									value={phone}
								/>
							)}
						</div>
					)}

					{sections.map((s) => (
						<div key={s.label} className="space-y-2">
							<h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
								{s.label}
							</h4>
							{s.content ? (
								<p className="whitespace-pre-wrap break-words border bg-muted/20 p-3 text-sm leading-relaxed">
									{s.content}
								</p>
							) : (
								<p className="border border-dashed p-3 text-muted-foreground text-sm">
									Not provided
								</p>
							)}
						</div>
					))}
				</div>
			</SheetContent>
		</Sheet>
	);
}
