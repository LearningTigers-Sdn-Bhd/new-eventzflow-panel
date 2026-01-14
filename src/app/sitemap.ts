import type { MetadataRoute } from "next";
import { getPublicResources } from "@/lib/api/resource/endpoints";
import { getResourceTopics } from "@/lib/api/resource/topic/endpoints";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = "https://eventzflow.com";

	const staticPages: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: `${baseUrl}/auth`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/about`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/privacy-policy`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${baseUrl}/terms-of-service`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${baseUrl}/resources`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
	];

	try {
		// Fetch all published resources (limit to reasonable number for sitemap)
		const resourcesResponse = await getPublicResources({
			page: 1,
			perPage: 1000, // Adjust based on your needs
		});

		// Add individual resource pages
		const resourcePages: MetadataRoute.Sitemap = resourcesResponse.data.map(
			(resource) => ({
				url: `${baseUrl}/resources/${resource.slug}`,
				lastModified: new Date(resource.updatedAt),
				changeFrequency: "monthly",
				priority: 0.7,
			}),
		);

		// Fetch all topics and add topic browsing pages
		const topicsResponse = await getResourceTopics({ filter: "active" });
		const topicPages: MetadataRoute.Sitemap = topicsResponse.data.map(
			(topic) => ({
				url: `${baseUrl}/resources/topics/${topic.slug}`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 0.8,
			}),
		);

		return [...staticPages, ...resourcePages, ...topicPages];
	} catch (error) {
		console.error("Error generating sitemap:", error);
		// Return static pages if dynamic content fetch fails
		return staticPages;
	}
}
