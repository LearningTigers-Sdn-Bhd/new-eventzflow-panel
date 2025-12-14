import { Loader2, Search, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findTicketByContact } from "@/lib/api/ticket/endpoints";

interface TicketData {
	publicId: string;
	name: string;
	email: string;
	phone?: string;
	ticketType: string;
	eventName: string;
	checkedIn: boolean;
}

interface NameSearchInputProps {
	value: string;
	onChange: (value: string) => void;
	onTicketSelect: (ticket: TicketData) => void;
	onRegisterClick?: () => void;
	disabled: boolean;
}

export function NameSearchInput({
	value,
	onChange,
	onTicketSelect,
	onRegisterClick,
	disabled,
}: NameSearchInputProps) {
	const [isSearching, setIsSearching] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [searchResults, setSearchResults] = useState<TicketData[]>([]);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setShowDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Debounced search
	useEffect(() => {
		if (value.trim().length < 2) {
			setSearchResults([]);
			setShowDropdown(false);
			return;
		}

		const timer = setTimeout(async () => {
			setIsSearching(true);
			try {
				const response = await findTicketByContact({
					attendee_name: value.trim(),
				});

				const tickets = Array.isArray(response)
					? response.map((ticket) => ({
							publicId: ticket.publicId,
							name: ticket.name,
							email: ticket.email,
							phone: ticket.phone,
							ticketType: ticket.ticketTypeName,
							eventName: ticket.eventName,
							checkedIn: ticket.checkedIn,
						}))
					: [
							{
								publicId: response.publicId,
								name: response.name,
								email: response.email,
								phone: response.phone,
								ticketType: response.ticketTypeName,
								eventName: response.eventName,
								checkedIn: response.checkedIn,
							},
						];

				setSearchResults(tickets);
				setShowDropdown(true);
			} catch (error) {
				setSearchResults([]);
				setShowDropdown(true);
			} finally {
				setIsSearching(false);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [value]);

	const handleTicketClick = (ticket: TicketData) => {
		onChange(ticket.name);
		setShowDropdown(false);
		onTicketSelect(ticket);
	};

	return (
		<div className="space-y-2">
			<Label
				htmlFor="name"
				className="flex items-center gap-2 font-medium text-sm"
			>
				<Search className="h-4 w-4" />
				Search by Name
			</Label>
			<div className="relative" ref={dropdownRef}>
				<Input
					id="name"
					type="text"
					placeholder="Start typing your name..."
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onFocus={() => {
						if (searchResults.length > 0) setShowDropdown(true);
					}}
					disabled={disabled}
					autoComplete="off"
					autoFocus
					className="h-10"
				/>
				{isSearching && (
					<div className="absolute top-2.5 right-3">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				)}

				{/* Dropdown Results */}
				{showDropdown && searchResults.length > 0 && (
					<div className="absolute z-50 mt-1 max-h-[300px] w-full overflow-y-auto rounded-lg border bg-background shadow-lg">
						{searchResults.map((ticket) => (
							<button
								key={ticket.publicId}
								type="button"
								onClick={() => handleTicketClick(ticket)}
								disabled={ticket.checkedIn}
								className={`w-full border-b p-3 text-left transition-colors last:border-b-0 ${
									ticket.checkedIn
										? "cursor-not-allowed bg-gray-50 opacity-60 dark:bg-gray-900"
										: "cursor-pointer hover:bg-primary/5"
								}`}
							>
								<div className="space-y-1">
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0 flex-1">
											<p className="truncate font-semibold text-sm">
												{ticket.name}
											</p>
										</div>
										{ticket.checkedIn && (
											<span className="whitespace-nowrap rounded bg-red-50 px-1.5 py-0.5 font-medium text-[10px] text-red-600 dark:bg-red-950 dark:text-red-400">
												Checked In
											</span>
										)}
									</div>
									<div className="flex flex-wrap gap-1.5">
										<span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
											{ticket.ticketType}
										</span>
										<span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
											{ticket.eventName}
										</span>
									</div>
								</div>
							</button>
						))}
					</div>
				)}

				{/* No results message */}
				{showDropdown &&
					searchResults.length === 0 &&
					!isSearching &&
					value.trim().length >= 2 && (
						<div className="absolute z-50 mt-1 w-full rounded-lg border bg-background p-4 shadow-lg">
							<div className="space-y-3 text-center">
								<div className="space-y-1">
									<p className="font-medium text-foreground text-sm">
										No Ticket Found
									</p>
									<p className="text-muted-foreground text-xs">
										We couldn't find any tickets matching "
										<span className="font-semibold">{value}</span>"
									</p>
								</div>

								<p className="text-muted-foreground text-xs">
									Try using your email or phone number instead
								</p>

								{onRegisterClick && (
									<div className="space-y-2 pt-1">
										<div className="relative">
											<div className="absolute inset-0 flex items-center">
												<div className="w-full border-border/50 border-t" />
											</div>
											<div className="relative flex justify-center">
												<span className="bg-background px-2 text-muted-foreground text-xs">
													Haven't registered yet?
												</span>
											</div>
										</div>
										<Button
											type="button"
											variant="secondary"
											size="sm"
											onClick={() => {
												setShowDropdown(false);
												onRegisterClick();
											}}
											className="w-full gap-2 border border-primary hover:bg-primary hover:text-white"
										>
											<UserPlus className="h-3.5 w-3.5" />
											Click Here to Register
										</Button>
									</div>
								)}
							</div>
						</div>
					)}
			</div>
			<p className="text-muted-foreground text-xs">
				Type your first name, last name, or full name to see matching tickets
			</p>
		</div>
	);
}
