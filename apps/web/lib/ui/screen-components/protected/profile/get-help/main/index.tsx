"use client";

// Support tickets aren't part of our API, so Help is FAQs only for now (the
// stock "chat with a person" ticket flow is removed).

import TextComponent from "@/lib/ui/useable-components/text-field";
import { Accordion, AccordionTab } from "primereact/accordion";
import { useQuery } from "@apollo/client";
import { GET_USER_PROFILE } from "@/lib/api/graphql";
import { useTranslations } from "next-intl";

export default function GetHelpMain() {
  const t = useTranslations();

  const { data: profileData } = useQuery(GET_USER_PROFILE, {
    fetchPolicy: "cache-and-network",
  });
  const userName = profileData?.profile?.name || "User";

  const faqItems = [
    {
      header: t("faq_track_order_header"),
      content: t("faq_track_order_content"),
    },
    {
      header: t("faq_delivery_time_header"),
      content: t("faq_delivery_time_content"),
    },
    {
      header: t("faq_cancel_order_header"),
      content: t("faq_cancel_order_content"),
    },
    {
      header: t("faq_feedback_header"),
      content: t("faq_feedback_content"),
    },
    {
      header: t("faq_multiple_places_header"),
      content: t("faq_multiple_places_content"),
    },
  ];

  return (
    <div className="w-full mx-auto">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm mb-6">
        <div className="mb-6">
          <TextComponent
            text={` ${t("hi_label")} ${userName} 👋`}
            className="text-xl md:text-2xl font-bold mb-2 dark:text-gray-100"
          />
          <TextComponent
            text={t("how_can_we_help_label")}
            className="text-2xl md:text-3xl font-bold dark:text-gray-100"
          />
        </div>

        <Accordion
          className="w-full"
          pt={{
            root: { className: "dark:bg-gray-800 dark:text-white rounded-lg" }, // outer container
          }}
        >
          {faqItems.map((item, index) => (
            <AccordionTab
              key={index}
              header={
                <span className="text-base md:text-lg font-medium dark:text-gray-200">
                  {item.header}
                </span>
              }
              pt={{
                header: { className: "dark:bg-gray-800" }, // wrapper of the clickable header
                headerAction: {
                  className:
                    "  dark:bg-gray-800 dark:white dark:hover:bg-gray-700 focus:outline-none focus:ring-0",
                }, // the clickable element
                headerIcon: { className: "dark:text-white" }, // chevron icon color
                content: { className: "dark:bg-gray-800 dark:text-gray-200" }, // content panel
              }}
            >
              <div className="p-3">
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-200">
                  {item.content}
                </p>
              </div>
            </AccordionTab>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
