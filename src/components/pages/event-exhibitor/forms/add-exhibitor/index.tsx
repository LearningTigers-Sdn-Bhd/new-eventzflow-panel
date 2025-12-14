"use client";

import { useState } from "react";
import GroupAddForm from "./group-add-form";
import ManualAddForm from "./manual-add-form";
import AddExhibitorNavigation from "./navigation";

interface AddExhibitorModalProps {
	eventId: number;
	onClose?: () => void;
}

export default function AddExhibitorModal({
	eventId,
	onClose,
}: AddExhibitorModalProps) {
	const [activeTab, setActiveTab] = useState<"manual-add" | "group-add">(
		"manual-add",
	);

	return (
		<div className="relative flex flex-col justify-start gap-4 px-6 md:grid md:grid-cols-[200px_1fr] md:items-start md:gap-6">
			<AddExhibitorNavigation
				activeTab={activeTab}
				onTabChange={setActiveTab}
			/>
			<div className="flex flex-col gap-4">
				{activeTab === "manual-add" && (
					<ManualAddForm eventId={eventId} onClose={onClose} />
				)}
				{activeTab === "group-add" && (
					<GroupAddForm eventId={eventId} onClose={onClose} />
				)}
			</div>
		</div>
	);
}
