import { Lock } from "lucide-react";
import { EmptyState } from "@/components/data-state";

type FeatureLockedAudience = {
	isEventVendor?: boolean;
	isVendor?: boolean;
	isOrganizer?: boolean;
	isOrgOwner?: boolean;
	isEventStaff?: boolean;
	isEventAdmin?: boolean;
	isExhibitionContractor?: boolean;
};

export function getFeatureLockedMessage(audience: FeatureLockedAudience) {
	if (audience.isEventVendor || audience.isVendor) {
		return {
			title: "Feature unavailable",
			description:
				"This feature is not available for this event at the moment. Please contact the event organizer for assistance.",
		};
	}

	return {
		title: "Feature unavailable",
		description:
			"This feature is not included in your current subscription for this event. Please contact your administrator to upgrade access.",
	};
}

type FeatureLockedStateProps = FeatureLockedAudience & {
	featureName?: string;
	action?: React.ReactNode;
};

export function FeatureLockedState({
	action,
	featureName: _featureName,
	...audience
}: FeatureLockedStateProps) {
	const message = getFeatureLockedMessage(audience);

	return (
		<EmptyState
			icon={<Lock className="h-10 w-10" />}
			title={message.title}
			description={message.description}
			action={action}
			height="h-[50vh]"
		/>
	);
}
