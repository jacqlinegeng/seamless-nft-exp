import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import React, { useEffect, useState } from "react";

const Form = () => {
  const [isLoading, setIsLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const URL = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";
  const [message, setMessage] = useState<null | string | undefined>(null);
  const [isSuccess, setIsSuccess] = useState(false);


  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setIsSuccess(true);
          setMessage("Your payment was successfull!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return console.error("not loaded");
    }

    setIsLoading(true);

    await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: URL,
      },
    });

    setIsLoading(false);
  };

  return (
    <>
      {message ? (
        <>
          {isSuccess && (
            <a
              href="https://testnets.opensea.io/assets/mumbai/0x247a0AaEd6afaCC3a80662FD9d21e4455a83CCFb/0"
              target="_blank"
              rel="noreferrer"
            >
              Check out your NFT
            </a>
          )}
          <h1>{message}</h1>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <PaymentElement />
          <button disabled={isLoading || !stripe || !elements}>
            <span>{isLoading ? "Loading..." : "Pay now"}</span>
          </button>
        </form>
      )}
    </>
  );
};

export default Form;