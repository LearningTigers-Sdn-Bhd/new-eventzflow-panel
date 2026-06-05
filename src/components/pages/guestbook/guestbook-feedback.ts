import type { Wish } from "@/lib/api/wishes/response";

type WishStatus = Wish["status"];

export function getGuestbookSubmissionFeedback(status: WishStatus) {
	switch (status) {
		case "approved":
			return {
				title: "Wish posted",
				body: "Your wish has been posted and may already be visible on the wishes wall.",
				accentClassName: "border-emerald-100 bg-emerald-50/50 text-emerald-800",
			};
		case "pending":
			return {
				title: "Waiting for review",
				body: "Your wish was received and is waiting for review before it appears on the wishes wall.",
				accentClassName: "border-amber-100 bg-amber-50/60 text-amber-900",
			};
		case "rejected":
			return {
				title: "Wish not posted",
				body: "Your wish could not be posted. Please revise the message and try again.",
				accentClassName: "border-rose-100 bg-rose-50/60 text-rose-900",
			};
	}
}
