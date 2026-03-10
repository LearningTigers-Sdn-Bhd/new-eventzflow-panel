export interface Wish {
	id: number;
	guest_name: string;
	message: string;
	status: "pending" | "approved" | "rejected";
	approved_at: string | null;
	created_at: string;
}

export interface WishResponse {
	wish: Wish;
}

export interface WishListResponse {
	wishes: Wish[];
}
