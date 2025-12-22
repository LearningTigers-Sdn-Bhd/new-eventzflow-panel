"use client";

import { useState } from "react";
import CustomLabelForm from "./edit-custom-label-form";
import InfoForm from "./edit-info-form";
import SettingsNavigation from "./navigation";

interface EventSettingsDialogProps {
	eventId: number;
	onClose?: () => void;
}

export default function EventSettingsDialog({
	eventId,
	onClose,
}: EventSettingsDialogProps) {
	const [activeTab, setActiveTab] = useState<
		"event-information" | "custom-labels"
	>("event-information");

	return (
		<div className="relative flex flex-col gap-4 px-4 md:grid md:grid-cols-[200px_1fr] md:items-start md:gap-6 md:px-6">
			<SettingsNavigation
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onClose={onClose}
			/>
			<div className="flex min-h-0 w-full flex-1 flex-col gap-4">
				{activeTab === "event-information" && (
					<InfoForm eventId={eventId} onClose={onClose} />
				)}
				{activeTab === "custom-labels" && (
					<CustomLabelForm eventId={eventId} onClose={onClose} />
				)}
			</div>
		</div>
	);
}
