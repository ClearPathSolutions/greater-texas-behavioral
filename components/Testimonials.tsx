import Reveal from './ui/Reveal';
import { IconStar } from './ui/Icon';

/**
 * Representative testimonials.
 *
 * NOTE FOR THE SITE OWNER: The original site displayed a live Google-reviews
 * widget, so no verbatim quotes could be carried over. The entries below are
 * generic and are attributed without identifying details — replace them with
 * your real, consented client reviews (and honest attributions) before launch.
 */
const testimonials = [
  {
    quote:
      'Being able to get real treatment from home changed everything for me. I never had to choose between my job and my recovery — the structure kept me accountable every single week.',
    name: 'Virtual IOP Client',
    location: 'Houston, TX',
  },
  {
    quote:
      'The clinicians genuinely listened. They treated my anxiety and my drinking together instead of like two separate problems, and for the first time the progress actually stuck.',
    name: 'Virtual IOP Client',
    location: 'Austin, TX',
  },
  {
    quote:
      'We live hours from the nearest program, so telehealth was the only way this could happen. The admissions team handled our insurance and made a hard time so much easier.',
    name: 'Family Member of a Client',
    location: 'West Texas',
  },
];

export default function Testimonials() {
  return (
    <section className="section bg-cream-50">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">Real recovery</span>
          <h2 className="h-section mt-4">
            They trusted us with their recovery. So can you.
          </h2>
          <p className="lead mt-5">
            Stories from Texans who found structure, support, and lasting change
            through our Virtual IOP.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 110}>
              <figure className="card flex h-full flex-col p-7">
                <div className="flex gap-1 text-gold-400" role="img" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <IconStar key={s} className="h-5 w-5" />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-forest-900/90 leading-relaxed">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-cream-300 pt-4">
                  <span className="block font-semibold text-forest-900">
                    {t.name}
                  </span>
                  <span className="text-sm text-muted">{t.location}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
