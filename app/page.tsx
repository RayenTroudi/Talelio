
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import FeaturedProductsSection from "./components/FeaturedProductsSection"
import CategoriesSection from "./components/CategoriesSection"
import Footer from "./components/Footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedProductsSection />
      <CategoriesSection />
      <Footer />
    </>
  );
}
