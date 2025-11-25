import { Navbar } from "@/components/appviews/navbar";
import { HelpForm } from "@/components/appviews/pomoc/HelpForm";

export default function AppviewsHelpPage() {
  return (
    <>
      <Navbar />
      <HelpForm cardClassName="bg-default-50" wrapperClassName="px-4 sm:px-0 mt-4" />
    </>
  );
}
