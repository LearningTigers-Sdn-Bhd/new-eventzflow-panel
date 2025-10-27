"use client";

import { useState } from "react";
import CustomLabelForm from "./custom-label-form";
import InfoForm from "./info-form";
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
		<div className="relative flex flex-col justify-start gap-4 px-6 md:grid md:grid-cols-[200px_1fr] md:items-start md:gap-6">
			<SettingsNavigation
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onClose={onClose}
			/>
			<div className="flex flex-col gap-4">
				{activeTab === "event-information" && <InfoForm eventId={eventId} onClose={onClose} />}
				{activeTab === "custom-labels" && <CustomLabelForm eventId={eventId} onClose={onClose} />}
			</div>
		</div>
	);
}
