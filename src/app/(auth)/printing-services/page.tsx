"use client";

import { useQuery } from "@tanstack/react-query";
import PrintingServiceClientWrapper from "@/components/pages/printing-services/printing-service-client-wrapper";
import { getPrintingServices } from "@/lib/api/printing-service";

export default function PrintingServicesPage() {
	const {
		data: services,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["printing-services"],
		queryFn: getPrintingServices,
	});

	return (
		<div className="space-y-6 p-0">
			<PrintingServiceClientWrapper
				services={services ?? []}
				isLoading={isLoading}
				error={error}
			/>
		</div>
	);
}
