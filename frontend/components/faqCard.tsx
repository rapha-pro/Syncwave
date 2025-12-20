import { Card } from "@heroui/react";

import { FaqCardProps } from "@/types";

export default function FaqCard({ faq }: FaqCardProps) {
  return (
    <Card className="bg-gray-800/50 border border-gray-700 p-6">
      <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
      <p className="text-gray-400">{faq.answer}</p>
    </Card>
  );
}
