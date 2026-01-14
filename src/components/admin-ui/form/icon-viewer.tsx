import {
	AlertCircle,
	Award,
	Bot,
	Briefcase,
	Calendar,
	CheckCircle,
	FileText,
	Globe,
	Hash,
	Heart,
	HelpCircle,
	Image,
	Layout,
	ListChecks,
	MapPin,
	Megaphone,
	Mic,
	Settings,
	Star,
	Tag,
	Ticket,
	TicketCheck,
	TicketMinus,
	TicketPlus,
	TicketX,
	Users,
	Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ICON_OPTIONS = [
	{ value: "Calendar", label: "Calendar", icon: Calendar },
	{ value: "Users", label: "Users", icon: Users },
	{ value: "FileText", label: "File Text", icon: FileText },
	{ value: "Image", label: "Image", icon: Image },
	{ value: "Video", label: "Video", icon: Video },
	{ value: "Mic", label: "Mic", icon: Mic },
	{ value: "MapPin", label: "Map Pin", icon: MapPin },
	{ value: "Tag", label: "Tag", icon: Tag },
	{ value: "Hash", label: "Hash", icon: Hash },
	{ value: "Globe", label: "Globe", icon: Globe },
	{ value: "Briefcase", label: "Briefcase", icon: Briefcase },
	{ value: "Award", label: "Award", icon: Award },
	{ value: "Star", label: "Star", icon: Star },
	{ value: "Heart", label: "Heart", icon: Heart },
	{ value: "Megaphone", label: "Megaphone", icon: Megaphone },
	{ value: "Layout", label: "Layout", icon: Layout },
	{ value: "Settings", label: "Settings", icon: Settings },
	{ value: "CheckCircle", label: "Check Circle", icon: CheckCircle },
	{ value: "AlertCircle", label: "Alert Circle", icon: AlertCircle },
	{ value: "HelpCircle", label: "Help Circle", icon: HelpCircle },
	{ value: "Ticket", label: "Ticket", icon: Ticket },
	{ value: "TicketCheck", label: "Ticket Check", icon: TicketCheck },
	{ value: "TicketX", label: "Ticket X", icon: TicketX },
	{ value: "TicketPlus", label: "Ticket Plus", icon: TicketPlus },
	{ value: "TicketMinus", label: "Ticket Minus", icon: TicketMinus },
	{ value: "Bot", label: "Robot", icon: Bot },
	{ value: "ListChecks", label: "Checklist", icon: ListChecks },
] as const;

interface IconViewerProps {
	name: string | null | undefined;
	className?: string;
}

export function IconViewer({ name, className }: IconViewerProps) {
	if (!name) return null;
	const iconData = ICON_OPTIONS.find((opt) => opt.value === name);
	const Icon = iconData ? iconData.icon : HelpCircle; // Default fallback to HelpCircle if name exists but not found

	return <Icon className={cn("size-4", className)} />;
}
