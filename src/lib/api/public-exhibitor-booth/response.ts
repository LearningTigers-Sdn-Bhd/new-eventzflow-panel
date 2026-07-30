export type PublicExhibitorBooth = {
	id: number;
	number: string;
};

export type PublicExhibitorBoothsResponse = {
	success: boolean;
	data: PublicExhibitorBooth[];
};
