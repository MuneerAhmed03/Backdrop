import { useState } from "react";
import { strategySchema, StrategyValidation } from "./validationSchema";
import { z } from "zod";

export function useStrategyValidation() {
  const [validationErrors, setValidationErrors] = useState<z.ZodError | null>(null);
  const [validationState, setValidationState] = useState<Partial<StrategyValidation>>({
    code: { isValid: true },
  });

  const updateCodeValidation = (result: { isValid: boolean; error?: { message: string; line: number } }) => {
    setValidationState((prev) => ({
      ...prev,
      code: result,
    }));
  };

  const validateStrategy = (newState: Partial<StrategyValidation>) => {
    const updatedState = { ...validationState, ...newState };
    try {
      strategySchema.parse(updatedState);
      setValidationErrors(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors(error);
      }
    }
    setValidationState(updatedState);
  };

  return {
    isValid: !validationErrors,
    errors: validationErrors?.errors.map((error) => `${error.message} (${error.path.join(".")})`) || [],
    validateStrategy,
    updateCodeValidation,
  };
}
