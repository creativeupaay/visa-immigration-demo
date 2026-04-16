



  export const currencyConversion = async (
      from: string,
      to: string,
      amount: number
    ): Promise<number | null> => {
      try {
        // changed url
        // https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD
        const response = await fetch(
          `https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`
        );
    
        if (!response.ok) {
          throw new Error("Failed to fetch exchange rate.");
        }
    
        const data = await response.json();
        const rate = data.rates[to];
    
        if (!rate) {
          throw new Error(`Exchange rate for ${to} not found.`);
        }
    
        const convertedAmount = amount * rate;
        return +convertedAmount.toFixed(2);
      } catch (error) {
        console.error("Currency conversion error:", error);
        return null;
      }
    };
    