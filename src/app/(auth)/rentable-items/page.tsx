"use client";

import { useQuery } from "@tanstack/react-query";
import RentableItemClientWrapper from "@/components/pages/rentable-items/rentable-item-client-wrapper";
import { getRentableItems } from "@/lib/api/rentable-item";

export default function RentableItemsPage() {
	const {
		data: items,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["rentable-items"],
		queryFn: getRentableItems,
	});

	return (
		<div className="space-y-6 p-0">
			<RentableItemClientWrapper
				items={items ?? []}
				isLoading={isLoading}
				error={error}
			/>
		</div>
	);
}
