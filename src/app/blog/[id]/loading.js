import LoadingScreen from "@/components/loading-screen";
import { Header } from "@/components/header";
import Footer from "@/components/footer";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <LoadingScreen message="Loading amazing content..." />
      </main>
      <Footer />
    </div>
  );
}
