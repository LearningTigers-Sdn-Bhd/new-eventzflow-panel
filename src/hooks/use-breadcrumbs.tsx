"use client";

import { type Fragment, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItemType {
	label: string;
	href?: string;
}

export function useBreadcrumbs(items: BreadcrumbItemType[]) {
	useEffect(() => {
		const container = document.getElementById("breadcrumb-container");
		if (!container) return;

		const elements: React.ReactNode[] = [];
		items.forEach((item, index) => {
			const isLast = index === items.length - 1;

			elements.push(
				<BreadcrumbItem key={`item-${index}`}>
					{isLast || !item.href ? (
						<BreadcrumbPage>{item.label}</BreadcrumbPage>
					) : (
						<BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
					)}
				</BreadcrumbItem>,
			);

			if (!isLast) {
				elements.push(<BreadcrumbSeparator key={`sep-${index}`} />);
			}
		});

		const root = createRoot(container);
		root.render(
			<Breadcrumb>
				<BreadcrumbList>{elements}</BreadcrumbList>
			</Breadcrumb>,
		);

		return () => {
			root.unmount();
		};
	}, [items]);
}
