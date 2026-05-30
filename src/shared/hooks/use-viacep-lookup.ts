"use client";

import { useRef, useState, useEffect, useCallback } from "react";

import { onlyDigits } from "@/shared/lib/formatters";
import {
  ViaCepError,
  fetchViaCepAddress,
  type ViaCepAddress,
  type ViaCepErrorKind,
} from "@/shared/lib/viacep";

export type ViaCepLookupStatus = "idle" | "loading" | "success" | "error";

export type ViaCepLookupError = {
  kind: ViaCepErrorKind;
  message: string;
};

export type UseViaCepLookupReturn = {
  status: ViaCepLookupStatus;
  error: ViaCepLookupError | null;
  lastCep: string | null;
  lookup: (rawCep: string) => Promise<ViaCepAddress | null>;
  reset: () => void;
};

export function useViaCepLookup(): UseViaCepLookupReturn {
  const [status, setStatus] = useState<ViaCepLookupStatus>("idle");
  const [error, setError] = useState<ViaCepLookupError | null>(null);
  const [lastCep, setLastCep] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<{ cep: string; data: ViaCepAddress } | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("idle");
    setError(null);
    setLastCep(null);
    cacheRef.current = null;
  }, []);

  const lookup = useCallback(
    async (rawCep: string): Promise<ViaCepAddress | null> => {
      const digits = onlyDigits(rawCep);

      if (cacheRef.current?.cep === digits) {
        return cacheRef.current.data;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");
      setError(null);

      try {
        const data = await fetchViaCepAddress(digits, controller.signal);
        if (controller.signal.aborted) return null;
        cacheRef.current = { cep: digits, data };
        setLastCep(digits);
        setStatus("success");
        return data;
      } catch (err) {
        if (controller.signal.aborted) return null;
        if (err instanceof DOMException && err.name === "AbortError") {
          return null;
        }
        const lookupError: ViaCepLookupError =
          err instanceof ViaCepError
            ? { kind: err.kind, message: err.message }
            : {
                kind: "network",
                message: "Não foi possível consultar o CEP. Tente novamente.",
              };
        setLastCep(digits);
        setError(lookupError);
        setStatus("error");
        return null;
      }
    },
    [],
  );

  return { status, error, lastCep, lookup, reset };
}
