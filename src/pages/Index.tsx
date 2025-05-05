
import { GlobeDemo } from "@/components/GlobeDemo";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Interactive</span>
            <span className="block bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Global Visualization
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
            Explore worldwide data points with our interactive 3D globe. 
            Drag to rotate, zoom to explore, and discover global connections.
          </p>
        </div>

        <div className="mx-auto flex justify-center">
          <div className="relative h-[600px] w-full max-w-4xl">
            <GlobeDemo />
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Visualize Global Data with Ease
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
            Our interactive 3D globe provides an intuitive way to visualize and interact with 
            location data from around the world. Perfect for global analytics, travel tracking, 
            or international business mapping.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
