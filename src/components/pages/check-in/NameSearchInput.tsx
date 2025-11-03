import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
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
	disabled: boolean;
}

export function NameSearchInput({ value, onChange, onTicketSelect, disabled }: NameSearchInputProps) {
	const [isSearching, setIsSearching] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [searchResults, setSearchResults] = useState<TicketData[]>([]);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
			<Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
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
					<div className="absolute right-3 top-2.5">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				)}

				{/* Dropdown Results */}
				{showDropdown && searchResults.length > 0 && (
					<div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
						{searchResults.map((ticket) => (
							<button
								key={ticket.publicId}
								type="button"
								onClick={() => handleTicketClick(ticket)}
								disabled={ticket.checkedIn}
								className={`w-full text-left p-3 border-b last:border-b-0 transition-colors ${
									ticket.checkedIn
										? "bg-gray-50 opacity-60 cursor-not-allowed dark:bg-gray-900"
										: "hover:bg-primary/5 cursor-pointer"
								}`}
							>
								<div className="space-y-1">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<p className="font-semibold text-sm truncate">{ticket.name}</p>
											<p className="text-xs text-muted-foreground truncate">{ticket.email}</p>
											{ticket.phone && <p className="text-xs text-muted-foreground">{ticket.phone}</p>}
										</div>
										{ticket.checkedIn && (
											<span className="text-[10px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-1.5 py-0.5 rounded whitespace-nowrap">
												Checked In
											</span>
										)}
									</div>
									<div className="flex gap-1.5 flex-wrap">
										<span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
											{ticket.ticketType}
										</span>
										<span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
											{ticket.eventName}
										</span>
									</div>
								</div>
							</button>
						))}
					</div>
				)}

				{/* No results message */}
				{showDropdown && searchResults.length === 0 && !isSearching && value.trim().length >= 2 && (
					<div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg p-4">
						<div className="text-center space-y-2">
							<p className="text-sm font-medium text-foreground">
								No Ticket Found
							</p>
							<p className="text-xs text-muted-foreground">
								We couldn't find any tickets matching "<span className="font-semibold">{value}</span>"
							</p>
							<p className="text-xs text-muted-foreground">
								Try using your email or phone number instead
							</p>
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
