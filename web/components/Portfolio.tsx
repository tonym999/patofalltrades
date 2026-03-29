import { getPortfolioItems } from "@/lib/portfolio";
import CompareSlider from "./CompareSliderDynamic";

export default async function Portfolio() {
  const items = await getPortfolioItems();

  if (items.length === 0) {
    return null;
  }

  return (
    <section id="portfolio" className="py-24 md:py-40 bg-dark-navy/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Our Work</h2>
          <p className="text-lg text-gray-300/90 mt-4">Quality you can see. Results that last.</p>
        </div>

        {items.map((p, i) => (
          <div key={i} className="mb-20">
            <h3 className="text-3xl font-semibold text-center text-white mb-8 tracking-tight">{p.title}</h3>
            <div className="max-w-4xl mx-auto">
              <CompareSlider
                beforeSrc={p.beforeSrc}
                afterSrc={p.afterSrc}
                beforeAlt={p.beforeAlt}
                afterAlt={p.afterAlt}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
