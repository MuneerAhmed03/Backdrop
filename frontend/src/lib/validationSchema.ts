import { z } from "zod";

export const strategySchema = z.object({
  code: z.object({
    isValid: z.boolean(),
    error: z.object({
      message: z.string(),
      line: z.number()
    }).optional()
  }),
  instrument: z.object({
    symbol: z.string(),
    source_file: z.string(),
    start_date: z.string().nullable(),
    latest_date: z.string().nullable(),
    stock_name: z.string().nullable(),
    isEtf: z.boolean(),
  }).nullable().refine(
    (data)=> data !==null,
    {message: "Please Select an Instrument"}
  ),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional()
  }).refine((data) => data.from && data.to && data.from <= data.to, {
    message: "Please select a valid date range"
  }),
  initialCapital: z.number().positive("Initial capital must be greater than 0"),
  investmentPerTrade: z.number()
    .positive("Investment per trade must be greater than 0")
    .refine((val) => val <= 100000, {
      message: "Investment per trade must not exceed initial capital"
    })
});

export type StrategyValidation = z.infer<typeof strategySchema>; 