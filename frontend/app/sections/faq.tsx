import { faqData } from "@/utils/faq-data";
import FaqCard from "@/components/faqCard";

export default function Faq() {
  return (
    <section className="py-20 bg-black" id="faq">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-6">
          {faqData.map((faq) => (
            <FaqCard key={faq.id} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
