import BranchCTASection from "@/components/pages/resources/public/featured/branch-cta-section";
import ShowArticle from "@/components/pages/resources/public/show/show-article";
import { ShowContentWrapper } from "@/components/pages/resources/public/show/show-content-wrapper";
import { ShowProvider } from "@/components/pages/resources/public/show/show-context";
import ShowHeader from "@/components/pages/resources/public/show/show-header";
import ShowSuggestion from "@/components/pages/resources/public/show/show-suggestion";
import { ScrollToTop } from "@/components/scroll-to-top";
import { getPublicResourceBySlug } from "@/lib/api/resource/endpoints";
import { getPublicSession, hasGatedAccess } from "./actions";

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
			images: resource.headerImgUrl ? [resource.headerImgUrl] : [],
		},
	};
}

export default async function ResourcePage({ params }: PageProps) {
	const { slug } = await params;
	const resource = await getPublicResourceBySlug(slug);

	// Check gated access using centralized server action
	const hasAccess = !resource.isGated || (await hasGatedAccess(resource.id));

	const initialSession = await getPublicSession();

	return (
		<ShowProvider resourceId={resource.id} initialSession={initialSession}>
			<ScrollToTop />
			<main className="min-h-screen bg-white">
				<ShowHeader resource={resource} />

				<ShowContentWrapper>
					<ShowArticle resource={resource} hasAccess={hasAccess} />
					<ShowSuggestion suggestions={resource.suggestions ?? []} />
					<BranchCTASection />
				</ShowContentWrapper>
			</main>
		</ShowProvider>
	);
}
