"use client";

import { useQuery } from "@tanstack/react-query";
import ContractorClientWrapper from "@/components/pages/exhibitor-contractor/contractor-client-wrapper";
import { getContractors } from "@/lib/api/contractor";

export default function ExhibitorContractorPage() {
	const {
		data: contractors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["contractors"],
		queryFn: getContractors,
	});

	return (
		<div className="space-y-6 p-0">
			<ContractorClientWrapper
				contractors={contractors ?? []}
				isLoading={isLoading}
				error={error}
			/>
		</div>
	);
}
