import { Navbar } from "@/components/appviews/navbar";
import { ConfirmationContent } from "@/components/appviews/potwierdzenie/ConfirmationContent";

export default function AppviewsConfirmationPage() {
  return (
    <>
      <Navbar />
      <ConfirmationContent appViewsCompact cardClassName="bg-default-50" wrapperClassName="px-4 sm:px-0 mt-4" />
    </>
  );
}
