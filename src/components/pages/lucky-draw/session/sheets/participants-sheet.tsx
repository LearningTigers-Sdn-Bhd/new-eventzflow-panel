"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import type { useLuckyDraw } from "@/hooks/use-lucky-draw";

interface ParticipantsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	luckyDraw: ReturnType<typeof useLuckyDraw>;
}

export function ParticipantsSheet({
	open,
	onOpenChange,
	luckyDraw,
}: ParticipantsSheetProps) {
	// Get participants directly from the hook
	const { participants } = luckyDraw;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2 rounded-none">
					<Users className="size-4" />
					<span className="hidden text-sm md:block">
						Participants ({participants.length})
					</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="flex w-full flex-col sm:max-w-md">
				<SheetHeader className="gap-0! border-b">
					<SheetTitle>Participant List</SheetTitle>
					<SheetDescription>
						View available participants for the lucky draw
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-1 flex-col gap-4 px-4">
					{/* Participants list */}
					<ScrollArea className="h-[calc(100vh-200px)]">
						<div className="flex flex-col gap-1">
							{participants.length === 0 ? (
								<div className="py-8 text-center text-muted-foreground text-sm">
									No participants available
								</div>
							) : (
								participants.map((participant) => (
									<Card
										key={participant.publicId}
										className="rounded-none border-primary/20 p-0 shadow-none"
									>
										<CardContent className="px-4 py-1.5">
											<div className="font-medium text-sm">
												{participant.name}
											</div>
										</CardContent>
									</Card>
								))
							)}
						</div>
					</ScrollArea>
				</div>
			</SheetContent>
		</Sheet>
	);
}
