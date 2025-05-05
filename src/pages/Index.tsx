
import { Globe } from "@/components/ui/globe";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="relative h-[600px] w-[600px]">
        <Globe />
      </div>
    </div>
  );
};

export default Index;
