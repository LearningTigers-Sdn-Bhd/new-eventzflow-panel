import type { BaseLocation } from "../columns";
import InfoForm from "./info-form";

interface LocationSettingsDialogProps {
	location: BaseLocation;
	onClose?: () => void;
}

export default function LocationSettingsDialog({
	location,
}: LocationSettingsDialogProps) {
	return (
		<div className="flex flex-col gap-4">
			<InfoForm locationId={location.id} />
		</div>
	);
}
