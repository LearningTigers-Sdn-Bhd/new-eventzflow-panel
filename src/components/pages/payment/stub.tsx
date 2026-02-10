"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const DEFAULT_STATUS = "success";
const DEFAULT_REDIRECT = "/";

const getParamsObject = (params: URLSearchParams) => {
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};

const buildQueryString = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;
    searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const PaymentStub = () => {
  const searchParams = useSearchParams();

  const paramsObject = useMemo(
    () => getParamsObject(searchParams),
    [searchParams]
  );

  const status = paramsObject.status || DEFAULT_STATUS;
  const redirect = paramsObject.redirect || DEFAULT_REDIRECT;

  const passthroughParams = useMemo(() => {
    const { status: _status, ...rest } = paramsObject;
    return { ...rest, redirect };
  }, [paramsObject, redirect]);

  const goToStatus = (nextStatus: string) => {
    const query = buildQueryString(passthroughParams);
    window.location.assign(`/payment/${nextStatus}${query}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-12">
      <div className="border border-dashed border-neutral-300 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">Payment Stub</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Accepts any query params and forwards them to the status page.
        </p>
        <div className="mt-4 bg-neutral-50 p-3 text-sm text-neutral-700">
          <div>status: {status}</div>
          <div>redirect: {redirect}</div>
          <div>params: {JSON.stringify(paramsObject)}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => goToStatus("success")}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            Success
          </button>
          <button
            type="button"
            onClick={() => goToStatus("pending")}
            className="inline-flex items-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white"
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => goToStatus("failed")}
            className="inline-flex items-center rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white"
          >
            Failed
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStub;
