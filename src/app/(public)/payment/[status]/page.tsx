"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

const DEFAULT_REDIRECT = "/";

const getParamsObject = (params: URLSearchParams) => {
	const result: Record<string, string> = {};

	params.forEach((value, key) => {
		result[key] = value;
	});

	return result;
};

const getStatusValue = (rawStatus: string | string[] | undefined) => {
	if (Array.isArray(rawStatus)) return rawStatus[0] || "";
	return rawStatus || "";
};

const getStatusStyles = (status: string) => {
	const normalized = status.toLowerCase();

	if (normalized === "success") {
		return "border-emerald-200 bg-emerald-50 text-emerald-900";
	}

	if (normalized === "failed") {
		return "border-rose-200 bg-rose-50 text-rose-900";
	}

	if (normalized === "pending") {
		return "border-amber-200 bg-amber-50 text-amber-900";
	}

	return "border-neutral-200 bg-neutral-50 text-neutral-900";
};

const PaymentStatusPage = () => {
	const params = useParams();
	const searchParams = useSearchParams();

	const statusParam = getStatusValue(
		params?.status as string | string[] | undefined,
	);
	const paramsObject = useMemo(
		() => getParamsObject(searchParams),
		[searchParams],
	);
	const status = statusParam || paramsObject.status || "unknown";
	const redirect = paramsObject.redirect || DEFAULT_REDIRECT;
	const statusStyles = getStatusStyles(status);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			window.location.assign(redirect);
		}, 5000);

		return () => clearTimeout(timeoutId);
	}, [redirect]);

	return (
		<div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-12">
		<div className={`border border-dashed p-6 shadow-sm ${statusStyles}`}>
			<h1 className="text-xl font-semibold text-neutral-900">
				Payment Status
			</h1>
				<p className="mt-2 text-sm text-neutral-600">
					You will be redirected in 5 seconds.
				</p>
			<div className="mt-4 bg-neutral-50 p-3 text-sm text-neutral-700">
				<div>status: {status}</div>
				<div>redirect: {redirect}</div>
				<div>params: {JSON.stringify(paramsObject)}</div>
			</div>
			</div>
		</div>
	);
};

export default PaymentStatusPage;
