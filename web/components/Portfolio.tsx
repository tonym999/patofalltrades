import path from "path";
import fs from "fs/promises";
import Image from "next/image";

type BeforeAfterPair = {
  title: string;
  alt: string;
  beforeSrc: string;
  afterSrc: string;
};

async function discoverBeforeAfterPairs(): Promise<BeforeAfterPair[]> {
  const publicDir = path.join(process.cwd(), "public", "portfolio");

  async function safeReadDirectory(dirPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries.filter(e => e.isDirectory()).map(e => e.name);
    } catch {
      return [];
    }
  }

  const categories = await safeReadDirectory(publicDir);

  const filenameRegex = /^(?:([a-z0-9-]+))-([a-z0-9-]+)-(\d{3})-(before|after)\.(?:jpg|jpeg|png|webp)$/i;

  type PairAccumulator = {
    title: string;
    alt: string;
    beforeSrc?: string;
    afterSrc?: string;
    category?: string;
    location?: string;
  };
  const pairs: Record<string, PairAccumulator> = {};

  for (const category of categories) {
    const categoryDir = path.join(publicDir, category);
    let files: string[] = [];
    try {
      files = (await fs.readdir(categoryDir)).filter(f => filenameRegex.test(f));
    } catch {
      // ignore
    }

    for (const file of files) {
      const match = file.match(filenameRegex);
      if (!match) continue;
      const [, matchedCategory, location, pair, variant] = match;
      const key = `${matchedCategory}-${location}-${pair}`;
      const webPath = `/portfolio/${category}/${file}`;
      const title = `${matchedCategory.replace(/-/g, " ")}: ${location.replace(/-/g, " ")} #${pair}`;
      if (!pairs[key]) pairs[key] = { title, alt: `${category} in ${location}`, category, location };
      if (variant.toLowerCase() === "before") pairs[key].beforeSrc = webPath;
      else pairs[key].afterSrc = webPath;
    }
  }

  return Object.values(pairs)
    .filter(p => p.beforeSrc && p.afterSrc)
    .map(p => ({
      title: p.title as string,
      alt: p.alt as string,
      beforeSrc: p.beforeSrc as string,
      afterSrc: p.afterSrc as string,
    }));
}

export default async function Portfolio() {
  const items = await discoverBeforeAfterPairs();

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
            <h3 className="text-3xl font-semibold text-center text-white mb-8 tracking-tight capitalize">{p.title}</h3>
            <div className="comparison-slider max-w-4xl mx-auto rounded-lg shadow-2xl relative">
              <div className="relative w-full aspect-[16/9]">
                <Image src={p.beforeSrc} alt={`${p.alt} (before)`} fill sizes="(max-width: 1280px) 100vw, 1280px" className="before-image object-cover" />
                <div className="after-image">
                  <Image src={p.afterSrc} alt={`${p.alt} (after)`} fill sizes="(max-width: 1280px) 100vw, 1280px" className="after-image-content object-cover" />
                </div>
              </div>
              <div className="slider-handle"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


