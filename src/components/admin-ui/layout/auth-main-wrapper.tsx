"use client";
import { Separator } from "@/components/ui/separator";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "./responsive-layout";

interface AuthMainWrapperProps {
	children: React.ReactNode;
}

export function AuthMainWrapper({ children }: AuthMainWrapperProps) {
	return (
		<ResponsiveLayout>
			<DesktopView>
				<header className="flex h-12 flex-row items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex flex-row items-stretch justify-start gap-2 px-12">
						<Separator
							orientation="vertical"
							className="data-[orientation=vertical]:h-12"
						/>
					</div>
					<div className="flex items-center gap-2 px-4" />
					<div className="flex flex-row items-stretch justify-start gap-2 px-12">
						<Separator
							orientation="vertical"
							className="data-[orientation=vertical]:h-12"
						/>
					</div>
				</header>
			</DesktopView>

			<DesktopView>
				<div className="mx-auto w-full px-12">
					<div className="min-h-[calc(100vh-48px)] w-full border-x border-dashed">
						<div className="w-full">{children}</div>
					</div>
				</div>
			</DesktopView>

			<MobileTabletView>
				<div className="mx-auto w-full px-4">
					<div className="min-h-[calc(100vh-48px)] w-full pb-24">
						<div className="w-full">{children}</div>
					</div>
				</div>
			</MobileTabletView>

			<DesktopView>
				<footer className="flex h-12 flex-row items-center justify-between gap-2 border-t transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex flex-row items-stretch justify-start gap-2 px-12">
						<Separator
							orientation="vertical"
							className="data-[orientation=vertical]:h-12"
						/>
					</div>
					<div className="flex flex-row items-stretch justify-start gap-2 px-12">
						<Separator
							orientation="vertical"
							className="data-[orientation=vertical]:h-12"
						/>
					</div>
				</footer>
			</DesktopView>
		</ResponsiveLayout>
	);
}
