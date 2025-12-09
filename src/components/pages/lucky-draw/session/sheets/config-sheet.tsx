"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { useLuckyDraw } from "@/hooks/use-lucky-draw";
import type { DrawStyle } from "@/stores/lucky-draw-store";

interface ConfigSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	luckyDraw: ReturnType<typeof useLuckyDraw>;
}

export function ConfigSheet({
	open,
	onOpenChange,
	luckyDraw,
}: ConfigSheetProps) {
	const {
		useGifts,
		drawStyle,
		drawTheme,
		isLoadingConfig,
		setUseGifts,
		setDrawStyle,
		setDrawTheme,
	} = luckyDraw;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2 rounded-none">
					<Settings className="size-4" />
					<span className="hidden text-sm md:block">Settings</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
				<SheetHeader className="gap-0!">
					<SheetTitle>Session Settings</SheetTitle>
					<SheetDescription>
						Configure draw behavior for this session.
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-1 flex-col gap-6 px-4">
					<Card className="gap-0 rounded-none border-primary/20 px-0 pt-4 pb-0 shadow-none">
						<CardHeader className="gap-0! border-b px-4 pt-0! pb-2!">
							<CardTitle className="text-base">Draw Configuration</CardTitle>
							<CardDescription className="text-sm">
								Control how winners are selected.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6 bg-slate-50 py-4">
							<div className="grid grid-cols-3 gap-4">
								<div className="col-span-2">
									<p className="font-semibold">Draw Style</p>
									<p className="text-balance text-muted-foreground text-sm">
										Choose the animation for the draw screen.
									</p>
								</div>
								<div className="col-span-1 flex items-center justify-end">
									<Select
										value={drawStyle}
										onValueChange={(value) => setDrawStyle(value as DrawStyle)}
										disabled={isLoadingConfig}
									>
										<SelectTrigger className="w-full rounded-none bg-background">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="rounded-none border-none">
											<SelectItem value="wheel" className="rounded-none">
												Wheel
											</SelectItem>
											<SelectItem value="slot" className="rounded-none">
												Slot Machine
											</SelectItem>
											<SelectItem value="box" className="rounded-none">
												Mystery Box
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="col-span-2">
									<p className="font-semibold">Draw Theme</p>
									<p className="text-balance text-muted-foreground text-sm">
										Choose the color theme for the draw.
									</p>
								</div>
								<div className="col-span-1 flex items-center justify-end">
									<Select
										value={drawTheme}
										onValueChange={(value) =>
											setDrawTheme(
												value as "wireframe" | "colorful" | "cartoon",
											)
										}
										disabled={isLoadingConfig}
									>
										<SelectTrigger className="w-full rounded-none bg-background">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="rounded-none border-none">
											<SelectItem value="wireframe" className="rounded-none">
												Wireframe
											</SelectItem>
											<SelectItem value="colorful" className="rounded-none">
												Colorful
											</SelectItem>
											<SelectItem value="cartoon" className="rounded-none">
												Cartoon
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="col-span-2">
									<p className="font-semibold">Use Gifts</p>
									<p className="text-balance text-muted-foreground text-sm">
										Assign winners sequentially to gifts when enabled.
									</p>
								</div>
								<div className="col-span-1 flex items-center justify-end">
									<Switch
										checked={useGifts}
										onCheckedChange={setUseGifts}
										disabled={isLoadingConfig}
										className="border-primary/20 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</SheetContent>
		</Sheet>
	);
}
