import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createSponsor,
	deleteSponsor,
	getSponsor,
	getSponsors,
	lookupSponsors,
	updateSponsor,
} from "@/lib/api/sponsorship/endpoints";
import type { Sponsor } from "@/lib/api/sponsorship/response";

export function useSponsors(orgId?: string) {
	return useQuery({
		queryKey: ["sponsors", orgId],
		queryFn: () => getSponsors(orgId),
	});
}

export function useSponsor(id: string) {
	return useQuery({
		queryKey: ["sponsor", id],
		queryFn: () => getSponsor(id),
		enabled: !!id,
	});
}

export function useCreateSponsor() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Partial<Sponsor>) => createSponsor(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sponsors"] });
		},
	});
}

export function useUpdateSponsor() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Sponsor> }) =>
			updateSponsor(id, data),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["sponsors"] });
			queryClient.invalidateQueries({
				queryKey: ["sponsor", data.id.toString()],
			});
		},
	});
}

export function useDeleteSponsor() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteSponsor(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sponsors"] });
		},
	});
}

export function useSponsorLookup(search: string) {
	return useQuery({
		queryKey: ["sponsors", "lookup", search],
		queryFn: () => lookupSponsors(search),
		enabled: search.length > 2,
	});
}
