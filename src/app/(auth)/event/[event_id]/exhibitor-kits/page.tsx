"use client";

import {
	LayoutGrid,
	List,
	Package,
	Search,
	ShoppingCart,
	UsersRound,
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { EmptyState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCurrentUserEventVendorId } from "@/hooks/use-event-vendors";

const kitActions = [
	["Manage Items", "my-items"],
	["Order Items", "order-items"],
	["Manage Team", "team-members"],
] as const;

export default function ExhibitorKitsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
	const [search, setSearch] = useState("");
	const { eventVendor, isLoading } = useCurrentUserEventVendorId(
		Number(event_id),
	);
	const kits = eventVendor?.exhibitor_kits ?? [];
	const hasZone = kits.some((kit) => kit.exhibitor_booth_price_zone);
	const normalizedSearch = search.trim().toLowerCase();
	const filteredKits = kits.filter((kit) =>
		[
			kit.name_on_fascia,
			kit.company_name,
			kit.booth_number,
			kit.exhibitor_booth_price_label,
			kit.exhibitor_booth_price_zone,
			kit.booth_type,
		]
			.filter(Boolean)
			.some((value) => value?.toLowerCase().includes(normalizedSearch)),
	);

	if (isLoading)
		return <p className="px-4 py-6 text-muted-foreground">Loading booths...</p>;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 border border-dashed bg-accent px-0 py-0 md:px-2 md:py-4 lg:flex-row lg:items-center lg:px-4">
				<div className="relative w-full flex-1">
					<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search booths..."
						className="rounded-none bg-background pl-9"
					/>
				</div>
				{kits.length > 0 && (
					<fieldset className="flex w-full shrink-0 border bg-background p-1 lg:w-fit">
						<legend className="sr-only">Booth view</legend>
						<Button
							variant={viewMode === "cards" ? "secondary" : "ghost"}
							size="sm"
							className="h-8 flex-1 rounded-none px-3 lg:flex-none"
							onClick={() => setViewMode("cards")}
							aria-pressed={viewMode === "cards"}
						>
							<LayoutGrid className="mr-2 size-4" />
							Cards
						</Button>
						<Button
							variant={viewMode === "table" ? "secondary" : "ghost"}
							size="sm"
							className="h-8 flex-1 rounded-none px-3 lg:flex-none"
							onClick={() => setViewMode("table")}
							aria-pressed={viewMode === "table"}
						>
							<List className="mr-2 size-4" />
							Table
						</Button>
					</fieldset>
				)}
			</div>

			<div className="min-h-[calc(100vh-320px)]">
				{kits.length === 0 ? (
					<EmptyState
						icon={<Package />}
						title="No booths found"
						description="Your registered exhibitor booths will appear here."
					/>
				) : filteredKits.length === 0 ? (
					<EmptyState
						icon={<Search />}
						title="No matching booths"
						description="Try another booth name, number, or package."
					/>
				) : viewMode === "table" ? (
					<div className="overflow-x-auto border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Booth</TableHead>
									<TableHead>Number</TableHead>
									<TableHead>Package</TableHead>
									{hasZone && <TableHead>Zone</TableHead>}
									<TableHead>Payment</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredKits.map((kit) => (
									<TableRow key={kit.id}>
										<TableCell className="min-w-64">
											<p className="font-semibold text-base">
												{kit.name_on_fascia || kit.company_name}
											</p>
											<p className="text-muted-foreground text-xs">
												{kit.company_name}
											</p>
										</TableCell>
										<TableCell>{kit.booth_number || "Not assigned"}</TableCell>
										<TableCell>
											{kit.exhibitor_booth_price_label ||
												kit.booth_type.replace(/_/g, " ")}
										</TableCell>
										{hasZone && (
											<TableCell>
												{kit.exhibitor_booth_price_zone || "-"}
											</TableCell>
										)}
										<TableCell>
											<PaymentBadge status={kit.payment_status} />
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end">
												<KitActions eventId={event_id} kitId={kit.id} />
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : (
					<div className="min-h-[calc(100vh-320px)] border p-4">
						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
							{filteredKits.map((kit, index) => (
								<Card
									key={kit.id}
									className="group h-full overflow-hidden rounded-none border-l-4 border-l-primary transition-colors hover:bg-accent/20"
								>
									<CardHeader className="border-b bg-muted/20 pb-4">
										<div className="flex items-start justify-between gap-4">
											<div className="flex min-w-0 items-center gap-3">
												<div className="flex size-10 shrink-0 items-center justify-center border bg-background font-bold text-primary">
													{String(index + 1).padStart(2, "0")}
												</div>
												<div className="min-w-0">
													<p className="text-muted-foreground text-xs uppercase tracking-wider">
														{kit.exhibitor_booth_price_zone ||
															"Exhibitor Booth"}
													</p>
													<CardTitle className="truncate text-lg">
														{kit.name_on_fascia || kit.company_name}
													</CardTitle>
												</div>
											</div>
											<PaymentBadge status={kit.payment_status} />
										</div>
									</CardHeader>
									<CardContent className="space-y-4 pt-5">
										<div className="grid grid-cols-2 gap-3 text-sm">
											<div className="border-l-2 pl-3">
												<p className="text-muted-foreground text-xs">Package</p>
												<p className="font-medium capitalize">
													{kit.exhibitor_booth_price_label ||
														kit.booth_type.replace(/_/g, " ")}
												</p>
											</div>
											<div className="border-l-2 pl-3">
												<p className="text-muted-foreground text-xs">
													Booth Number
												</p>
												<p className="font-medium">
													{kit.booth_number || "Not assigned"}
												</p>
											</div>
										</div>
										<div className="flex justify-end border-t pt-4">
											<KitActions eventId={event_id} kitId={kit.id} />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function PaymentBadge({ status }: { status: string }) {
	const paid =
		status === "paid" || status === "waived" || status === "sponsored";
	return (
		<Badge
			variant={paid ? "default" : "secondary"}
			className="shrink-0 rounded-none capitalize"
		>
			{status}
		</Badge>
	);
}

function KitActions({ eventId, kitId }: { eventId: string; kitId: number }) {
	return (
		<TooltipProvider>
			<ButtonGroup>
				{kitActions.map(([label, route]) => {
					const Icon =
						route === "my-items"
							? Package
							: route === "order-items"
								? ShoppingCart
								: UsersRound;
					return (
						<Tooltip key={route}>
							<TooltipTrigger asChild>
								<Button
									asChild
									size="icon-sm"
									variant="outline"
									className="h-8 w-8 rounded-none p-0"
								>
									<Link
										href={`/event/${eventId}/exhibitor-kits/${kitId}/${route}`}
									>
										<Icon className="size-4" />
										<span className="sr-only">{label}</span>
									</Link>
								</Button>
							</TooltipTrigger>
							<TooltipContent className="rounded-none">{label}</TooltipContent>
						</Tooltip>
					);
				})}
			</ButtonGroup>
		</TooltipProvider>
	);
}
