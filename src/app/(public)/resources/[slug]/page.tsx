import { cookies } from "next/headers";
import { getPublicResourceBySlug } from "@/lib/api/resource/endpoints";
import { ShowProvider } from "@/components/pages/resources/public/show/show-context";
import ShowHeader from "@/components/pages/resources/public/show/show-header";
import ShowSuggestion from "@/components/pages/resources/public/show/show-suggestion";
import ShowResponseDebug from "@/components/pages/resources/public/show/show-response-debug";
import ShowArticle from "@/components/pages/resources/public/show/show-article";
import { getPublicSession } from "./actions";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params;
	const resource = await getPublicResourceBySlug(slug);
	return {
		title: `${resource.title} - EventzFlow`,
		description: resource.metaDescription,
		openGraph: {
			images: resource.coverImageUrl ? [resource.coverImageUrl] : [],
		},
	};
}

export default async function ResourcePage({ params }: PageProps) {
	const { slug } = await params;
	const resource = await getPublicResourceBySlug(slug);

	// Check access cookie
	const cookieStore = await cookies();
	const hasAccessCookie = cookieStore.get(`resource-access-${resource.id}`);
	const hasAccess = !resource.isGated || !!hasAccessCookie;

	const initialSession = await getPublicSession();

	return (
		<ShowProvider resourceId={resource.id} initialSession={initialSession}>
			<main className="min-h-screen bg-white">
				<ShowHeader resource={resource} />

				<ShowArticle resource={resource} hasAccess={hasAccess} />

				<ShowResponseDebug resource={resource} />

				<ShowSuggestion suggestions={resource.suggestions ?? []} />
			</main>
		</ShowProvider>
	);
}
