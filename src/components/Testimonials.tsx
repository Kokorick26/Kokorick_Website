import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


interface Testimonial {
    id: string;
    name: string;
    role: string;
    company: string;
    content: string;
    avatarUrl?: string;
    companyLogoUrl?: string;
}

export function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    useEffect(() => {
        fetch('/api/reviews')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch testimonials');
                return res.json();
            })
            .then(data => {
                console.log('Fetched testimonials:', data);
                setTestimonials(data);
            })
            .catch(err => {
                console.error('Error loading testimonials:', err);
            });
    }, []);

    if (testimonials.length === 0) return null;

    // Ensure we have enough items for a smooth loop by repeating the list
    const displayTestimonials = testimonials.length > 0
        ? Array(6).fill(testimonials).flat()
        : [];

    return (
        <section className="py-16 md:py-32 bg-black text-white overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 mb-12 md:mb-20">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium">Trusted by Innovative Leaders</h2>
                    <p className="text-zinc-400">We partner with forward thinking companies to build production grade AI systems that drive real value. Here's what our clients say about working with us.</p>
                </div>
            </div>

            <div
                className="group relative flex w-full overflow-hidden"
                style={{
                    "--gap": "1.5rem",
                    "--duration": "80s", // Slower duration for longer list
                } as React.CSSProperties}
            >
                {/* First set of items */}
                <div className="flex shrink-0 items-stretch gap-[var(--gap)] animate-marquee group-hover:[animation-play-state:paused]">
                    {displayTestimonials.map((testimonial, i) => (
                        <TestimonialCard key={`${testimonial.id}-${i}`} testimonial={testimonial} />
                    ))}
                </div>

                {/* Second set of items for seamless loop */}
                <div className="flex shrink-0 items-stretch gap-[var(--gap)] animate-marquee group-hover:[animation-play-state:paused] ml-[var(--gap)]" aria-hidden="true">
                    {displayTestimonials.map((testimonial, i) => (
                        <TestimonialCard key={`${testimonial.id}-duplicate-${i}`} testimonial={testimonial} />
                    ))}
                </div>

                {/* Gradient fade on edges */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-black to-transparent z-10"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-black to-transparent z-10"></div>
            </div>
        </section>
    );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    return (
        <Card className="w-[350px] md:w-[400px] flex-shrink-0 bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800/80 transition-colors duration-300">
            <CardHeader>
                {/* Logo removed as per request */}
            </CardHeader>
            <CardContent className="h-full pt-6">
                <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                    <p className="text-lg font-medium leading-relaxed">
                        "{testimonial.content}"
                    </p>

                    <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                        <Avatar className="size-12 border border-white/10">
                            <AvatarImage
                                src={testimonial.avatarUrl}
                                alt={testimonial.name}
                                loading="lazy"
                            />
                            <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                {testimonial.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <cite className="text-sm font-medium not-italic text-white">{testimonial.name}</cite>
                            <span className="text-zinc-400 block text-sm">{testimonial.role}, {testimonial.company}</span>
                        </div>
                    </div>
                </blockquote>
            </CardContent>
        </Card>
    );
}
