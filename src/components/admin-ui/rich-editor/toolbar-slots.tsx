export function ToolbarLeftSlot({ children }: { children: React.ReactNode }) {
	return <div className="flex items-center gap-1">{children}</div>;
}

export function ToolbarRightSlot({ children }: { children: React.ReactNode }) {
	return <div className="ml-auto flex items-center gap-1">{children}</div>;
}
