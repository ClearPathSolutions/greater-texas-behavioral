import Image from 'next/image';

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image: string;
  imageAlt?: string;
  align?: 'center' | 'left';
};

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  imageAlt = '',
  align = 'center',
}: PageHeroProps) {
  const alignCls =
    align === 'center' ? 'mx-auto text-center items-center' : 'text-left items-start';
  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-forest-950/70" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(12,36,24,0.55) 0%, rgba(12,36,24,0.35) 40%, rgba(12,36,24,0.8) 100%)',
        }}
      />
      <div className="container-x relative">
        <div
          className={`flex max-w-3xl flex-col ${alignCls} pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-24`}
        >
          {eyebrow && (
            <span className="eyebrow text-gold-300 before:bg-gold-300">
              {eyebrow}
            </span>
          )}
          <h1 className="h-display mt-4 text-cream-50">{title}</h1>
          {subtitle && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-100/85 sm:text-xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
