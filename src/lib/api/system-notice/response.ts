export interface SystemNotice {
	message: string;
	active: boolean;
}

export interface BackendSystemNoticeResponse {
	data: SystemNotice;
}

export interface BackendPublicSystemNoticeResponse {
	data: { message: string | null };
}
