"use client";

import { useQuery } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import { getResourceCategories } from "@/lib/api/resource/category";
import { getResourceMediaTypes } from "@/lib/api/resource/media-type";
import { getResourceTopics } from "@/lib/api/resource/topic";

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		post: "Post",
		author: "Author",
		status: "Status",
		options: "Options",
		publishedAt: "Published",
		createdAt: "Submitted",
	};

	return standardLabels[columnId] || columnId;
}

export function PostApprovalTableControl<TData>({
	table,
}: {
	table: Table<TData>;
}) {
	const { data: categoriesData } = useQuery({
		queryKey: ["resource-categories"],
		queryFn: () => getResourceCategories({ filter: "all" }),
	});

	const { data: topicsData } = useQuery({
		queryKey: ["resource-topics"],
		queryFn: () => getResourceTopics({ filter: "all" }),
	});

	const { data: mediaTypesData } = useQuery({
		queryKey: ["resource-media-types"],
		queryFn: () => getResourceMediaTypes({ filter: "all" }),
	});

	const categories = categoriesData?.data;
	const topics = topicsData?.data;
	const mediaTypes = mediaTypesData?.data;

	const topicFilterValue =
		(table.getColumn("topic")?.getFilterValue() as string) ?? "all";
	const categoryFilterValue =
		(table.getColumn("category")?.getFilterValue() as string) ?? "all";
	const mediaTypeFilterValue =
		(table.getColumn("mediaType")?.getFilterValue() as string) ?? "all";

	const topicFilter: ControlConfig = useMemo(
		() => ({
			label: "Topic",
			columnId: "topic",
			type: "filter",
			data: [
				{ label: "All Topics", value: "all" },
				...(topics?.map((t) => ({ label: t.name, value: t.name })) || []),
			],
			customFilter: {
				value: topicFilterValue,
				onChange: (value: string) => {
					table
						.getColumn("topic")
						?.setFilterValue(value === "all" ? undefined : value);
				},
			},
		}),
		[topics, topicFilterValue, table],
	);

	const categoryFilter: ControlConfig = useMemo(
		() => ({
			label: "Category",
			columnId: "category",
			type: "filter",
			data: [
				{ label: "All Categories", value: "all" },
				...(categories?.map((c) => ({ label: c.name, value: c.name })) || []),
			],
			customFilter: {
				value: categoryFilterValue,
				onChange: (value: string) => {
					table
						.getColumn("category")
						?.setFilterValue(value === "all" ? undefined : value);
				},
			},
		}),
		[categories, categoryFilterValue, table],
	);

	const mediaTypeFilter: ControlConfig = useMemo(
		() => ({
			label: "Media Type",
			columnId: "mediaType",
			type: "filter",
			data: [
				{ label: "All Types", value: "all" },
				...(mediaTypes?.map((m) => ({ label: m.name, value: m.name })) || []),
			],
			customFilter: {
				value: mediaTypeFilterValue,
				onChange: (value: string) => {
					table
						.getColumn("mediaType")
						?.setFilterValue(value === "all" ? undefined : value);
				},
			},
		}),
		[mediaTypes, mediaTypeFilterValue, table],
	);

	const desktopControlConfigs: ControlConfig[] = useMemo(
		() => [
			topicFilter,
			categoryFilter,
			mediaTypeFilter,
			{
				label: "Columns",
				columnId: "visibility",
				type: "visibility",
				getColumnLabel,
				excludeColumns: [
					"topic",
					"category",
					"mediaType",
					"slug",
					"metaDescription",
					"authorEmail",
					"authorPhone",
				],
			},
		],
		[topicFilter, categoryFilter, mediaTypeFilter],
	);

	const mobileControlConfigs: ControlConfig[] = useMemo(
		() => [
			{ ...topicFilter, topPriority: true },
			{ ...categoryFilter, topPriority: true },
			{ ...mediaTypeFilter, topPriority: true },
		],
		[topicFilter, categoryFilter, mediaTypeFilter],
	);

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search pending posts...",
					enableCustomSearch: true,
					columns: [
						"title",
						"slug",
						"metaDescription",
						"author",
						"authorEmail",
						"authorPhone",
					],
				},
			}}
			desktopConfig={{
				controlConfigs: desktopControlConfigs,
			}}
			mobileConfig={{
				controlConfigs: mobileControlConfigs,
			}}
		/>
	);
}
