import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Container } from "./Container";

const faqs = [
  {
    question: "How does Zencart work with WhatsApp?",
    answer:
      "Your customers can browse your Zencart store, add products to their cart, and send the order details directly to the seller via WhatsApp. This streamlines the ordering process for both customers and merchants.",
  },
  {
    question: "What guarantees do I have?",
    answer:
      "The risk is all ours. If you don't like it or feel it's not for you, we'll refund your money in full within the first 7 days.",
  },
  {
    question: "Is there a limit to the number of products I can add?",
    answer:
      "No, you can add as many products as you want. The only limitation is on photos. Each store can have a maximum of 1000 photos. To purchase an additional 1000 photo package ($ 19.90 - one-time fee), please contact us.",
  },
  {
    question: "Is there a loyalty contract? Any hidden fees?",
    answer: "No, you purchase Zencart and it's yours. No hidden fees.",
  },
  {
    question: "Is there any limit to the number of orders I can receive?",
    answer:
      "No, you can receive as many orders as you like. We exist to help you thrive, the more orders the better!",
  },
  {
    question: "I lost my password. How can I recover it?",
    answer:
      "Actually, we don't use passwords. You can access your store using the email you registered with, plus the magic link we'll send to you. If you encounter any issues, please contact us.",
  },
];

export function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-gray-50 pb-10 sm:pb-24 sm:pt-24"
    >
      {/* <img
        className="absolute left-1/2 top-0 max-w-none -trangray-y-1/4 trangray-x-[-30%]"
        src={'/images/background-faqs.jpg'}
        alt=""
        width={1558}
        height={946}
      /> */}
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="text-3xl font-semibold tracking-tight text-gray-900"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-gray-700">
            Didn&#39;t find what you were looking for? Send us a hello and
            we&#39;ll help you out! 👋
          </p>
        </div>
        <Accordion className="mt-8" type="single" collapsible>
          {faqs.map(({ question, answer }, index: number) => (
            <AccordionItem
              className="last:border-b-0"
              value={`item-${index}`}
              key={index}
            >
              <AccordionTrigger className="text-left text-base text-gray-700">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-base">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
