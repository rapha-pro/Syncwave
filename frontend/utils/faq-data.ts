import { successfulTransferPercent } from "./site";

import { FaqItemProps } from "@/types";

export const faqData: FaqItemProps[] = [
  {
    id: "is-service-free",
    question: "Is this service free?",
    answer: "Yes, Syncwave is completely free",
  },
  {
    id: "store-credentials",
    question: "Do you store my login credentials?",
    answer:
      "No, we use OAuth for authentication, which means we never see or store your passwords. We only request the minimum permissions needed to transfer your playlists.",
  },
  {
    id: "songs-not-found",
    question: "What if some songs aren't found?",
    answer: `We'll show you a list of any tracks that couldn't be matched, and provide suggestions for similar tracks when possible. Our match rate is typically ${successfulTransferPercent}% for most music.`,
  },
  // {
  //   id: 'multiple-playlists',
  //   question: 'Can I transfer multiple playlists at once?',
  //   answer: 'Absolutely! You can select as many playlists as you want to transfer in a single batch.'
  // }
];
