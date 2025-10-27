import { toast } from "sonner";

interface UseCopyToClipboardOptions {
	successMessage?: string;
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
	const { successMessage = "Copied to clipboard" } = options;

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(successMessage);
		} catch {
			toast.error("Failed to copy to clipboard");
		}
	};

	return { copyToClipboard };
}
