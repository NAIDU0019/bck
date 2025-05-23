
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>Our Story - ADHYAA PICKLES</title>
        <meta name="description" content="Learn about ADHYAA PICKLES' journey, our commitment to quality, and the tradition behind our authentic pickle recipes." />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          {/* Hero section */}
          <div className="hero-pattern py-16">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Our Story
              </h1>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                A journey of flavors, traditions, and a passion for authentic taste.
              </p>
            </div>
          </div>

          {/* About content */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                <div>
                  <h2 className="text-3xl font-display font-bold mb-6">
                    The Heritage of ADHYAA PICKLES
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Founded in 2025, ADHYAA PICKLES began as a small family business with a mission to preserve the authentic taste of traditional Indian pickles. What started as a passion project in our home kitchen has now grown into a beloved brand trusted by customers across the country.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Our recipes have been passed down through generations, carefully preserved and perfected over time. Each jar of ADHYAA PICKLES carries the rich legacy of traditional pickling methods combined with the highest standards of quality and food safety.
                  </p>
                  <p className="text-muted-foreground">
                    We take pride in offering both vegetarian and non-vegetarian pickles, catering to diverse tastes while maintaining the authentic flavors that make Indian pickles a cherished accompaniment to meals.
                  </p>
                </div>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?auto=format&fit=crop&w=800&q=80"
                    alt="Heritage of ADHYAA PICKLES"
                    className="rounded-lg shadow-lg"
                  />
                  <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-pickle-100 rounded-full -z-10 hidden md:block"></div>
                </div>
              </div>

              <Separator className="my-16" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                <div className="order-2 lg:order-1 relative">
                  <img
                    src="https://images.unsplash.com/photo-1513135467880-6c41603e6179?auto=format&fit=crop&w=800&q=80"
                    alt="Our Ingredients"
                    className="rounded-lg shadow-lg"
                  />
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-spice-100 rounded-full -z-10 hidden md:block"></div>
                </div>
                <div className="order-1 lg:order-2">
                  <h2 className="text-3xl font-display font-bold mb-6">
                    Our Ingredients & Process
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Quality begins with the finest ingredients. We carefully source fresh produce, premium meats, and aromatic spices from trusted suppliers who share our commitment to excellence.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Our pickling process follows time-honored traditions while adhering to modern food safety standards. Each batch is prepared in small quantities to ensure careful monitoring and consistent quality.
                  </p>
                  <p className="text-muted-foreground">
                    We use natural preservation methods and avoid artificial additives, ensuring that what you taste is pure, authentic flavor that enhances your dining experience.
                  </p>
                </div>
              </div>

              <Separator className="my-16" />

              <div className="text-center mb-16">
                <h2 className="text-3xl font-display font-bold mb-6">
                  Our Values
                </h2>
                <p className="text-muted-foreground max-w-3xl mx-auto mb-12">
                  At ADHYAA PICKLES, our business is built on values that reflect our commitment to quality, tradition, and customer satisfaction.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-lg shadow-sm">
                    <h3 className="text-xl font-display font-semibold mb-4">
                      Quality
                    </h3>
                    <p className="text-muted-foreground">
                      We never compromise on the quality of our ingredients or our process. Every jar of ADHYAA PICKLES meets our exacting standards before it reaches your table.
                    </p>
                  </div>
                  <div className="bg-white p-8 rounded-lg shadow-sm">
                    <h3 className="text-xl font-display font-semibold mb-4">
                      Tradition
                    </h3>
                    <p className="text-muted-foreground">
                      We honor the traditional recipes and methods that have been perfected over generations, preserving the authentic taste of Indian pickles.
                    </p>
                  </div>
                  <div className="bg-white p-8 rounded-lg shadow-sm">
                    <h3 className="text-xl font-display font-semibold mb-4">
                      Innovation
                    </h3>
                    <p className="text-muted-foreground">
                      While respecting tradition, we continuously explore new flavors and combinations to create unique pickle experiences for our customers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-pickle-100 p-8 md:p-16 rounded-lg text-center">
                <h2 className="text-3xl font-display font-bold mb-6">
                  From Our Kitchen to Your Table
                </h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  We're more than just a pickle company – we're preserving a tradition and sharing the authentic flavors of India with food lovers everywhere. Every jar of ADHYAA PICKLES carries our commitment to quality and our passion for taste.
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AboutPage;
