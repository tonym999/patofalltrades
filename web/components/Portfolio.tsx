import path from "path";
import fs from "fs/promises";
import Image from "next/image";

type BeforeAfterPair = {
  title: string;
  beforeAlt: string;
  afterAlt: string;
  beforeSrc: string;
  afterSrc: string;
};

const categoryDescriptions: Record<string, string> = {
  bedroom: "bedroom refurbishment",
  stairs: "staircase refurbishment",
};

function fromSlug(slug: string): string {
  return slug
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function describeProject(category: string): string {
  const description = categoryDescriptions[category] ?? `${category.replace(/-/g, " ")} project`;
  return fromSlug(description);
}

function buildProjectTitle(category: string, location: string, pair: string): string {
  const pairNumber = Number.parseInt(pair, 10);
  const pairSuffix = Number.isNaN(pairNumber) || pairNumber <= 1 ? "" : ` (Set ${pairNumber})`;
  return `${describeProject(category)} in ${fromSlug(location)}${pairSuffix}`;
}

function buildAltText(category: string, location: string, variant: "before" | "after"): string {
  const stateDescription = variant === "before" ? "before work begins" : "after completion";
  return `${describeProject(category)} in ${fromSlug(location)}, ${stateDescription}`;
}

const sourcePriority: Record<string, number> = {
  avif: 4,
  webp: 3,
  png: 2,
  jpg: 1,
  jpeg: 1,
};

async function discoverBeforeAfterPairs(): Promise<BeforeAfterPair[]> {
  const publicDir = path.join(process.cwd(), "public", "portfolio");

  async function safeReadDirectory(dirPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .sort((left, right) => left.localeCompare(right));
    } catch {
      return [];
    }
  }

  const categories = await safeReadDirectory(publicDir);

  const filenameRegex = /^(?:([a-z0-9-]+))-([a-z0-9-]+)-(\d{3})-(before|after)\.(?:avif|webp|jpg|jpeg|png)$/i;

  type PairAccumulator = {
    title: string;
    beforeAlt: string;
    afterAlt: string;
    beforeSrc?: string;
    afterSrc?: string;
    beforePriority?: number;
    afterPriority?: number;
    category?: string;
    location?: string;
  };
  const pairs: Record<string, PairAccumulator> = {};

  for (const category of categories) {
    const categoryDir = path.join(publicDir, category);
    let files: string[] = [];
    try {
      files = (await fs.readdir(categoryDir))
        .filter(f => filenameRegex.test(f))
        .sort((left, right) => left.localeCompare(right));
    } catch {
      // ignore
    }

    for (const file of files) {
      const match = file.match(filenameRegex);
      if (!match) continue;
      const [, matchedCategory, location, pair, variant] = match;
      const extension = path.extname(file).slice(1).toLowerCase();
      const priority = sourcePriority[extension] ?? 0;
      const key = `${matchedCategory}-${location}-${pair}`;
      const webPath = `/portfolio/${category}/${file}`;
      const title = buildProjectTitle(matchedCategory, location, pair);
      if (!pairs[key]) {
        pairs[key] = {
          title,
          beforeAlt: buildAltText(matchedCategory, location, "before"),
          afterAlt: buildAltText(matchedCategory, location, "after"),
          category,
          location,
        };
      }
      if (variant.toLowerCase() === "before" && (pairs[key].beforePriority ?? -1) < priority) {
        pairs[key].beforeSrc = webPath;
        pairs[key].beforePriority = priority;
      }
      if (variant.toLowerCase() === "after" && (pairs[key].afterPriority ?? -1) < priority) {
        pairs[key].afterSrc = webPath;
        pairs[key].afterPriority = priority;
      }
    }
  }

  return Object.values(pairs)
    .filter(p => p.beforeSrc && p.afterSrc)
    .map(p => ({
      title: p.title as string,
      beforeAlt: p.beforeAlt as string,
      afterAlt: p.afterAlt as string,
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
            <h3 className="text-3xl font-semibold text-center text-white mb-8 tracking-tight">{p.title}</h3>
            <div className="comparison-slider max-w-4xl mx-auto rounded-lg shadow-2xl relative">
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={p.beforeSrc}
                  alt={p.beforeAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  quality={75}
                  className="before-image object-cover"
                />
                <div className="after-image">
                  <Image
                    src={p.afterSrc}
                    alt={p.afterAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 896px"
                    quality={75}
                    className="after-image-content object-cover"
                  />
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
